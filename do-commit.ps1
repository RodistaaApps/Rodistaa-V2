# Commit and Push Script with Output Logging

$ErrorActionPreference = "Continue"
Set-Location "c:\Rodistaa\Rodistaa-V2"

$logFile = "commit-output.log"
"=== Git Commit Script ===" | Out-File $logFile
Get-Date | Out-File $logFile -Append
"" | Out-File $logFile -Append

"1. Staging all files..." | Out-File $logFile -Append
git add -A 2>&1 | Out-File $logFile -Append

"2. Git status:" | Out-File $logFile -Append
git status --short 2>&1 | Out-File $logFile -Append

"3. Committing..." | Out-File $logFile -Append
$commitMsg = "feat: Complete freight estimation system, pricing engine, booking API, and design specs"
git commit -m $commitMsg 2>&1 | Out-File $logFile -Append

"4. Latest commit:" | Out-File $logFile -Append
git log -1 --oneline 2>&1 | Out-File $logFile -Append

"5. Remote info:" | Out-File $logFile -Append
git remote -v 2>&1 | Out-File $logFile -Append

"6. Current branch:" | Out-File $logFile -Append
git branch --show-current 2>&1 | Out-File $logFile -Append

"7. Attempting push..." | Out-File $logFile -Append
git push origin HEAD 2>&1 | Out-File $logFile -Append

Write-Host "Output saved to commit-output.log"
Get-Content $logFile

