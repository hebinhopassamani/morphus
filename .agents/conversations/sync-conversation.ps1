param(
    [Parameter(Mandatory = $true)]
    [string]$ConversationId,

    [Parameter(Mandatory = $true)]
    [string]$Subject,

    [Parameter(Mandatory = $true)]
    [string]$Summary,

    [Parameter(Mandatory = $false)]
    [string]$TranscriptJsonlPath = ""
)

$ErrorActionPreference = "Stop"
$baseDir = "C:\Projetos\Morphus\.agents\conversations"
$mdIndexPath = Join-Path $baseDir "conversations.md"
$fullConvDir = Join-Path $baseDir "full-conversations"
$mdFileName = "$ConversationId.md"
$mdPath = Join-Path $fullConvDir $mdFileName

if (-not (Test-Path $fullConvDir)) {
    New-Item -ItemType Directory -Path $fullConvDir -Force | Out-Null
}

# 1. Generate clean Markdown transcript file if TranscriptJsonlPath is provided
if ($TranscriptJsonlPath -and (Test-Path $TranscriptJsonlPath)) {
    $lines = Get-Content -Path $TranscriptJsonlPath -Encoding UTF8
    $sb = New-Object System.Text.StringBuilder
    [void]$sb.AppendLine("# $ConversationId — $Subject")
    [void]$sb.AppendLine("")
    [void]$sb.AppendLine("| CONVERSATION ID | DATE | SUBJECT | SUMMARY |")
    [void]$sb.AppendLine("| :--- | :--- | :--- | :--- |")
    [void]$sb.AppendLine("| **$ConversationId** | $(Get-Date -Format 'dd/MM/yyyy HH:mm') | $Subject | $Summary |")
    [void]$sb.AppendLine("")
    [void]$sb.AppendLine("---")
    [void]$sb.AppendLine("")

    foreach ($line in $lines) {
        if ([string]::IsNullOrWhiteSpace($line)) { continue }
        try {
            $obj = $line | ConvertFrom-Json
            if ($obj.type -eq "USER_INPUT" -and $obj.content) {
                $cleanUser = ($obj.content -replace '(?s)<ADDITIONAL_METADATA>.*?</ADDITIONAL_METADATA>', '' -replace '</?USER_REQUEST>', '').Trim()
                if ($cleanUser) {
                    [void]$sb.AppendLine("## 👤 Hebinho")
                    [void]$sb.AppendLine("")
                    [void]$sb.AppendLine($cleanUser)
                    [void]$sb.AppendLine("")
                }
            }
            elseif ($obj.type -eq "PLANNER_RESPONSE" -and $obj.content) {
                $cleanRafa = $obj.content.Trim()
                if ($cleanRafa) {
                    [void]$sb.AppendLine("## 🤖 Rafa")
                    [void]$sb.AppendLine("")
                    [void]$sb.AppendLine($cleanRafa)
                    [void]$sb.AppendLine("")
                }
            }
        }
        catch {}
    }

    [System.IO.File]::WriteAllText($mdPath, $sb.ToString(), [System.Text.Encoding]::UTF8)
    Write-Output "Saved clean conversation markdown: $mdPath"
}

# 2. Update conversations.md index table (zero file locks, live reload in editor/Obsidian)
$safeSubject = ($Subject -replace '\|', '\|' -replace '\r?\n', ' ').Trim()
$safeSummary = ($Summary -replace '\|', '\|' -replace '\r?\n', ' ').Trim()
$newRow = "| [$ConversationId](./full-conversations/$mdFileName) | $safeSubject | $safeSummary |"

if (-not (Test-Path $mdIndexPath)) {
    $initContent = @(
        "# Índice Oficial de Conversas — Ecossistema Morphus",
        "",
        "| CONVERSATION ID | SUBJECT | SUMMARY |",
        "| :--- | :--- | :--- |",
        $newRow
    ) -join "`r`n"
    [System.IO.File]::WriteAllText($mdIndexPath, $initContent + "`r`n", [System.Text.Encoding]::UTF8)
}
else {
    $existingLines = [System.IO.File]::ReadAllLines($mdIndexPath, [System.Text.Encoding]::UTF8)
    $updated = $false
    $outLines = New-Object System.Collections.Generic.List[string]

    foreach ($line in $existingLines) {
        if ($line.Contains("[$ConversationId]")) {
            $outLines.Add($newRow)
            $updated = $true
        }
        else {
            $outLines.Add($line)
        }
    }

    if (-not $updated) {
        $outLines.Add($newRow)
    }

    [System.IO.File]::WriteAllLines($mdIndexPath, $outLines, [System.Text.Encoding]::UTF8)
}

Write-Output "Updated conversations.md index for $ConversationId!"
