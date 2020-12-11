@echo off

rem Загрузка библиотек и компиляция фронта
cd ../client
call npm i
call npm run build

rem Загрузка библиотек и компиляция бекенда
cd ../server
call npm i
call npm run build