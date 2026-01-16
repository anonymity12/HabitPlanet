# HabitPlanet Frontend Architecture

本文档描述了 HabitPlanet 前端代码的组织结构。

This document describes the organization of the HabitPlanet frontend code.

---

## 📂 目录结构 (Directory Structure)

```
HabitPlanet/
├── App.tsx                      # 主应用组件 (Main app component)
├── index.tsx                    # 应用入口点 (Application entry point)
├── index.html                   # HTML 模板 (HTML template)
├── server/                      # 后端服务器代码 (Backend server code)
│   ├── README.md               # 服务器文档 (Server documentation)
│   ├── schema.sql              # 数据库架构 (Database schema)
│   ├── seed.sql                # 示例数据 (Seed data)
│   ├── init-db.sh              # 数据库初始化脚本 (DB init script)
│   ├── controller.ts           # 业务逻辑控制器 (Business logic controllers)
│   ├── db.ts                   # 数据库操作 (Database operations)
│   ├── geminiNodeWrapper.ts    # AI 服务包装器 (AI service wrapper)
│   └── migrations/             # 数据库迁移 (Database migrations)
│
└── src/                        # 前端源代码 (Frontend source code)
    ├── components/             # React 组件 (React components)
    │   ├── ui/                 # 基础 UI 组件 (Basic UI components)
    │   │   ├── Button.tsx     # 按钮组件 (Button component)
    │   │   ├── Card.tsx       # 卡片组件 (Card component)
    │   │   ├── Badge.tsx      # 徽章组件 (Badge component)
    │   │   ├── Loader.tsx     # 加载器组件 (Loader component)
    │   │   └── index.ts       # UI 组件导出 (UI exports)
    │   │
    │   ├── layout/             # 布局组件 (Layout components)
    │   │   ├── Navbar.tsx     # 导航栏 (Navigation bar)
    │   │   └── index.ts       # 布局导出 (Layout exports)
    │   │
    │   └── AddHabitModal.tsx   # 添加习惯模态框 (Add habit modal)
    │
    ├── views/                  # 页面视图组件 (Page view components)
    │   ├── DashboardView.tsx  # 仪表盘视图 (Dashboard view)
    │   ├── PlanetView.tsx     # 星球视图 (Planet view)
    │   ├── CardHouseView.tsx  # 卡牌屋视图 (Card house view)
    │   ├── StatsView.tsx      # 统计视图 (Stats view)
    │   └── index.ts           # 视图导出 (Views exports)
    │
    ├── hooks/                  # 自定义 React Hooks (Custom React hooks)
    │   ├── useHabitPlanet.ts  # 主应用逻辑钩子 (Main app logic hook)
    │   └── index.ts           # Hooks 导出 (Hooks exports)
    │
    ├── client/                 # 前端 API 客户端 (Frontend API client)
    │   └── api.ts             # API 调用封装 (API call wrapper)
    │
    ├── services/               # 服务层 (Service layer)
    │   ├── geminiService.ts   # AI 服务 (已弃用) (AI service - deprecated)
    │   └── storage.ts         # 存储服务 (Storage service)
    │
    ├── types.ts                # TypeScript 类型定义 (TypeScript type definitions)
    └── constants.tsx           # 常量和图标 (Constants and icons)
```

---

## 🏗 架构原则 (Architecture Principles)

### 1. 关注点分离 (Separation of Concerns)

- **components/ui/**: 可复用的基础 UI 组件，无业务逻辑
  - Reusable basic UI components with no business logic
  
- **components/layout/**: 应用布局组件
  - Application layout components
  
- **views/**: 页面级组件，包含特定页面的逻辑
  - Page-level components with page-specific logic
  
- **hooks/**: 自定义 React Hooks，封装可复用的逻辑
  - Custom React hooks encapsulating reusable logic

### 2. 单一职责 (Single Responsibility)

每个组件/文件只负责一个功能:

Each component/file is responsible for one thing:

- **Button.tsx**: 只处理按钮样式和变体
- **useHabitPlanet.ts**: 只处理习惯管理的状态逻辑
- **api.ts**: 只处理与后端的通信

### 3. 组件组合 (Component Composition)

较大的视图由较小的可复用组件组成:

Larger views are composed of smaller reusable components:

```typescript
// DashboardView uses Button, Card, Badge, Loader
<Card>
  <Button variant="primary">Click Me</Button>
  <Badge colorClass="bg-blue-100">Active</Badge>
</Card>
```

### 4. 自定义 Hooks (Custom Hooks)

业务逻辑从组件中提取到自定义 hooks:

Business logic is extracted from components into custom hooks:

```typescript
// App.tsx
const {
  habits,
  user,
  isLoading,
  handleAddHabit,
  handleDeleteHabit,
  handleCheckIn
} = useHabitPlanet();
```

---

## 📝 组件指南 (Component Guidelines)

### 创建新组件 (Creating New Components)

1. **基础 UI 组件** → `src/components/ui/`
   - 示例: Input, Select, Modal, Tabs
   
2. **布局组件** → `src/components/layout/`
   - 示例: Header, Footer, Sidebar
   
3. **页面视图** → `src/views/`
   - 示例: SettingsView, ProfileView
   
4. **特定功能组件** → `src/components/`
   - 示例: HabitCard, CheckInButton

### 命名约定 (Naming Conventions)

- **组件文件**: PascalCase (e.g., `Button.tsx`, `DashboardView.tsx`)
- **Hooks**: camelCase with 'use' prefix (e.g., `useHabitPlanet.ts`)
- **常量**: UPPER_SNAKE_CASE (e.g., `HABIT_TYPE_COLORS`)

### 导入顺序 (Import Order)

```typescript
// 1. React 和第三方库 (React and third-party libraries)
import React, { useState } from 'react';
import { LineChart } from 'recharts';

// 2. 类型定义 (Type definitions)
import { User, Habit } from '../types';

// 3. 组件 (Components)
import { Button, Card } from '../components/ui';

// 4. Hooks (Hooks)
import { useHabitPlanet } from '../hooks';

// 5. 常量和工具 (Constants and utilities)
import { Icons, HABIT_TYPE_COLORS } from '../constants';

// 6. 样式 (Styles) - if any
import './styles.css';
```

---

## 🔄 状态管理 (State Management)

当前使用 React 的内置状态管理:

Currently using React's built-in state management:

- **组件级状态**: `useState` for local component state
- **应用级状态**: Custom hooks (e.g., `useHabitPlanet`)
- **服务器状态**: API calls with optimistic updates

如果应用扩展，可以考虑:

For future scalability, consider:

- **Redux Toolkit** for complex global state
- **React Query** for server state management
- **Zustand** for lightweight global state

---

## 🧪 测试策略 (Testing Strategy)

推荐的测试结构:

Recommended testing structure:

```
src/
├── components/
│   ├── ui/
│   │   ├── Button.tsx
│   │   └── Button.test.tsx       # 单元测试
│   └── AddHabitModal.tsx
│       └── AddHabitModal.test.tsx
├── views/
│   └── DashboardView.tsx
│       └── DashboardView.test.tsx  # 集成测试
└── hooks/
    └── useHabitPlanet.ts
        └── useHabitPlanet.test.ts  # Hook 测试
```

---

## 📦 添加新功能 (Adding New Features)

### 示例: 添加通知系统 (Example: Adding Notification System)

1. **创建类型** (Create types) in `src/types.ts`:
   ```typescript
   export interface Notification {
     id: string;
     message: string;
     type: 'success' | 'error' | 'info';
   }
   ```

2. **创建 UI 组件** (Create UI component) `src/components/ui/Notification.tsx`:
   ```typescript
   export const Notification: React.FC<NotificationProps> = ({ ... }) => {
     // Component implementation
   };
   ```

3. **创建 Hook** (Create hook) `src/hooks/useNotifications.ts`:
   ```typescript
   export const useNotifications = () => {
     const [notifications, setNotifications] = useState<Notification[]>([]);
     // Logic here
   };
   ```

4. **在 App.tsx 中使用** (Use in App.tsx):
   ```typescript
   const { notifications, showNotification } = useNotifications();
   ```

---

## 🔧 最佳实践 (Best Practices)

### ✅ Do (推荐)

- ✅ 保持组件小而专注 (Keep components small and focused)
- ✅ 使用 TypeScript 类型 (Use TypeScript types)
- ✅ 提取可复用逻辑到 hooks (Extract reusable logic to hooks)
- ✅ 使用常量而不是魔法字符串 (Use constants instead of magic strings)
- ✅ 编写描述性的组件名称 (Write descriptive component names)

### ❌ Don't (避免)

- ❌ 在一个文件中放置所有逻辑 (Put all logic in one file)
- ❌ 直接在组件中写 API 调用 (Write API calls directly in components)
- ❌ 使用内联样式而不是 Tailwind 类 (Use inline styles instead of Tailwind classes)
- ❌ 忽略 TypeScript 错误 (Ignore TypeScript errors)
- ❌ 创建深层嵌套的组件 (Create deeply nested components)

---

## 🚀 性能优化 (Performance Optimization)

### 当前优化 (Current Optimizations)

1. **代码分割** (Code splitting) - 视图按需加载
2. **Memo化** (Memoization) - `useMemo` for expensive calculations
3. **优化渲染** (Optimized rendering) - Proper key props in lists

### 未来改进 (Future Improvements)

- Lazy loading for views: `React.lazy()`
- Virtual scrolling for long lists
- Image optimization with lazy loading
- Bundle size reduction

---

## 📚 相关资源 (Related Resources)

- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Vite Documentation](https://vitejs.dev/)

---

## 🤝 贡献指南 (Contributing Guidelines)

在添加新代码之前:

Before adding new code:

1. 检查现有组件是否可复用 (Check if existing components can be reused)
2. 遵循当前的文件结构 (Follow the current file structure)
3. 添加适当的 TypeScript 类型 (Add proper TypeScript types)
4. 更新本文档（如适用） (Update this documentation if applicable)

---

*最后更新: 2024-01-16*
