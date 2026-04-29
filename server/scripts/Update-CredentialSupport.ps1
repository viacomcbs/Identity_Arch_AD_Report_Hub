<#
.SYNOPSIS
  One-time migration: add $global:PSADCredential forwarding to all AD scripts.
  Safe to re-run — skips files already patched.
#>

$scriptsRoot = Split-Path $MyInvocation.MyCommand.Path
$files = Get-ChildItem -Path $scriptsRoot -Filter "*.ps1" -Recurse |
         Where-Object { $_.FullName -notmatch '\\auth\\' -and $_.Name -ne 'Update-CredentialSupport.ps1' }

$credSetupLine  = '    $credParam = if ($global:PSADCredential) { @{Credential = $global:PSADCredential} } else { @{} }'
$serverCredLine = '    $serverParam = @{}; $credParam = if ($global:PSADCredential) { @{Credential = $global:PSADCredential} } else { @{} }'

$patched = 0
$skipped = 0

foreach ($file in $files) {
    $raw = Get-Content $file.FullName -Raw -Encoding UTF8

    # Already patched — skip
    if ($raw -match 'credParam|PSADCredential') {
        $skipped++
        continue
    }

    $updated = $raw

    # ── Scripts that already have $serverParam setup ──────────────────────────
    # Pattern: $serverParam = @{}  (no cred yet)
    if ($updated -match '\$serverParam\s*=\s*@\{\}') {
        # Replace bare $serverParam = @{} with combined setup
        $updated = $updated -replace '(\$serverParam\s*=\s*@\{\})', '$1' + "`n" + $credSetupLine

        # Add @credParam wherever @serverParam is already splatted into an AD call
        $updated = $updated -replace '(@serverParam)(?!\s*@credParam)', '@serverParam @credParam'

    } else {
        # ── Scripts with bare AD calls (no @serverParam) ──────────────────────
        # Insert $credParam setup after Import-Module line
        $updated = $updated -replace `
            '(Import-Module ActiveDirectory\s+-ErrorAction\s+Stop)', `
            "`$1`n$credSetupLine"

        # Add @credParam to the end of every single-line Get-AD* call.
        # Matches: Get-AD<word> <args until end of line>, not already having @credParam
        $updated = [regex]::Replace($updated,
            '(Get-AD\w+\s[^\n|]*?)(\s*(?:\r?\n|\|))',
            { param($m)
              $call = $m.Groups[1].Value
              $tail = $m.Groups[2].Value
              if ($call -match '@credParam') { return $m.Value }
              return "$call @credParam$tail"
            })
    }

    if ($updated -ne $raw) {
        Set-Content -Path $file.FullName -Value $updated -NoNewline -Encoding UTF8
        Write-Host "Patched: $($file.Name)"
        $patched++
    }
}

Write-Host ""
Write-Host "Done. Patched: $patched  |  Already up-to-date: $skipped"
