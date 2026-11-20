using System.Security.Cryptography;
using System.Text;

namespace Mpx.Jarbass.Security;

public sealed record JarbassTimeValidationResult(
    DateTime ReportedDeviceUtc,
    DateTime TrustedOccurredAtUtc,
    long CpuTickAtEvent,
    bool ClockTampered,
    int ClockSkewSeconds,
    string PreviousHash,
    string CurrentHash);

public sealed class JarbassTimeGuard
{
  private readonly object _lock = new();
  private DateTime _anchorTrustedUtc = DateTime.UtcNow;
  private long _anchorCpuTick = Environment.TickCount64;
  private DateTime _highWaterMarkUtc = DateTime.UtcNow;
  private string _lastHash = "GENESIS_JARBASS_CHAIN";

  public void AnchorTrustedServerTime(DateTime trustedServerUtc, DateTime? persistedHighWaterMarkUtc = null, string? persistedLastHash = null)
  {
    lock (_lock)
    {
      _anchorTrustedUtc = trustedServerUtc;
      _anchorCpuTick = Environment.TickCount64;

      if (persistedHighWaterMarkUtc.HasValue && persistedHighWaterMarkUtc.Value > _highWaterMarkUtc)
      {
        _highWaterMarkUtc = persistedHighWaterMarkUtc.Value;
      }

      if (trustedServerUtc > _highWaterMarkUtc)
      {
        _highWaterMarkUtc = trustedServerUtc;
      }

      if (!string.IsNullOrWhiteSpace(persistedLastHash))
      {
        _lastHash = persistedLastHash;
      }
    }
  }

  public JarbassTimeValidationResult StampEvent(string payloadFingerprint, int allowedDriftSeconds = 45)
  {
    lock (_lock)
    {
      var reportedUtc = DateTime.UtcNow;
      var currentTick = Environment.TickCount64;
      var elapsedMs = Math.Max(0L, currentTick - _anchorCpuTick);
      var monotonicExpectedUtc = _anchorTrustedUtc.AddMilliseconds(elapsedMs);

      var skewSeconds = (int)Math.Round((reportedUtc - monotonicExpectedUtc).TotalSeconds);
      var backwardFromHighWater = reportedUtc < _highWaterMarkUtc.AddSeconds(-allowedDriftSeconds);
      var excessiveDriftFromMonotonic = Math.Abs(skewSeconds) > allowedDriftSeconds;
      var tampered = backwardFromHighWater || excessiveDriftFromMonotonic;

      var trustedUtc = tampered
          ? (monotonicExpectedUtc > _highWaterMarkUtc ? monotonicExpectedUtc : _highWaterMarkUtc)
          : reportedUtc;

      if (trustedUtc > _highWaterMarkUtc)
      {
        _highWaterMarkUtc = trustedUtc;
      }

      var previousHash = _lastHash;
      var rawChain = $"{previousHash}|{trustedUtc:O}|{reportedUtc:O}|{currentTick}|{tampered}|{payloadFingerprint}";
      var currentHash = Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(rawChain)));
      _lastHash = currentHash;

      return new JarbassTimeValidationResult(
          ReportedDeviceUtc: reportedUtc,
          TrustedOccurredAtUtc: trustedUtc,
          CpuTickAtEvent: currentTick,
          ClockTampered: tampered,
          ClockSkewSeconds: skewSeconds,
          PreviousHash: previousHash,
          CurrentHash: currentHash);
    }
  }
}
