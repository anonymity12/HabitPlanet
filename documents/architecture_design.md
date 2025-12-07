# HabitPlanet 架构设计文档 (V1.0)

## 1. 概述
HabitPlanet 是一款游戏化的习惯养成应用。目前的版本基于 React + LocalStorage 的纯前端架构。为了支持用户账户、多端同步、防作弊（游戏化逻辑）以及保护 AI API 密钥，我们需要将其迁移到标准的前后端分离架构。

## 2. 系统架构图 (High-Level)

```mermaid
graph TD
    Client[Web Client / Mobile H5] -->|HTTPS / REST API| LB[Load Balancer / Nginx]
    LB --> API[Node.js API Server]
    
    subgraph Backend Services
        API --> Auth[Auth Service (JWT)]
        API --> Logic[Game & Habit Logic]
        API --> AI_Svc[AI Integration Service]
    end
    
    subgraph Data Layer
        Logic --> DB[(PostgreSQL)]
        Logic --> Cache[(Redis - Optional for Leaderboards)]
    end
    
    subgraph External
        AI_Svc --> Gemini[Google Gemini API]
    end
```

## 3. 技术栈选型

### 3.1 前端 (Frontend) - 保持现有并在其上迭代
*   **Framework**: React 19 (TypeScript)
*   **State Management**: React Context API 或 Zustand (替代直接读写 LocalStorage)
*   **Network**: Axios 或 TanStack Query (React Query) 用于 API 请求管理
*   **UI**: Tailwind CSS
*   **Build**: Vite

### 3.2 后端 (Backend) - 新增
*   **Runtime**: Node.js (LTS)
*   **Framework**: NestJS 或 Express + TypeScript (推荐 NestJS 以获得更好的模块化结构)
*   **ORM**: Prisma (类型安全，不仅开发体验好，且易于维护)
*   **Auth**: Passport.js (JWT Strategy)

### 3.3 数据库 (Database)
*   **Primary DB**: PostgreSQL (关系型数据，适合存储用户、习惯、关联关系)
*   **Cache**: Redis (用于缓存排行榜、高频的用户Session信息，可选)

---

## 4. 数据库设计 (Schema Design)

### Users (用户表)
| Field | Type | Description |
|---|---|---|
| id | UUID | 主键 |
| email | String | 唯一，账号 |
| password_hash | String | 加密后的密码 |
| nickname | String | 昵称 |
| coins | Integer | 金币数量 (服务端校验) |
| pet_level | Integer | 宠物等级 |
| pet_exp | Integer | 宠物经验值 |
| created_at | Timestamp | 注册时间 |

### Habits (习惯表)
| Field | Type | Description |
|---|---|---|
| id | UUID | 主键 |
| user_id | UUID | 外键 -> Users.id |
| title | String | 习惯名称 |
| type | Enum | Study, Fitness, Life, Work |
| frequency | Enum | Daily, Weekly, Custom |
| target_count | Integer | 目标次数 |
| created_at | Timestamp | |

### CheckIns (打卡记录表)
*用于统计和地理位置分析*
| Field | Type | Description |
|---|---|---|
| id | UUID | 主键 |
| habit_id | UUID | 外键 -> Habits.id |
| user_id | UUID | 外键 -> Users.id (冗余字段方便查询) |
| checkin_date | Date | 打卡日期 (YYYY-MM-DD) |
| location_lat | Float | 纬度 |
| location_lng | Float | 经度 |
| image_url | String | 上传的凭证图片URL |
| note | Text | 备注 |
| created_at | Timestamp | 实际打卡时间戳 |

### Cards (卡牌图鉴表)
*定义卡牌元数据*
| Field | Type | Description |
|---|---|---|
| id | UUID | 主键 |
| name | String | 人物名 (如 Laozi) |
| rarity | Enum | Common, Rare, Epic, Legendary |
| base_value | Integer | 基础价值 |
| image_prompt | Text | 用于生成图片的Prompt模板 |

### UserCards (用户卡牌库存)
*用户拥有的卡牌实例*
| Field | Type | Description |
|---|---|---|
| id | UUID | 主键 |
| user_id | UUID | 外键 |
| card_name | String | 卡牌名称 |
| rarity | String | 稀有度 |
| value | Integer | 实际价值 (可能有浮动) |
| image_url | String | 生成的具体图片地址 (OSS/S3地址) |
| obtained_at | Timestamp | 获得时间 |

---

## 5. 关键 API 接口定义

所有接口位于 `/api/v1` 下。

### 5.1 认证 (Auth)
*   `POST /auth/register`: 注册
*   `POST /auth/login`: 登录，返回 JWT Token

### 5.2 习惯 (Habits)
*   `GET /habits`: 获取当前用户所有习惯及今日状态
*   `POST /habits`: 创建新习惯
*   `DELETE /habits/:id`: 删除习惯
*   `POST /habits/:id/checkin`: **核心业务**。
    *   **后端逻辑**: 
        1. 验证是否重复打卡。
        2. 记录打卡数据。
        3. 计算 Streak (连续打卡)。
        4. 计算奖励 (金币/经验)，更新 User 表。
        5. 返回更新后的 Habit 状态和本次获得的奖励。

### 5.3 游戏化 & 卡牌屋 (Game & Gacha)
*   `GET /game/profile`: 获取用户宠物状态、金币、皮肤等。
*   `POST /game/gacha/draw`: **抽卡接口**。
    *   **后端逻辑**:
        1. 检查金币是否足够 ( >= 100)。
        2. 扣除金币 (事务操作)。
        3. **服务端计算随机数** 决定稀有度和卡牌人物 (防止前端篡改概率)。
        4. 如果是新卡，服务端调用 Gemini API 生成图片并上传至对象存储 (或返回 Base64，但在生产环境建议存云存储)。
        5. 写入 `UserCards` 表。
        6. 返回卡牌结果。
*   `GET /game/cards`: 获取用户卡牌图鉴。

### 5.4 AI 洞察 (Insights)
*   `GET /insights/advice`: 获取 AI 建议。
    *   **后端逻辑**:
        1. 查询该用户最近 7-30 天的 `CheckIns` 记录。
        2. 组装 Prompt。
        3. **服务端调用 Google GenAI SDK** (API Key 存储在服务器环境变量中，不暴露给前端)。
        4. 返回 AI 的建议文本。

---

## 6. 安全与迁移策略

### 6.1 安全性
*   **API Key 保护**: Gemini API Key 仅保存在后端 `.env` 文件中。
*   **JWT 验证**: 除登录/注册外，所有接口需 Header 携带 `Authorization: Bearer <token>`。
*   **防作弊**: 金币扣除、经验增长、抽卡概率全部在后端计算，前端仅负责渲染结果。

### 6.2 开发阶段 Mock 策略
在后端未完全就绪前，前端可创建一个 `apiClient` 抽象层。
*   **Phase 1 (Current)**: `apiClient` 调用 `localStorage`。
*   **Phase 2 (Hybrid)**: `apiClient` 对于 AI 接口调用 Next.js API Route 或 临时 Node 服务，其他走 LocalStorage。
*   **Phase 3 (Final)**: `apiClient` 全部指向真实后端 API。

## 7. 目录结构建议 (Monorepo 风格)

```text
/habit-planet-root
  /documents        # 设计文档
  /frontend         # 现有的 React 项目 (移动到此处)
  /backend          # 新建的 Node.js 项目
    /src
      /modules
        /auth
        /habits
        /gacha
        /ai
      /prisma       # DB Schema
  /docker-compose.yml
```
