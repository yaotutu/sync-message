# 项目清理建议

## 需要删除的文件和文件夹
### 1. 配置文件合并
- `next.config.ts` 可以删除，但需要先合并其配置到 next.config.js
- 合并后的 next.config.js 应该包含：
  ```js
  /** @type {import('next').NextConfig} */
  const nextConfig = {
    reactStrictMode: true,
    eslint: {
      ignoreDuringBuilds: true,
    },
    webpack: (config) => {
      config.resolve.alias = {
        ...config.resolve.alias,
        '@': require('path').resolve(__dirname, 'src'),
      };
      return config;
    },
  };

  module.exports = nextConfig;
  ```
- `next.config.ts` - 已有 next.config.js，不需要 TypeScript 版本

### 2. 冗余的 API 路由
- `/src/app/api/messages/messages/` - 空文件夹，上级目录已包含 messages 路由
- `/src/app/api/user/[username]/cards/` - 未使用的路由
- `/src/app/user/[username]/cards/` - 对应的未使用前端页面

### 3. 空文件夹
- `/src/components/manage/` - 空文件夹
- `data/` - 空文件夹，数据库文件应该放在 prisma/data/ 中

### 4. 演示和测试文件
- `public/uploads/demo/` - 测试用的演示图片
- `public/uploads/aaa/` - 测试用的临时文件夹
- `test/card-key-api.test.ts` - 重复的测试文件，可以删除
  - 与 cardkey-api.test.ts 功能重复
  - cardkey-api.test.ts 的命名更规范且代码结构更清晰
  - 两个文件测试相同的 API：addCardKey, getUserCardKeys, deleteCardKey

### 5. 未使用的静态资源
- `public/next.svg` - Next.js 默认 logo
- `public/vercel.svg` - Vercel 默认 logo
- `public/globe.svg` - 未使用的图标
- `public/file.svg` - 未使用的图标
- `public/window.svg` - 未使用的图标

## 删除后需要检查
1. 确保 next.config.js 包含了所有必要的配置
2. 验证删除 cards 相关路由不会影响其他功能
3. 确保所有测试用例都被保留在正确的测试文件中
4. 检查是否有代码引用了将被删除的静态资源

## 建议的操作顺序
1. 首先备份整个项目
2. 删除空文件夹和明显未使用的文件
3. 删除重复的配置文件，确保主配置文件正确
4. 清理测试和演示数据
5. 最后删除冗余路由
6. 运行完整的测试套件确保未破坏任何功能

## 注意事项
- 删除文件前先确认没有其他地方引用
- 保留必要的测试数据和文件
- 可以考虑创建专门的测试资源目录
- 删除后需要重新运行构建确保系统正常工作