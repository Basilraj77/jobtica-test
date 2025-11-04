@echo off
:: ===============================
:: Git Auto Push Script
:: Repo: https://github.com/basilraj/jobtica-test.git
:: Branch: main
:: ===============================

:: Step 1: Remove old Git data (if exists)
IF EXIST .git (
    echo Removing old git repository...
    rmdir /s /q .git
)

:: Step 2: Initialize new Git repo
echo Initializing new Git repository...
git init

:: Step 3: Add remote origin
git remote add origin https://github.com/basilraj/jobtica-test.git

:: Step 4: Add all files
git add .

:: Step 5: Commit changes
set /p commitMsg=Enter commit message: 
if "%commitMsg%"=="" set commitMsg=Updated files
git commit -m "%commitMsg%"

:: Step 6: Set branch to main
git branch -M main

:: Step 7: Push to GitHub
echo Pushing to GitHub main branch...
git push -f origin main

echo.
echo ✅ Upload complete!
pause
