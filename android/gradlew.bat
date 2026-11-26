@echo off
setlocal
set "FERRY_JAVA=java.exe"
if defined JAVA_HOME set "FERRY_JAVA=%JAVA_HOME%\bin\java.exe"
"%FERRY_JAVA%" -classpath "%~dp0gradle\wrapper\gradle-wrapper.jar" org.gradle.wrapper.GradleWrapperMain %*
exit /b %errorlevel%
