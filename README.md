# 老师-学生谈话记录小程序

一个用于记录老师与学生谈话的微信小程序，支持快捷标签配置、模板化记录生成。

## 技术栈

| 层级 | 技术 |
| :--- | :--- |
| **前端** | Vue 3 + Vite + uni-app + uView-Plus + TypeScript |
| **后端** | Node.js + Next.js 14 + TypeScript |
| **数据库** | MySQL 8.0 |
| **ORM** | Prisma |
| **容器化** | Docker + Docker Compose |

## 项目结构

```
studentTalk/
├── frontend/                # 前端项目 (uni-app)
│   ├── src/
│   │   ├── pages/          # 页面文件
│   │   ├── api/            # API 接口封装
│   │   └── static/         # 静态资源
│   └── package.json
│
├── backend/                 # 后端项目 (Next.js)
│   ├── src/
│   │   ├── app/api/        # API Routes
│   │   └── lib/            # 公共库
│   ├── prisma/             # 数据库模型
│   └── package.json
│
├── docker-compose.yml       # Docker 编排
├── init.sql                 # 数据库初始化
└── README.md
```

## 快速开始

### 1. 启动数据库

```bash
docker-compose up -d mysql
```

### 2. 启动后端服务

```bash
cd backend
npm install
npx prisma generate
npm run dev
```

后端服务将在 http://localhost:3000 启动

### 3. 启动前端服务

**H5 开发模式：**
```bash
cd frontend
npm install
npm run dev:h5
```

**微信小程序模式：**
```bash
cd frontend
npm install
npm run dev:mp-weixin
```

然后使用微信开发者工具打开 `frontend/dist/dev/mp-weixin` 目录

## API 接口

| 方法 | 路径 | 描述 |
| :--- | :--- | :--- |
| POST | `/api/v1/record` | 创建新记录 |
| GET | `/api/v1/record` | 获取记录列表 |
| GET | `/api/v1/record/:id` | 获取记录详情 |
| DELETE | `/api/v1/record/:id` | 删除记录 |
| GET | `/api/v1/quick-tag` | 获取所有快捷标签 |
| POST | `/api/v1/quick-tag/:id/detail` | 添加标签明细 |
| DELETE | `/api/v1/quick-tag/detail/:detailId` | 删除标签明细 |

## 页面功能

| 页面 | 功能 |
| :--- | :--- |
| **记录列表** | 搜索、分页、下拉刷新、点击查看详情 |
| **新增记录** | 表单录入、快捷标签复选框、模板生成 |
| **记录详情** | 查看完整记录、复制文本、删除 |
| **快捷标签** | 配置各类别的标签选项、添加/删除 |

## 环境变量

在 `backend/.env` 中配置：

```env
DATABASE_URL="mysql://app:app123456@localhost:3306/talk_record"
```

## License

MIT
