@echo off
setlocal
cd /d "%~dp0"
echo.
echo === SuperFan Shuffle deploy: v170 - v172 ===
echo.

REM ---- locate git.exe even if it's not on PATH ----
set "GIT="
where git >nul 2>&1 && set "GIT=git"
if not defined GIT if exist "%ProgramFiles%\Git\cmd\git.exe" set "GIT=%ProgramFiles%\Git\cmd\git.exe"
if not defined GIT if exist "%ProgramFiles(x86)%\Git\cmd\git.exe" set "GIT=%ProgramFiles(x86)%\Git\cmd\git.exe"
if not defined GIT if exist "%LOCALAPPDATA%\Programs\Git\cmd\git.exe" set "GIT=%LOCALAPPDATA%\Programs\Git\cmd\git.exe"
for /d %%D in ("%LOCALAPPDATA%\GitHubDesktop\app-*") do (
  if not defined GIT if exist "%%D\resources\app\git\cmd\git.exe" set "GIT=%%D\resources\app\git\cmd\git.exe"
)
if not defined GIT goto nogit
echo Using git: %GIT%
echo.

echo [1/4] Discarding line-ending-only local changes...
"%GIT%" checkout -- .
if errorlevel 1 goto err
echo [2/4] Pulling latest from GitHub...
"%GIT%" pull
if errorlevel 1 goto err
echo [3/4] Applying sfs-v170-v172.patch...
"%GIT%" am sfs-v170-v172.patch
if errorlevel 1 goto amfail
echo [4/4] Pushing to main...
"%GIT%" push
if errorlevel 1 goto err

echo.
echo ============================================
echo  DONE. GitHub Pages rebuilds in 30-60s.
echo  Check https://superfanshuffle.com - build tag should read v172
echo ============================================
echo.
pause
exit /b 0

:nogit
echo !! Git is not installed on this PC (or not findable).
echo !!
echo !! EASIEST FIX - no install needed:
echo !!   Use the GitHub website to upload the two files in
echo !!   the _deploy-v172 folder. See the chat for steps.
echo !!
echo !! OR install Git for Windows:
echo !!   https://git-scm.com/download/win
echo !!   During setup pick "Git from the command line and
echo !!   also from 3rd-party software", then run this again.
echo.
pause
exit /b 1

:amfail
echo.
echo !! Patch did not apply cleanly. Nothing was pushed.
echo !! Back it out with:  git am --abort
echo.
pause
exit /b 1

:err
echo.
echo !! Step failed - see the error above. Nothing was pushed.
echo !! If it asked for a password, GitHub needs a Personal
echo !! Access Token there, not your account password.
echo.
pause
exit /b 1
