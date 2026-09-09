@echo off
REM TMC World — arranque local de un solo doble clic (Windows).
REM Instala dependencias solo si faltan, luego levanta el servidor de
REM desarrollo en http://localhost:3000. No hace nada destructivo: no borra,
REM no sobrescribe, no toca Git.

cd /d "%~dp0"

if not exist "node_modules" (
    echo Instalando dependencias...
    call npm install
    if errorlevel 1 (
        echo.
        echo La instalacion fallo. Revisa el error de arriba.
        pause
        exit /b 1
    )
)

echo.
echo Iniciando TMC World en http://localhost:3000 ...
echo Cierra esta ventana o presiona Ctrl+C para detener el servidor.
echo.
call npm run dev

pause
