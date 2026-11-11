@echo off
cd /d "%~dp0"
echo Coffee Please - abre http://localhost:3000/juego/ en tu navegador.
echo Oficina: http://localhost:3000/oficina/
echo No cierres esta ventana mientras juegas.
node server.js
pause
