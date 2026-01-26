@echo off
chcp 65001 >nul
title StudentTalk - 停止所有服务

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║          老师-学生谈话记录小程序 - 停止服务脚本            ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

:: 获取当前脚本所在目录
cd /d "%~dp0"

echo [1/3] 停止前端服务窗口...
:: 关闭前端服务窗口
taskkill /fi "WINDOWTITLE eq StudentTalk-Frontend-H5*" /f >nul 2>&1
:: 查找并关闭 Vite 开发服务器进程（端口 5173）
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5173 ^| findstr LISTENING') do (
    taskkill /pid %%a /f >nul 2>&1
)
echo       √ 前端服务已停止

echo.
echo [2/3] 停止后端服务窗口...
:: 关闭后端服务窗口
taskkill /fi "WINDOWTITLE eq StudentTalk-Backend*" /f >nul 2>&1
:: 查找并关闭 Next.js 开发服务器进程（端口 3000）
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000 ^| findstr LISTENING') do (
    taskkill /pid %%a /f >nul 2>&1
)
echo       √ 后端服务已停止

echo.
echo [3/3] 停止 MySQL 数据库容器...
docker-compose stop mysql >nul 2>&1
if errorlevel 1 (
    echo       ! MySQL 容器可能未运行
) else (
    echo       √ MySQL 容器已停止
)

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║                    ✓ 所有服务已停止！                      ║
echo ╠════════════════════════════════════════════════════════════╣
echo ║  提示：                                                    ║
echo ║  - 数据库数据已保留，下次启动仍可使用                      ║
echo ║  - 如需完全清除数据，请运行: docker-compose down -v        ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

pause
