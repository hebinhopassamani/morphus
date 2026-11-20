using System.Data;
using System.Data.Common;
using System.Diagnostics;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using Mpx.Core.Entities;
using Mpx.Core.Interfaces;
using Mpx.Domain.Entities;

namespace Mpx.Jarbass.Security;

public sealed record FrozenEfParameter(
    string Name,
    DbType DbType,
    string? ClrTypeName,
    string? RawValueJson,
    bool IsNull);

public sealed record FrozenEfCommandEnvelope(
    string CommandText,
    List<FrozenEfParameter> Parameters,
    DateTime FrozenTrustedUtc,
    string IntegrityHash);

public sealed record JarbassPreExecutionApproval(
    Guid SyncEventId,
    long SequenceNumber,
    bool ApprovedToExecuteOnEntity,
    string? RejectionReason,
    JarbassSyncEvent PreparedEvent);

public sealed class JarbassExecutionCoordinator(
    JarbassTimeGuard timeGuard,
    JarbassFileVaultGuardian cryptoGuardian)
{
  private long _sequenceCounter = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
  private const string SealSecret = "Morphus#Jarbass#ExecutionCoordinator#2026!";

  private static readonly JsonSerializerOptions SafeJsonOptions = new()
  {
    ReferenceHandler = ReferenceHandler.IgnoreCycles,
    DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
  };

  /// <summary>
  /// Congela o DbCommand EXATO gerado pelo Entity Framework aqui na ponta do Jarbass
  /// (comando SQL + todos os parâmetros @p0, @p1 tipados e datas cravadas), garantindo que
  /// quando for executado no Servidor o SQL e os valores sejam 100% idênticos bit-a-bit!
  /// </summary>
  public (string CommandText, string FrozenParametersJson, string EncryptedCommandSeal) FreezeExactEfCommand(DbCommand command)
  {
    var sql = command.CommandText?.Trim() ?? string.Empty;
    var stamp = timeGuard.StampEvent($"FREEZE_SQL|{sql}");
    var frozenParams = new List<FrozenEfParameter>(command.Parameters.Count);

    foreach (DbParameter p in command.Parameters)
    {
      var isNull = p.Value is null || p.Value == DBNull.Value;
      object? val = isNull ? null : p.Value;

      // Se o relógio da máquina local estava adulterado e o parâmetro é uma data recém-gerada,
      // congela a data exata auditada para nunca dar diferença de 1 minuto lá no servidor!
      if (stamp.ClockTampered && val is DateTime dtVal && Math.Abs((dtVal.ToUniversalTime() - stamp.ReportedDeviceUtc).TotalMinutes) < 5)
      {
        val = stamp.TrustedOccurredAtUtc;
        p.Value = val;
      }

      frozenParams.Add(new FrozenEfParameter(
          Name: p.ParameterName,
          DbType: p.DbType,
          ClrTypeName: val?.GetType().FullName,
          RawValueJson: isNull ? null : JsonSerializer.Serialize(val, SafeJsonOptions),
          IsNull: isNull));
    }

    var paramsJson = JsonSerializer.Serialize(frozenParams, SafeJsonOptions);
    var integrityHash = cryptoGuardian.ComputeSha256($"{sql}|{paramsJson}|{stamp.TrustedOccurredAtUtc:O}");

    var envelope = new FrozenEfCommandEnvelope(
        CommandText: sql,
        Parameters: frozenParams,
        FrozenTrustedUtc: stamp.TrustedOccurredAtUtc,
        IntegrityHash: integrityHash);

    var envelopeBytes = Encoding.UTF8.GetBytes(JsonSerializer.Serialize(envelope, SafeJsonOptions));
    var encryptedSeal = cryptoGuardian.EncryptContentAesGcm(envelopeBytes, SealSecret);

    return (sql, paramsJson, encryptedSeal);
  }

  /// <summary>
  /// Executa no Servidor o EXATO mesmo comando SQL e os EXATOS mesmos parâmetros (@p0, @p1...)
  /// congelados pelo Entity na ponta do Jarbass, sem gerar data nova nem SQL diferente!
  /// </summary>
  public async Task<int> ReplayExactFrozenCommandOnServerAsync(
      DbConnection serverConnection,
      DbTransaction? activeTransaction,
      JarbassSyncEvent syncEvent,
      CancellationToken cancellationToken = default)
  {
    if (string.IsNullOrWhiteSpace(syncEvent.PayloadJson))
    {
      throw new InvalidOperationException("Evento de sincronização não contém envelope SQL congelado.");
    }

    var sw = Stopwatch.StartNew();
    syncEvent.ExecutionStartedAtUtc = DateTime.UtcNow;

    try
    {
      var decryptedBytes = cryptoGuardian.DecryptContentAesGcm(syncEvent.PayloadJson, SealSecret);
      var envelope = JsonSerializer.Deserialize<FrozenEfCommandEnvelope>(
          Encoding.UTF8.GetString(decryptedBytes),
          SafeJsonOptions)
          ?? throw new InvalidOperationException("Falha ao deserializar envelope SQL congelado do Jarbass.");

      var paramsJson = JsonSerializer.Serialize(envelope.Parameters, SafeJsonOptions);
      var expectedHash = cryptoGuardian.ComputeSha256($"{envelope.CommandText}|{paramsJson}|{envelope.FrozenTrustedUtc:O}");

      if (!string.Equals(expectedHash, envelope.IntegrityHash, StringComparison.OrdinalIgnoreCase))
      {
        throw new InvalidOperationException("[Jarbass Security] Assinatura do comando SQL congelado inválida! O comando foi adulterado.");
      }

      if (serverConnection.State != ConnectionState.Open)
      {
        await serverConnection.OpenAsync(cancellationToken);
      }

      await using var cmd = serverConnection.CreateCommand();
      cmd.CommandText = envelope.CommandText;
      cmd.Transaction = activeTransaction;

      foreach (var fp in envelope.Parameters)
      {
        var dbParam = cmd.CreateParameter();
        dbParam.ParameterName = fp.Name;
        dbParam.DbType = fp.DbType;
        dbParam.Value = RehydrateFrozenParameterValue(fp);
        cmd.Parameters.Add(dbParam);
      }

      var rows = await cmd.ExecuteNonQueryAsync(cancellationToken);
      sw.Stop();
      ConfirmEntityResult(syncEvent, entitySucceeded: true, durationMs: sw.ElapsedMilliseconds, rowsAffected: rows);
      return rows;
    }
    catch (Exception ex)
    {
      sw.Stop();
      ConfirmEntityResult(syncEvent, entitySucceeded: false, durationMs: sw.ElapsedMilliseconds, rowsAffected: 0, errorMessage: ex.Message);
      throw;
    }
  }

  private static object RehydrateFrozenParameterValue(FrozenEfParameter fp)
  {
    if (fp.IsNull || string.IsNullOrWhiteSpace(fp.RawValueJson))
      return DBNull.Value;

    return fp.ClrTypeName switch
    {
      "System.Guid" => JsonSerializer.Deserialize<Guid>(fp.RawValueJson),
      "System.DateTime" => JsonSerializer.Deserialize<DateTime>(fp.RawValueJson),
      "System.DateTimeOffset" => JsonSerializer.Deserialize<DateTimeOffset>(fp.RawValueJson),
      "System.Boolean" => JsonSerializer.Deserialize<bool>(fp.RawValueJson),
      "System.Int32" => JsonSerializer.Deserialize<int>(fp.RawValueJson),
      "System.Int64" => JsonSerializer.Deserialize<long>(fp.RawValueJson),
      "System.Decimal" => JsonSerializer.Deserialize<decimal>(fp.RawValueJson),
      "System.Double" => JsonSerializer.Deserialize<double>(fp.RawValueJson),
      _ => JsonSerializer.Deserialize<string>(fp.RawValueJson) ?? (object)DBNull.Value
    };
  }

  /// <summary>
  /// Aceita QUALQUER entidade MpxEntity, gera o evento genérico no Jarbass PRIMEIRO (Synced = false),
  /// dá o aval para o Entity executar, mede quanto tempo levou (ms) e pergunta "Conseguiu?" -> true/false.
  /// </summary>
  public async Task<JarbassSyncEvent> CoordinateEntityExecutionAsync<TEntity>(
      TEntity entity,
      string operation,
      Guid jarbassAgentId,
      Func<CancellationToken, Task<int>> entityExecutionAction,
      DbCommand? exactEfCommand = null,
      string? tableName = null,
      Guid? userId = null,
      Guid? parentSyncEventId = null,
      Guid? transactionGroupId = null,
      string? uniqueKeyName = null,
      string? uniqueKeyValue = null,
      string executionChannel = "DirectEntity",
      string? sourceEndpoint = null,
      string? ipAddress = null,
      bool blockOnClockTampering = false,
      CancellationToken cancellationToken = default)
      where TEntity : MpxEntity
  {
    string? efSql = null;
    string? efParams = null;
    string? frozenSeal = null;

    if (exactEfCommand is not null)
    {
      (efSql, efParams, frozenSeal) = FreezeExactEfCommand(exactEfCommand);
    }

    var approval = PrepareForEntity(
        entity: entity,
        operation: operation,
        jarbassAgentId: jarbassAgentId,
        tableName: tableName,
        userId: userId,
        parentSyncEventId: parentSyncEventId,
        transactionGroupId: transactionGroupId,
        uniqueKeyName: uniqueKeyName,
        uniqueKeyValue: uniqueKeyValue,
        efCommandText: efSql,
        efParametersJson: efParams,
        preSealedEnvelope: frozenSeal,
        executionChannel: executionChannel,
        sourceEndpoint: sourceEndpoint,
        ipAddress: ipAddress,
        blockOnClockTampering: blockOnClockTampering);

    var syncEvent = approval.PreparedEvent;
    if (!approval.ApprovedToExecuteOnEntity)
    {
      return syncEvent;
    }

    var sw = Stopwatch.StartNew();
    syncEvent.ExecutionStartedAtUtc = DateTime.UtcNow;

    try
    {
      var rowsAffected = await entityExecutionAction(cancellationToken);
      sw.Stop();
      ConfirmEntityResult(syncEvent, entitySucceeded: true, durationMs: sw.ElapsedMilliseconds, rowsAffected: rowsAffected);
    }
    catch (Exception ex)
    {
      sw.Stop();
      ConfirmEntityResult(syncEvent, entitySucceeded: false, durationMs: sw.ElapsedMilliseconds, rowsAffected: 0, errorMessage: ex.Message);
    }

    return syncEvent;
  }

  public JarbassPreExecutionApproval PrepareForEntity<TEntity>(
      TEntity entity,
      string operation,
      Guid jarbassAgentId,
      string? tableName = null,
      Guid? userId = null,
      Guid? parentSyncEventId = null,
      Guid? transactionGroupId = null,
      string? uniqueKeyName = null,
      string? uniqueKeyValue = null,
      string? efCommandText = null,
      string? efParametersJson = null,
      string? preSealedEnvelope = null,
      string executionChannel = "DirectEntity",
      string? sourceEndpoint = null,
      string? ipAddress = null,
      bool blockOnClockTampering = false)
      where TEntity : MpxEntity
  {
    var entityType = typeof(TEntity);
    var entityName = entityType.Name;
    var resolvedTable = string.IsNullOrWhiteSpace(tableName) ? entityName : tableName;
    var corporationId = entity is IMpxTenant tenantEntity && tenantEntity.CorporationId != Guid.Empty
        ? tenantEntity.CorporationId
        : (Guid?)null;

    var payloadJson = preSealedEnvelope ?? JsonSerializer.Serialize(entity, SafeJsonOptions);

    return ExecuteFirstAndApprove(
        jarbassAgentId: jarbassAgentId,
        corporationId: corporationId,
        userId: userId,
        operation: operation,
        entityName: entityName,
        tableName: resolvedTable,
        targetEntityId: entity.Id,
        targetEntityKey: entity.Key,
        uniqueKeyName: uniqueKeyName,
        uniqueKeyValue: uniqueKeyValue,
        payloadJson: payloadJson,
        isPreSealed: preSealedEnvelope is not null,
        efCommandText: efCommandText,
        efParametersJson: efParametersJson,
        executionChannel: executionChannel,
        sourceEndpoint: sourceEndpoint,
        ipAddress: ipAddress,
        parentSyncEventId: parentSyncEventId,
        transactionGroupId: transactionGroupId,
        blockOnClockTampering: blockOnClockTampering);
  }

  public JarbassPreExecutionApproval ExecuteFirstAndApprove(
      Guid jarbassAgentId,
      Guid? corporationId,
      Guid? userId,
      string operation,
      string entityName,
      string tableName,
      Guid targetEntityId,
      string? targetEntityKey,
      string? uniqueKeyName,
      string? uniqueKeyValue,
      string payloadJson,
      bool isPreSealed = false,
      string? efCommandText = null,
      string? efParametersJson = null,
      string executionChannel = "DirectEntity",
      string? sourceEndpoint = null,
      string? ipAddress = null,
      Guid? parentSyncEventId = null,
      Guid? transactionGroupId = null,
      bool blockOnClockTampering = false)
  {
    var seq = Interlocked.Increment(ref _sequenceCounter);
    var stamp = timeGuard.StampEvent($"{seq}|{parentSyncEventId}|{operation}|{tableName}|{targetEntityId}|{efCommandText}|{payloadJson}");

    if (blockOnClockTampering && stamp.ClockTampered)
    {
      var rejectedEvent = CreateSyncEvent(
          seq, jarbassAgentId, parentSyncEventId, transactionGroupId, corporationId, userId, operation, entityName, tableName,
          targetEntityId, targetEntityKey, uniqueKeyName, uniqueKeyValue, payloadJson, efCommandText, efParametersJson,
          executionChannel, sourceEndpoint, ipAddress, stamp,
          synced: false, status: "RejectedClockTampering");

      return new JarbassPreExecutionApproval(
          SyncEventId: rejectedEvent.Id,
          SequenceNumber: seq,
          ApprovedToExecuteOnEntity: false,
          RejectionReason: $"Relógio do sistema adulterado (desvio de {stamp.ClockSkewSeconds}s).",
          PreparedEvent: rejectedEvent);
    }

    var sealedPayload = isPreSealed
        ? payloadJson
        : cryptoGuardian.EncryptContentAesGcm(Encoding.UTF8.GetBytes(payloadJson), SealSecret);

    var preparedEvent = CreateSyncEvent(
        seq, jarbassAgentId, parentSyncEventId, transactionGroupId, corporationId, userId, operation, entityName, tableName,
        targetEntityId, targetEntityKey, uniqueKeyName, uniqueKeyValue, sealedPayload, efCommandText, efParametersJson,
        executionChannel, sourceEndpoint, ipAddress, stamp,
        synced: false, status: "AwaitingEntityCommit");

    return new JarbassPreExecutionApproval(
        SyncEventId: preparedEvent.Id,
        SequenceNumber: seq,
        ApprovedToExecuteOnEntity: true,
        RejectionReason: null,
        PreparedEvent: preparedEvent);
  }

  public void ConfirmEntityResult(
      JarbassSyncEvent syncEvent,
      bool entitySucceeded,
      long? durationMs = null,
      int? rowsAffected = null,
      string? errorMessage = null)
  {
    var completedUtc = DateTime.UtcNow;
    syncEvent.Executed = true;
    syncEvent.ExecutionSucceeded = entitySucceeded;
    syncEvent.ExecutionCompletedAtUtc = completedUtc;
    syncEvent.ExecutionDurationMs = durationMs;
    syncEvent.RowsAffected = rowsAffected;

    if (entitySucceeded)
    {
      syncEvent.Synced = true;
      syncEvent.SyncStatus = "Synced";
      syncEvent.SyncedAtUtc = completedUtc;
      syncEvent.ErrorMessage = null;
    }
    else
    {
      syncEvent.Synced = false;
      syncEvent.RetryCount += 1;
      syncEvent.SyncStatus = "PendingRetry";
      syncEvent.ErrorMessage = errorMessage;
    }
  }

  private static JarbassSyncEvent CreateSyncEvent(
      long seq,
      Guid jarbassAgentId,
      Guid? parentSyncEventId,
      Guid? transactionGroupId,
      Guid? corporationId,
      Guid? userId,
      string operation,
      string entityName,
      string tableName,
      Guid targetEntityId,
      string? targetEntityKey,
      string? uniqueKeyName,
      string? uniqueKeyValue,
      string payloadJson,
      string? efCommandText,
      string? efParametersJson,
      string executionChannel,
      string? sourceEndpoint,
      string? ipAddress,
      JarbassTimeValidationResult stamp,
      bool synced,
      string status)
  {
    return new JarbassSyncEvent
    {
      Id = Guid.NewGuid(),
      CorporationId = corporationId,
      JarbassAgentId = jarbassAgentId,
      ParentSyncEventId = parentSyncEventId,
      UserId = userId,
      SequenceNumber = seq,
      TransactionGroupId = transactionGroupId ?? Guid.NewGuid(),
      Operation = operation,
      EntityName = entityName,
      TableName = tableName,
      TargetEntityId = targetEntityId,
      TargetEntityKey = targetEntityKey,
      UniqueKeyName = uniqueKeyName,
      UniqueKeyValue = uniqueKeyValue,
      PayloadJson = payloadJson,
      EfCommandText = efCommandText,
      EfParametersJson = efParametersJson,
      MachineName = Environment.MachineName,
      EnvironmentMode = "Server",
      ExecutionChannel = executionChannel,
      SourceEndpoint = sourceEndpoint,
      IpAddress = ipAddress,
      Executed = false,
      ExecutionSucceeded = false,
      Synced = synced,
      ReportedDeviceUtc = stamp.ReportedDeviceUtc,
      TrustedOccurredAtUtc = stamp.TrustedOccurredAtUtc,
      CpuTickAtEvent = stamp.CpuTickAtEvent,
      ClockTampered = stamp.ClockTampered,
      ClockSkewSeconds = stamp.ClockSkewSeconds,
      PreviousHash = stamp.PreviousHash,
      Hash = stamp.CurrentHash,
      SyncStatus = status,
      System = true
    };
  }
}
