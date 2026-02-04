---
description: 自动执行规则 - 定义哪些操作需要用户确认
---

# 自动执行规则

// turbo-all

## 需要用户确认的操作（危险操作）

以下操作必须等待用户确认后才能执行：

1. **删除数据** - 任何 DELETE SQL 语句
2. **删除文件/目录** - rm、del、Remove-Item 等删除命令
3. **修改数据库表结构** - ALTER TABLE、DROP TABLE、TRUNCATE 等 DDL 语句
4. **更新表数据** - UPDATE SQL 语句
5. **覆盖重要配置文件** - 可能影响系统运行的配置变更

## 可以自动执行的操作

以下操作可以自动执行，无需用户确认：

1. **创建新文件** - 新建代码文件、配置文件等
2. **修改代码文件** - 编辑 .ts、.vue、.js、.css、.md 等文件
3. **运行开发服务器** - npm run dev、pnpm dev 等
4. **安装依赖** - npm install、pnpm add 等
5. **查询数据** - SELECT 语句（只读操作）
6. **构建项目** - npm run build 等
7. **运行测试** - npm test 等
8. **查看文件内容** - cat、type、Get-Content 等
9. **列出目录内容** - ls、dir、Get-ChildItem 等
10. **Git 查询操作** - git status、git log、git diff 等
11. **Docker 查询操作** - docker ps、docker logs 等

## 注意事项

- 如果对某个操作是否安全有疑问，默认请求用户确认
- 批量操作即使是安全类型，也建议先与用户确认范围
