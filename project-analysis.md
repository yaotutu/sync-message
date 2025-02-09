# 项目架构与功能分析

## 技术栈
- 前端框架：Next.js
- 数据库：SQLite (通过 Prisma ORM)
- UI：Tailwind CSS
- 认证：基于用户名和密码的自定义认证系统

## 核心功能模块

### 1. 消息系统
- 基于卡密的消息访问控制
- 实时消息更新（5秒轮询）
- 消息过期机制（3分钟有效期）
- 用户会话管理
- 消息列表展示

#### 卡密特性
- 一次性使用机制
- 3分钟有效期限制
- 状态跟踪（未使用/使用中/已过期）
- 自动过期处理
- 批量生成功能

### 2. 用户系统
- 用户注册与登录
- 用户配置管理（主题、语言等）
- 用户权限控制

### 2. 卡密系统
- 卡密生成
- 卡密验证
- 卡密使用状态跟踪
- 卡密关联用户

### 3. 商品管理系统
- 商品 CRUD 操作
- 商品属性：
  - 标题
  - 图片
  - 链接
  - 价格
  - 描述
  - 备注
- 图片上传功能
- 商品列表展示

## 数据模型

### User (用户)
```prisma
model User {
  id        String      @id @default(cuid())
  username  String      @unique
  password  String
  products  Product[]
  config    UserConfig?
  cardKeys  CardKey[]
}
```

### Product (商品)
```prisma
model Product {
  id          String    @id
  title       String
  imageUrl    String?
  link        String
  price       Float?
  description String?
  notes       String?
  user        User      @relation
}
```

### CardKey (卡密)
```prisma
model CardKey {
  id        String    @id
  key       String    @unique
  userId    String
  used      Boolean   @default(false)
  usedAt    DateTime?
}
```

### UserConfig (用户配置)
```prisma
model UserConfig {
  theme     String?
  language  String?
  user      User     @relation
}
```

## API 结构

### 用户相关 API
- POST `/api/user/login` - 用户登录
- GET `/api/user/status` - 获取用户状态
- POST `/api/user/verify` - 验证用户
- POST `/api/user/update-password` - 更新密码

### 商品相关 API
- GET `/api/user/[username]/products` - 获取用户商品列表
- POST `/api/user/[username]/products` - 创建商品
- PUT `/api/user/[username]/products` - 更新商品
- DELETE `/api/user/[username]/products` - 删除商品

### 卡密相关 API
- POST `/api/cardkey/generate` - 生成卡密
- POST `/api/cardkey/validate` - 验证卡密
- GET `/api/user/[username]/cardkeys` - 获取用户卡密列表

### 文件上传 API
- POST `/api/user/[username]/upload` - 上传文件（主要用于商品图片）

## 业务流程

### 消息访问流程
1. 用户获取一次性卡密
2. 在消息页面输入卡密进行验证
3. 验证成功后：
   - 系统标记卡密为已使用
   - 记录使用时间
   - 开始3分钟计时
   - 允许访问消息内容
4. 消息访问期间：
   - 前端每5秒自动刷新消息
   - 显示剩余时间倒计时
   - 过期后自动退出
5. 安全机制：
   - 卡密一次性使用
   - 3分钟后自动失效
   - 退出后无法重新使用相同卡密

### 卡密管理流程
1. 用户登录系统
2. 进入卡密管理界面
3. 可以进行以下操作：
   - 批量生成新卡密
   - 查看卡密列表及状态
   - 删除未使用的卡密
4. 卡密状态管理：
   - 跟踪每个卡密的使用状态
   - 显示使用中卡密的剩余时间
   - 自动标记过期卡密

### 商品管理流程
1. 用户登录系统
2. 进入商品管理界面
3. 可以进行以下操作：
   - 添加新商品（包含图片上传）
   - 编辑现有商品
   - 删除商品
   - 查看商品列表

### 卡密使用流程
1. 管理员生成卡密
2. 用户输入卡密进行验证
3. 系统验证卡密有效性
4. 卡密使用后标记为已使用，记录使用时间

## 安全特性
- 所有 API 请求都需要用户认证
- 密码在传输时使用明文（建议改进为加密传输）
- 图片上传有文件类型限制
- API 路由包含错误处理和验证

## 可扩展性
1. 数据库使用 Prisma，方便未来切换到其他数据库
2. 模块化的代码结构，便于添加新功能
3. 前端使用组件化开发，易于维护和扩展
4. 配置系统支持主题和语言设置，为国际化做准备

## 建议改进点

### 1. 安全性增强
- 实现密码加密存储和传输（当前使用明文）
- 添加请求频率限制防止暴力破解
- 实现 JWT 或其他 token 认证机制
- 添加 API 访问日志记录
- 添加卡密生成的加密算法
- 实现敏感操作的二次验证

### 2. 消息系统优化
- 使用 WebSocket 实现实时消息推送（替代当前的轮询机制）
- 添加消息历史记录功能
- 实现消息内容的加密存储
- 支持富文本消息格式
- 添加消息已读状态tracking

### 3. 卡密系统增强
- 实现多级别卡密（不同有效期）
- 提供卡密批量导入/导出功能
- 添加卡密使用数据统计
- 实现卡密自动失效机制优化
- 支持卡密临时禁用功能

### 4. 性能优化
- 实现数据缓存机制（Redis）
- 优化数据库查询性能
- 实现分页加载机制
- 添加图片 CDN 支持
- 实现前端静态资源缓存

### 5. 用户体验
- 优化移动端适配
- 完善深色模式主题
- 实现多语言国际化
- 添加用户引导和帮助文档
- 优化表单验证和错误提示

### 6. 系统可靠性
- 添加完整的错误处理机制
- 实现数据定期备份
- 添加系统监控和告警
- 实现服务健康检查
- 添加操作审计日志

### 7. 架构升级
- 分离前后端部署
- 实现微服务架构
- 添加消息队列处理异步任务
- 实现分布式会话管理
- 添加服务容器化支持