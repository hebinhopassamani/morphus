param(
    [Parameter(Mandatory = $true)]
    [string]$ConversationId,

    [Parameter(Mandatory = $true)]
    [string]$Subject,

    [Parameter(Mandatory = $true)]
    [string]$Summary,

    [Parameter(Mandatory = $true)]
    [string]$Tags,

    [Parameter(Mandatory = $false)]
    [string]$TranscriptJsonlPath = ""
)

$ErrorActionPreference = "Stop"
$baseDir = "C:\.dev\Projetos\Morphus\.agents\conversations"
$mdIndexPath = Join-Path $baseDir "conversations.md"
$fullConvDir = Join-Path $baseDir "full-conversations"
$mdFileName = "$ConversationId.md"
$mdPath = Join-Path $fullConvDir $mdFileName

if (-not (Test-Path $fullConvDir)) {
    New-Item -ItemType Directory -Path $fullConvDir -Force | Out-Null
}

$safeSubject = ($Subject -replace '\|', '\|' -replace '\r?\n', ' ').Trim()
$safeSummary = ($Summary -replace '\|', '\|' -replace '\r?\n', ' ').Trim()
$safeTags = ($Tags -replace '\|', '\|' -replace '\r?\n', ' ').Trim()

# 1. Generate clean Markdown transcript file if TranscriptJsonlPath is provided
if ($TranscriptJsonlPath -and (Test-Path $TranscriptJsonlPath)) {
    $lines = Get-Content -Path $TranscriptJsonlPath -Encoding UTF8
    $sb = New-Object System.Text.StringBuilder
    [void]$sb.AppendLine("# $ConversationId — $safeSubject")
    [void]$sb.AppendLine("")
    [void]$sb.AppendLine("| CONVERSATION ID | DATE | SUBJECT | SUMMARY | TAGS |")
    [void]$sb.AppendLine("| :--- | :--- | :--- | :--- | :--- |")
    [void]$sb.AppendLine("| **$ConversationId** | $(Get-Date -Format 'dd/MM/yyyy HH:mm') | $safeSubject | $safeSummary | $safeTags |")
    [void]$sb.AppendLine("")
    [void]$sb.AppendLine("---")
    [void]$sb.AppendLine("")

    foreach ($line in $lines) {
        if ([string]::IsNullOrWhiteSpace($line)) { continue }
        try {
            $obj = $line | ConvertFrom-Json
            if ($obj.type -eq "USER_INPUT" -and $obj.content) {
                $cleanUser = ($obj.content -replace '(?s)<ADDITIONAL_METADATA>.*?</ADDITIONAL_METADATA>', '' -replace '(?s)<USER_SETTINGS_CHANGE>.*?</USER_SETTINGS_CHANGE>', '' -replace '</?USER_REQUEST>', '').Trim()
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
$newRow = "| [$ConversationId]($mdFileName) | $safeSubject | $safeSummary | $safeTags |"

if (-not (Test-Path $mdIndexPath)) {
    $initContent = @(
        "# Índice Oficial de Conversas — Ecossistema Morphus",
        "",
        "| CONVERSATION ID | SUBJECT | SUMMARY | TAGS |",
        "| :--- | :--- | :--- | :--- |",
        $newRow
    ) -join "`r`n"
    [System.IO.File]::WriteAllText($mdIndexPath, $initContent + "`r`n", [System.Text.Encoding]::UTF8)
}
else {
    $existingLines = [System.IO.File]::ReadAllLines($mdIndexPath, [System.Text.Encoding]::UTF8)
    $updated = $false
    $outLines = New-Object System.Collections.Generic.List[string]

    foreach ($line in $existingLines) {
        if ($line -match '^\|\s*CONVERSATION ID\s*\|') {
            $outLines.Add("| CONVERSATION ID | SUBJECT | SUMMARY | TAGS |")
        }
        elseif ($line -match '^\|\s*:---') {
            $outLines.Add("| :--- | :--- | :--- | :--- |")
        }
        elseif ($line.Contains("[$ConversationId]")) {
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

# 2b. Mirror to Obsidian Vault (Conversations With AI\Gemini Argon - Rafa\Morphus) if present
$vaultConvDir = "I:\Meu Drive\Base de Conhecimento\Vault\Conversations With AI\Gemini Argon - Rafa\Morphus"
if (Test-Path $vaultConvDir) {
    $vaultFullDir = Join-Path $vaultConvDir "full-conversations"
    if (-not (Test-Path $vaultFullDir)) {
        New-Item -ItemType Directory -Path $vaultFullDir -Force | Out-Null
    }
    if (Test-Path $mdPath) {
        Copy-Item -Path $mdPath -Destination (Join-Path $vaultFullDir $mdFileName) -Force
    }
    $vaultSummaryPath = Join-Path $vaultConvDir "Summary.md"
    Copy-Item -Path $mdIndexPath -Destination $vaultSummaryPath -Force
}

# 3. Auto-update recent memory snapshot inside rafa-identity.md rules (zero extra token reads on new conversations)
$allRows = [System.IO.File]::ReadAllLines($mdIndexPath, [System.Text.Encoding]::UTF8) | Where-Object { $_ -match '^\|\s*\[MPX_\d+\]' }
$recentRows = $allRows | Select-Object -Last 4
$memoryLines = New-Object System.Collections.Generic.List[string]
$memoryLines.Add("<!-- MPX_RECENT_MEMORY_START -->")
$memoryLines.Add("## Memória Recente (Últimas Conversas & Contexto Vivo — Injetado Automaticamente)")
foreach ($r in $recentRows) {
    $parts = $r.Split('|')
    if ($parts.Count -ge 4) {
        $idPart = ($parts[1] -replace '\[([^\]]+)\]\([^\)]+\)', '$1').Trim()
        $subjPart = $parts[2].Trim()
        $sumPart = $parts[3].Trim()
        $memoryLines.Add("- **$idPart ($subjPart)**: $sumPart")
    }
}
$memoryLines.Add("<!-- MPX_RECENT_MEMORY_END -->")
$memoryBlock = ($memoryLines -join "`r`n")

$rulePaths = @(
    "C:\.dev\Projetos\Morphus\.agents\rules\rafa-identity.md",
    "C:\Users\hebin\.gemini\config\rules\rafa-identity.md"
)
foreach ($rp in $rulePaths) {
    if (Test-Path $rp) {
        $ruleContent = [System.IO.File]::ReadAllText($rp, [System.Text.Encoding]::UTF8)
        if ($ruleContent -match '(?s)<!-- MPX_RECENT_MEMORY_START -->.*?<!-- MPX_RECENT_MEMORY_END -->') {
            $updatedRule = [regex]::Replace($ruleContent, '(?s)<!-- MPX_RECENT_MEMORY_START -->.*?<!-- MPX_RECENT_MEMORY_END -->', $memoryBlock)
            [System.IO.File]::WriteAllText($rp, $updatedRule, [System.Text.Encoding]::UTF8)
        }
    }
}

Write-Output "Updated conversations.md index and rafa-identity.md memory snapshot for $ConversationId!"
