# Script to remove project folders from OneDrive
# Run this script as Administrator if needed

Write-Host "=== Removing Rodistaa Project Folders from OneDrive ===" -ForegroundColor Cyan
Write-Host ""

$foldersToRemove = @(
    "C:\Users\devel\OneDrive\Desktop\Admin portal",
    "C:\Users\devel\OneDrive\Desktop\Rodistaa",
    "C:\Users\devel\OneDrive\Desktop\rodistaa_operator_app"
)

foreach ($folder in $foldersToRemove) {
    if (Test-Path $folder) {
        Write-Host "Attempting to remove: $folder" -ForegroundColor Yellow
        
        # Stop OneDrive sync temporarily (if possible)
        $onedriveProcess = Get-Process -Name "OneDrive" -ErrorAction SilentlyContinue
        if ($onedriveProcess) {
            Write-Host "  Warning: OneDrive is running. You may need to pause sync first." -ForegroundColor Yellow
        }
        
        # Try to remove
        try {
            # Take ownership
            Write-Host "  Taking ownership..." -ForegroundColor Gray
            takeown /F $folder /R /D Y 2>&1 | Out-Null
            
            # Grant full control
            Write-Host "  Granting permissions..." -ForegroundColor Gray
            icacls $folder /grant "$env:USERNAME`:F" /T 2>&1 | Out-Null
            
            # Remove
            Write-Host "  Deleting folder..." -ForegroundColor Gray
            Remove-Item -Path $folder -Recurse -Force -ErrorAction Stop
            
            Write-Host "  ✓ Successfully removed!" -ForegroundColor Green
        }
        catch {
            Write-Host "  ✗ Failed to remove: $($_.Exception.Message)" -ForegroundColor Red
            Write-Host "  Manual steps required:" -ForegroundColor Yellow
            Write-Host "    1. Close Cursor/VS Code if it has this folder open" -ForegroundColor White
            Write-Host "    2. Pause OneDrive sync (right-click OneDrive icon > Pause syncing)" -ForegroundColor White
            Write-Host "    3. Close File Explorer windows showing this folder" -ForegroundColor White
            Write-Host "    4. Restart your computer if needed" -ForegroundColor White
            Write-Host "    5. Then manually delete: $folder" -ForegroundColor White
        }
    }
    else {
        Write-Host "  Folder not found: $folder" -ForegroundColor Gray
    }
    Write-Host ""
}

Write-Host "=== Verification ===" -ForegroundColor Cyan
$remaining = Get-ChildItem "C:\Users\devel\OneDrive\Desktop" -Directory | Where-Object { $_.Name -match "Admin|Rodistaa|rodistaa" }
if ($remaining) {
    Write-Host "Remaining folders:" -ForegroundColor Yellow
    $remaining | ForEach-Object { Write-Host "  - $($_.FullName)" -ForegroundColor Yellow }
}
else {
    Write-Host "✓ All project folders removed from OneDrive!" -ForegroundColor Green
}

Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

