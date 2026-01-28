import { NextResponse } from 'next/server';

// CORS 响应头
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
};

// 统一响应格式接口
interface ApiResponse<T = unknown> {
    code: number;
    message: string;
    data: T;
}

// OPTIONS 预检请求响应
export function options(): NextResponse {
    return new NextResponse(null, {
        status: 200,
        headers: corsHeaders,
    });
}

// 成功响应
export function success<T>(data: T, message: string = 'success'): NextResponse<ApiResponse<T>> {
    return NextResponse.json(
        {
            code: 200,
            message,
            data,
        },
        { headers: corsHeaders }
    );
}

// 错误响应
export function error(message: string, code: number = 400): NextResponse<ApiResponse<null>> {
    return NextResponse.json(
        {
            code,
            message,
            data: null,
        },
        { status: code >= 500 ? code : 200, headers: corsHeaders }
    );
}

// 分页响应数据结构
export interface PaginatedData<T> {
    list: T[];
    total: number;
    page: number;
    size: number;
    totalPages: number;
}

// 分页成功响应
export function paginatedSuccess<T>(
    list: T[],
    total: number,
    page: number,
    size: number,
    message: string = 'success'
): NextResponse<ApiResponse<PaginatedData<T>>> {
    return NextResponse.json(
        {
            code: 200,
            message,
            data: {
                list,
                total,
                page,
                size,
                totalPages: Math.ceil(total / size),
            },
        },
        { headers: corsHeaders }
    );
}

