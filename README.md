# 消息同步系统

这是一个基于 Node.js 的消息同步系统，支持通过 WebSocket 实时推送消息，并使用卡密验证机制进行访问控制。系统采用 SQLite 数据库进行数据持久化存储，支持多用户管理和消息实时同步。

## 功能特性

- 🔐 基于卡密的访问控制
- 📱 实时消息推送
- 👥 多用户管理
- 🕒 卡密时效性控制（3分钟有效期）
- 📝 消息持久化存储
- 🔄 自动重连机制
- 📊 使用状态监控

## 技术架构

- **后端**：
  - Node.js + Express
  - WebSocket (ws)
  - SQLite3 数据库
  - RESTful API

- **前端**：
  - 原生 JavaScript
  - WebSocket 客户端
  - 响应式设计

- **数据存储**：
  - SQLite 数据库
  - 用户信息表
  - 卡密记录表
  - 消息记录表

## 安装部署

1. 克隆项目
```bash
git clone [项目地址]
cd [项目目录]
```

2. 安装依赖
```bash
npm install
```

3. 配置环境变量
```bash
cp .env.example .env
# 编辑 .env 文件，设置必要的环境变量
```

4. 启动服务
```bash
# 开发环境
npm run dev

# 生产环境
npm start
```

## 使用流程

### 管理员操作流程

1. 登录管理后台
   - 访问 `/manage` 页面
   - 使用管理员账号密码登录

2. 生成卡密
   - 在管理界面选择生成卡密
   - 可以选择生成数量（1-10个）
   - 系统会显示生成的卡密列表

3. 查看使用记录
   - 可以查看卡密的使用状态
   - 监控在线用户

### 用户使用流程

1. 获取卡密
   - 从管理员处获取有效卡密

2. 登录系统
   - 访问首页
   - 输入卡密进行登录
   - 登录成功后可以看到倒计时（3分钟有效期）

3. 接收消息
   - 登录后自动连接 WebSocket
   - 实时接收推送的消息
   - 可以查看历史消息记录

### WebHook 使用方法

1. 配置 WebHook
```bash
# POST 请求示例
curl -X POST http://your-domain/api/webhook \
  -H "Content-Type: application/json" \
  -H "x-webhook-key: YOUR_WEBHOOK_KEY" \
  -H "x-username: USERNAME" \
  -d '{"message": "测试消息", "sender": "测试用户"}'
```

2. 消息格式
```json
{
  "message": "消息内容",
  "sender": "发送者名称"
}
```

## API 文档

### 卡密相关接口

#### 生成卡密
- 路径：`POST /api/cardkey/generate`
- 参数：
  ```json
  {
    "count": 1 // 生成数量，1-10
  }
  ```
- 响应：
  ```json
  {
    "success": true,
    "message": "生成成功",
    "keys": ["generated_key_1", "generated_key_2"]
  }
  ```

#### 验证卡密
- 路径：`POST /api/cardkey/validate`
- 参数：
  ```json
  {
    "key": "your_card_key"
  }
  ```
- 响应：
  ```json
  {
    "success": true,
    "message": "验证成功",
    "expiresIn": 180000 // 过期时间（毫秒）
  }
  ```

### 消息相关接口

#### 获取消息列表
- 路径：`GET /api/messages/messages`
- 请求头：
  ```
  x-card-key: your_card_key
  ```
- 响应：
  ```json
  {
    "success": true,
    "messages": [
      {
        "content": "消息内容",
        "received_at": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
  ```

## 技术要点

1. **卡密验证机制**
   - 使用 crypto 模块生成随机卡密
   - 基于时间戳的有效期控制
   - 一次性使用机制

2. **WebSocket 实现**
   - 客户端自动重连机制
   - 心跳检测
   - 消息实时推送

3. **数据库设计**
   - 用户表：存储用户信息
   - 卡密表：记录卡密状态
   - 消息表：存储历史消息

4. **安全性考虑**
   - 卡密加密存储
   - 请求验证
   - 数据持久化

## 注意事项

1. 卡密使用限制
   - 每个卡密有效期为3分钟
   - 卡密使用后立即失效
   - 不支持重复使用

2. 消息同步
   - 支持断线重连
   - 每30秒自动刷新一次消息
   - 支持实时推送

3. 系统限制
   - 单次最多生成10个卡密
   - WebSocket 保持长连接
   - 需要稳定的网络环境

## 常见问题

1. Q: 卡密无法使用？
   A: 检查卡密是否已过期或已被使用

2. Q: 消息无法实时接收？
   A: 检查网络连接，系统会自动尝试重连

3. Q: 如何续期卡密？
   A: 当前版本不支持续期，需要使用新的卡密

## 更新日志

### v1.0.0
- 初始版本发布
- 基础功能实现：卡密验证、消息同步
- WebSocket 实时推送
- 数据库持久化存储
