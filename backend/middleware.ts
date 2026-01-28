import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// CORS 中间件 - 处理跨域请求
export function middleware(request: NextRequest) {
    // 处理 OPTIONS 预检请求
    if (request.method === 'OPTIONS') {
        return new NextResponse(null, {
            status: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
                'Access-Control-Max-Age': '86400',
            },
        });
    }

    // 对于其他请求，添加 CORS 响应头
    const response = NextResponse.next();
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

    return response;
}

// 配置中间件匹配的路径
export const config = {
    matcher: '/api/:path*',
};
