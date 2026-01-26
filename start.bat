@echo off
chcp 65001 >nul
title StudentTalk - 启动所有服务

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║          老师-学生谈话记录小程序 - 本地启动脚本            ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

:: 获取当前脚本所在目录
cd /d "%~dp0"

echo [1/4] 检查 Docker 状态...
docker info >nul 2>&1
if errorlevel 1 (
    echo [错误] Docker 未运行，请先启动 Docker Desktop！
    pause
    exit /b 1
)
echo       √ Docker 已运行

echo.
echo [2/4] 启动 MySQL 数据库...
docker-compose up -d mysql
if errorlevel 1 (
    echo [错误] 数据库启动失败！
    pause
    exit /b 1
)
echo       √ MySQL 容器已启动

echo.
echo [3/4] 等待数据库初始化...
timeout /t 10 /nobreak >nul
echo       √ 数据库就绪

echo.
echo [4/4] 检查并启动后端和前端服务...

:: 检查后端依赖
echo       检查后端依赖...
if not exist "backend\node_modules\" (
    echo [警告] 后端依赖未安装，正在安装...
    cd /d "%~dp0backend"
    call npm install
    if errorlevel 1 (
        echo [错误] 后端依赖安装失败！
        cd /d "%~dp0"
        pause
        exit /b 1
    )
    cd /d "%~dp0"
)
echo       √ 后端依赖已就绪

:: 检查前端依赖
echo       检查前端依赖...
if not exist "frontend\node_modules\" (
    echo [警告] 前端依赖未安装，正在安装...
    cd /d "%~dp0frontend"
    call npm install
    if errorlevel 1 (
        echo [错误] 前端依赖安装失败！
        cd /d "%~dp0"
        pause
        exit /b 1
    )
    cd /d "%~dp0"
)
echo       √ 前端依赖已就绪

echo.
echo       启动后端服务...
:: 启动后端服务（新窗口）
start "StudentTalk-Backend" cmd /k "cd /d %~dp0backend && echo [后端服务] 启动中... && npm run dev"

:: 等待后端启动
timeout /t 5 /nobreak >nul

echo       启动前端服务...
:: 启动前端 H5 服务（新窗口）
start "StudentTalk-Frontend-H5" cmd /k "cd /d %~dp0frontend && echo [前端H5服务] 启动中... && npm run dev:h5"

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║                    ✓ 所有服务已启动！                      ║
echo ╠════════════════════════════════════════════════════════════╣
echo ║  服务              地址                                    ║
echo ║  ──────────────────────────────────────────────────────    ║
echo ║  MySQL 数据库      localhost:3306                          ║
echo ║  后端 API          http://localhost:3000                   ║
echo ║  前端 H5           http://localhost:5173                   ║
echo ╠════════════════════════════════════════════════════════════╣
echo ║  提示：关闭服务请运行 stop.bat                             ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

:: 询问是否打开浏览器
choice /c YN /n /m "是否打开浏览器访问前端页面？(Y/N): "
if errorlevel 2 goto :end
if errorlevel 1 (
    timeout /t 5 /nobreak >nul
    start http://localhost:5173
)

:end
echo.
echo 按任意键关闭此窗口（服务将继续在后台运行）...
pause >nul
