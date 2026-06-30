$project = Split-Path -Parent $MyInvocation.MyCommand.Path
$backup = Join-Path $project "undo\ui-before-cart-repair-20260629\src"
$target = Join-Path $project "src"

if (-not (Test-Path -LiteralPath $backup)) {
    throw "Undo backup was not found: $backup"
}

Copy-Item -Path (Join-Path $backup "*") -Destination $target -Recurse -Force
Write-Host "UI repair changes were undone successfully."
