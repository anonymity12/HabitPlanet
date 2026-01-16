# HabitPlanet 后端服务器 (Backend Server)

本目录包含 HabitPlanet 应用的后端服务代码和数据库配置。

This directory contains the backend server code and database configuration for the HabitPlanet application.

---

## 📋 目录 (Table of Contents)

- [技术栈 (Tech Stack)](#技术栈-tech-stack)
- [数据库设置 (Database Setup)](#数据库设置-database-setup)
- [环境配置 (Environment Configuration)](#环境配置-environment-configuration)
- [运行服务 (Running the Server)](#运行服务-running-the-server)
- [数据库迁移 (Database Migrations)](#数据库迁移-database-migrations)
- [项目结构 (Project Structure)](#项目结构-project-structure)

---

## 🛠 技术栈 (Tech Stack)

- **数据库 (Database)**: PostgreSQL 14+
- **ORM/Query**: Node.js with pg (node-postgres)
- **语言 (Language)**: TypeScript
- **框架 (Framework)**: Node.js

---

## 🗄 数据库设置 (Database Setup)

### 前置要求 (Prerequisites)

1. **安装 PostgreSQL** (Install PostgreSQL)
   - macOS: `brew install postgresql@14`
   - Ubuntu: `sudo apt-get install postgresql-14`
   - Windows: Download from [postgresql.org](https://www.postgresql.org/download/)

2. **启动 PostgreSQL 服务** (Start PostgreSQL Service)
   ```bash
   # macOS (Homebrew)
   brew services start postgresql@14
   
   # Ubuntu/Linux
   sudo service postgresql start
   
   # Windows
   # PostgreSQL service starts automatically after installation
   ```

### 创建数据库 (Create Database)

1. **登录 PostgreSQL** (Login to PostgreSQL)
   ```bash
   psql -U postgres
   ```

2. **创建数据库和用户** (Create Database and User)
   ```sql
   -- 创建数据库 (Create database)
   CREATE DATABASE habitplanet;
   
   -- 创建用户 (Create user)
   CREATE USER habitplanet_user WITH PASSWORD 'your_secure_password';
   
   -- 授予权限 (Grant privileges)
   GRANT ALL PRIVILEGES ON DATABASE habitplanet TO habitplanet_user;
   
   -- 退出 (Exit)
   \q
   ```

3. **运行数据库架构脚本** (Run Database Schema Script)
   ```bash
   # 进入项目根目录 (Navigate to project root)
   cd /path/to/HabitPlanet
   
   # 执行架构脚本 (Execute schema script)
   psql -U habitplanet_user -d habitplanet -f server/schema.sql
   
   # 可选：加载示例数据 (Optional: Load seed data)
   psql -U habitplanet_user -d habitplanet -f server/seed.sql
   ```

### 使用 Docker (可选) - Using Docker (Optional)

如果您更喜欢使用 Docker:

```bash
# 启动 PostgreSQL 容器 (Start PostgreSQL container)
docker run --name habitplanet-postgres \
  -e POSTGRES_DB=habitplanet \
  -e POSTGRES_USER=habitplanet_user \
  -e POSTGRES_PASSWORD=your_secure_password \
  -p 5432:5432 \
  -d postgres:14

# 等待几秒钟让数据库启动 (Wait a few seconds for database to start)
sleep 5

# 运行架构脚本 (Run schema script)
docker exec -i habitplanet-postgres psql -U habitplanet_user -d habitplanet < server/schema.sql

# 可选：加载示例数据 (Optional: Load seed data)
docker exec -i habitplanet-postgres psql -U habitplanet_user -d habitplanet < server/seed.sql
```

---

## ⚙️ 环境配置 (Environment Configuration)

在项目根目录创建 `.env.local` 文件:

Create a `.env.local` file in the project root directory:

```env
# Gemini AI API Key
GEMINI_API_KEY=your_gemini_api_key_here

# Database Configuration
DATABASE_URL=postgresql://habitplanet_user:your_secure_password@localhost:5432/habitplanet

# Or use separate variables
DB_HOST=localhost
DB_PORT=5432
DB_NAME=habitplanet
DB_USER=habitplanet_user
DB_PASSWORD=your_secure_password

# Server Configuration
PORT=3000
NODE_ENV=development
```

**注意 (Note)**: 不要将 `.env.local` 文件提交到版本控制系统。它已经在 `.gitignore` 中。

Do not commit the `.env.local` file to version control. It's already in `.gitignore`.

---

## 🚀 运行服务 (Running the Server)

### 开发模式 (Development Mode)

```bash
# 1. 安装依赖 (Install dependencies)
npm install

# 2. 设置数据库 (Setup database - see above)

# 3. 启动开发服务器 (Start development server)
npm run dev
```

应用将在 `http://localhost:5173` 运行 (默认 Vite 端口)

The application will run at `http://localhost:5173` (default Vite port)

### 生产模式 (Production Mode)

```bash
# 1. 构建应用 (Build the application)
npm run build

# 2. 预览生产构建 (Preview production build)
npm run preview
```

---

## 📊 数据库迁移 (Database Migrations)

### 初始化数据库 (Initialize Database)

首次设置时运行:

Run this for initial setup:

```bash
psql -U habitplanet_user -d habitplanet -f server/schema.sql
```

### 重置数据库 (Reset Database)

**警告 (Warning)**: 这将删除所有数据！

This will delete all data!

```bash
# 删除并重建数据库 (Drop and recreate database)
psql -U postgres -c "DROP DATABASE IF EXISTS habitplanet;"
psql -U postgres -c "CREATE DATABASE habitplanet;"
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE habitplanet TO habitplanet_user;"

# 重新运行架构 (Re-run schema)
psql -U habitplanet_user -d habitplanet -f server/schema.sql
psql -U habitplanet_user -d habitplanet -f server/seed.sql
```

### 添加新的迁移 (Adding New Migrations)

在 `server/migrations/` 目录中创建新的 SQL 文件:

Create new SQL files in the `server/migrations/` directory:

```sql
-- server/migrations/001_add_new_feature.sql
ALTER TABLE habits ADD COLUMN priority INTEGER DEFAULT 0;
```

然后运行:

Then run:

```bash
psql -U habitplanet_user -d habitplanet -f server/migrations/001_add_new_feature.sql
```

---

## 📁 项目结构 (Project Structure)

```
server/
├── README.md              # 本文档 (This documentation)
├── schema.sql             # 数据库架构 (Database schema)
├── seed.sql               # 初始数据 (Seed data)
├── init-db.sh            # 数据库初始化脚本 (Database initialization script)
├── db.ts                  # 数据库连接和操作 (Database connection and operations)
├── controller.ts          # 业务逻辑控制器 (Business logic controllers)
├── geminiNodeWrapper.ts   # Gemini AI 包装器 (Gemini AI wrapper)
└── migrations/            # 数据库迁移文件 (Database migration files)
```

---

## 🔧 故障排除 (Troubleshooting)

### 连接问题 (Connection Issues)

如果无法连接到数据库:

If you cannot connect to the database:

1. **检查 PostgreSQL 是否运行** (Check if PostgreSQL is running)
   ```bash
   # macOS/Linux
   pg_isready
   
   # Or check process
   ps aux | grep postgres
   ```

2. **验证凭据** (Verify credentials)
   ```bash
   psql -U habitplanet_user -d habitplanet
   ```

3. **检查端口** (Check port)
   ```bash
   lsof -i :5432
   ```

### 权限问题 (Permission Issues)

```sql
-- 登录为超级用户 (Login as superuser)
psql -U postgres

-- 授予必要权限 (Grant necessary permissions)
GRANT ALL PRIVILEGES ON DATABASE habitplanet TO habitplanet_user;
ALTER USER habitplanet_user CREATEDB;

-- 如果表已存在，授予表权限 (If tables exist, grant table permissions)
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO habitplanet_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO habitplanet_user;
```

### 查看日志 (View Logs)

```bash
# PostgreSQL 日志位置 (PostgreSQL log location)
# macOS (Homebrew)
tail -f /usr/local/var/log/postgresql@14.log

# Ubuntu/Linux
tail -f /var/log/postgresql/postgresql-14-main.log
```

---

## 📚 其他资源 (Additional Resources)

- [PostgreSQL 官方文档](https://www.postgresql.org/docs/)
- [Node.js PostgreSQL 客户端](https://node-postgres.com/)
- [TypeScript 文档](https://www.typescriptlang.org/docs/)

---

## 🤝 贡献 (Contributing)

欢迎贡献！请确保:

Contributions are welcome! Please ensure:

1. 运行所有测试 (Run all tests)
2. 更新相关文档 (Update relevant documentation)
3. 遵循代码风格指南 (Follow code style guidelines)

---

## 📄 许可证 (License)

请查看项目根目录的 LICENSE 文件。

See LICENSE file in the project root.
