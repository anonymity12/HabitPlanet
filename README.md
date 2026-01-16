| 获得的卡片 | 游戏界面 | 游戏界面2 |
|:-:|:-:|:-:|
|![alt text](md_pics/README/image.png)|![alt text](md_pics/README/image-1.png)|![alt text](md_pics/README/image-2.png)|

# HabitPlanet - 习惯养成星球 🌍

一个游戏化的习惯追踪应用，通过培养虚拟宠物和收集卡牌来帮助用户建立良好的习惯。

A gamified habit tracking application that helps users build good habits by nurturing virtual pets and collecting cards.

---

## ✨ 特性 (Features)

- 🎯 **习惯追踪** - 创建和管理日常习惯
- 🐲 **宠物养成** - 完成习惯来升级你的宠物
- 🎴 **卡牌收集** - 使用金币抽取道教传说人物卡牌
- 📊 **数据分析** - 查看你的进度和统计数据
- 🤖 **AI 建议** - 获取个性化的习惯建议

---

## 🚀 快速开始 (Quick Start)

### 前置要求 (Prerequisites)

- **Node.js** 18+ 
- **PostgreSQL** 14+ (可选 - 或使用 LocalStorage)

### 安装 (Installation)

```bash
# 1. 克隆仓库 (Clone repository)
git clone https://github.com/anonymity12/HabitPlanet.git
cd HabitPlanet

# 2. 安装依赖 (Install dependencies)
npm install

# 3. 配置环境变量 (Configure environment variables)
# 创建 .env.local 文件 (Create .env.local file)
cp .env.local.example .env.local
# 编辑并添加你的 Gemini API key

# 4. (可选) 设置 PostgreSQL 数据库 (Optional: Setup PostgreSQL)
# 查看 server/README.md 获取详细说明
cd server
./init-db.sh

# 5. 启动开发服务器 (Start development server)
npm run dev
```

应用将在 `http://localhost:5173` 运行

The app will run at `http://localhost:5173`

---

## 📚 文档 (Documentation)

- **[服务器文档](server/README.md)** - PostgreSQL 数据库设置和 API 文档
- **[前端架构](FRONTEND_ARCHITECTURE.md)** - 前端代码组织和最佳实践

---

## 🏗 项目结构 (Project Structure)

```
HabitPlanet/
├── App.tsx                  # 主应用组件
├── index.tsx                # 入口点
├── server/                  # 后端服务器代码
│   ├── README.md           # 数据库设置指南
│   ├── schema.sql          # PostgreSQL 架构
│   ├── seed.sql            # 示例数据
│   ├── init-db.sh          # 数据库初始化脚本
│   └── migrations/         # 数据库迁移
└── src/                     # 前端源代码
    ├── components/         # React 组件
    │   ├── ui/            # 基础 UI 组件
    │   ├── layout/        # 布局组件
    │   └── *.tsx          # 特定功能组件
    ├── views/              # 页面视图
    ├── hooks/              # 自定义 React Hooks
    ├── client/             # API 客户端
    ├── types.ts            # TypeScript 类型
    └── constants.tsx       # 常量和图标
```

---

## 🛠 技术栈 (Tech Stack)

### 前端 (Frontend)
- **React** 19.2.1 - UI 框架
- **TypeScript** 5.8.2 - 类型安全
- **Vite** 6.2.0 - 构建工具
- **Tailwind CSS** - 样式 (通过内联类)
- **Recharts** 3.5.1 - 数据可视化

### 后端 (Backend)
- **Node.js** - 运行时环境
- **PostgreSQL** 14+ - 数据库
- **Gemini AI** - AI 功能

---

## 📝 可用脚本 (Available Scripts)

```bash
# 开发模式 (Development)
npm run dev

# 构建生产版本 (Build for production)
npm run build

# 预览生产构建 (Preview production build)
npm run preview

# 数据库初始化 (Initialize database)
cd server && ./init-db.sh
```

---

## 🗄️ 数据库设置 (Database Setup)

### 方法 1: 自动设置 (Automated Setup)

```bash
cd server
./init-db.sh
```

### 方法 2: 手动设置 (Manual Setup)

```bash
# 登录 PostgreSQL
psql -U postgres

# 创建数据库和用户
CREATE DATABASE habitplanet;
CREATE USER habitplanet_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE habitplanet TO habitplanet_user;

# 运行架构
psql -U habitplanet_user -d habitplanet -f server/schema.sql
psql -U habitplanet_user -d habitplanet -f server/seed.sql
```

查看 [server/README.md](server/README.md) 获取详细说明。

See [server/README.md](server/README.md) for detailed instructions.

---

## 🎮 使用方法 (Usage)

1. **创建习惯** - 点击 "+" 按钮添加新习惯
2. **完成习惯** - 点击习惯卡片上的圆圈完成打卡
3. **获取奖励** - 赚取金币和经验值来升级宠物
4. **抽取卡牌** - 在星球视图中进入卡牌屋，使用金币抽卡
5. **查看统计** - 在统计页面查看你的进度和获取 AI 建议

---

## 🔒 环境变量 (Environment Variables)

在 `.env.local` 文件中配置:

Configure in `.env.local` file:

```env
# Gemini AI API Key (必需 - Required)
GEMINI_API_KEY=your_gemini_api_key_here

# Database Configuration (可选 - Optional)
DATABASE_URL=postgresql://habitplanet_user:password@localhost:5432/habitplanet
DB_HOST=localhost
DB_PORT=5432
DB_NAME=habitplanet
DB_USER=habitplanet_user
DB_PASSWORD=your_password
```

---

## 🤝 贡献 (Contributing)

欢迎贡献！请遵循以下步骤:

Contributions are welcome! Please follow these steps:

1. Fork 项目 (Fork the project)
2. 创建功能分支 (Create your feature branch): `git checkout -b feature/AmazingFeature`
3. 提交更改 (Commit your changes): `git commit -m 'Add some AmazingFeature'`
4. 推送到分支 (Push to the branch): `git push origin feature/AmazingFeature`
5. 开启拉取请求 (Open a Pull Request)

---

## 📄 许可证 (License)

本项目遵循 MIT 许可证。

This project is licensed under the MIT License.

---

## 🙏 致谢 (Acknowledgments)

- [Google Gemini AI](https://ai.google.dev/) - AI 功能支持
- [React](https://react.dev/) - 前端框架
- [Tailwind CSS](https://tailwindcss.com/) - 样式灵感
- [Recharts](https://recharts.org/) - 图表库

---

## 📧 联系方式 (Contact)

项目链接: [https://github.com/anonymity12/HabitPlanet](https://github.com/anonymity12/HabitPlanet)

AI Studio: [https://ai.studio/apps/drive/1HyfhzIYu08aCFPdlTGRdDIKmnmRlw27m](https://ai.studio/apps/drive/1HyfhzIYu08aCFPdlTGRdDIKmnmRlw27m)

---

Made with ❤️ by the HabitPlanet Team
