# 认证机制优化实施计划

## 阶段一：紧急修复

### 1. 优化登录流程
```typescript
// src/lib/hooks/useAuth.ts
const login = async (username: string, password: string): Promise<boolean> => {
  try {
    // 1. 先存储凭证
    localStorage.setItem('username', username);
    localStorage.setItem('password', password);
    
    // 2. 验证存储是否成功
    const storedUsername = localStorage.getItem('username');
    const storedPassword = localStorage.getItem('password');
    
    if (!storedUsername || !storedPassword) {
      throw new Error('凭证存储失败');
    }
    
    // 3. 再进行页面跳转
    if (status.intendedPath) {
      router.push(status.intendedPath);
    } else {
      router.push(`/user/${username}/cardkeys`);
    }
    
    return true;
  } catch (error) {
    console.error('登录失败:', error);
    return false;
  }
}
```

### 2. 添加重试机制
```typescript
// src/lib/utils/fetchWithRetry.ts
export const fetchWithRetry = async (
  url: string, 
  options: RequestInit,
  retries: number = 3
): Promise<Response> => {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      if (response.ok || i === retries - 1) {
        return response;
      }
      // 等待延迟时间后重试
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
    } catch (error) {
      if (i === retries - 1) throw error;
    }
  }
  throw new Error('请求失败');
};
```

### 3. 改进错误处理
```typescript
// src/lib/hooks/useAuth.ts
const validateAuth = async () => {
  try {
    const username = localStorage.getItem('username');
    const password = localStorage.getItem('password');

    if (!username || !password) {
      setStatus(prev => ({
        ...prev,
        isAuthenticated: false,
        loading: false
      }));
      return;
    }

    const response = await fetchWithRetry('/api/user/verify', {
      headers: {
        'x-username': username,
        'x-password': password
      }
    });

    const data = await response.json();

    // 只在明确的认证失败时清除凭证
    if (response.status === 401) {
      localStorage.removeItem('username');
      localStorage.removeItem('password');
    }

    setStatus(prev => ({
      ...prev,
      isAuthenticated: data.success,
      username: data.success ? username : null,
      error: data.success ? null : data.message,
      loading: false
    }));
  } catch (error) {
    // 网络错误等情况下保留凭证
    setStatus(prev => ({
      ...prev,
      error: '验证失败，请检查网络连接',
      loading: false
    }));
  }
};
```

## 阶段二：中期优化

### 1. 实现请求拦截器
```typescript
// src/lib/interceptors/auth.ts
export const createAuthInterceptor = () => {
  return async (request: Request) => {
    const username = localStorage.getItem('username');
    const password = localStorage.getItem('password');

    if (username && password) {
      request.headers.set('x-username', username);
      request.headers.set('x-password', password);
    }

    return request;
  };
};
```

### 2. 添加路由中间件
```typescript
// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // 检查用户访问权限
  const requestedUsername = request.nextUrl.pathname.split('/')[2];
  const authUsername = request.headers.get('x-username');

  if (requestedUsername && authUsername && requestedUsername !== authUsername) {
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/user/:username*'
};
```

## 阶段三：长期规划

### 1. JWT 实现计划
- 创建 JWT 工具类
- 实现 token 刷新机制
- 设置合适的过期时间
- 添加 token 黑名单机制

### 2. 状态管理升级
- 使用 Zustand 管理认证状态
- 实现持久化存储
- 添加状态同步机制

### 3. 监控系统
- 集成错误追踪
- 添加性能监控
- 实现用户行为分析
- 设置告警机制

## 时间节点

1. 紧急修复（1-2天）
   - 优化登录流程
   - 实现重试机制
   - 改进错误处理

2. 中期优化（1周）
   - 实现请求拦截器
   - 添加路由中间件
   - 完善错误处理

3. 长期规划（1个月）
   - JWT 实现
   - 状态管理升级
   - 监控系统搭建

## 风险评估

1. 兼容性风险
   - localStorage 在隐私模式可能不可用
   - 浏览器兼容性问题

2. 安全风险
   - 凭证传输安全
   - XSS 攻击防范
   - CSRF 防护

3. 性能风险
   - 重试机制导致的延迟
   - JWT 解析开销

## 回滚策略

1. 代码回滚
   - 保留当前版本备份
   - 准备回滚脚本
   - 设置回滚触发条件

2. 数据回滚
   - 数据备份策略
   - 回滚验证流程
   - 用户通知机制