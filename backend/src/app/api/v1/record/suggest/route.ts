import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { success, error, options } from '@/lib/response';

// OPTIONS - 处理 CORS 预检请求
export async function OPTIONS() {
    return options();
}

// GET /api/v1/record/suggest - 获取学生姓名联想
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const keyword = searchParams.get('keyword') || '';

        if (!keyword.trim()) {
            return success<string[]>([]);
        }

        // 查询匹配的学生姓名（去重）
        const records = await prisma.talkRecord.findMany({
            where: {
                studentName: {
                    contains: keyword,
                },
            },
            select: {
                studentName: true,
            },
            distinct: ['studentName'],
            orderBy: {
                studentName: 'asc',
            },
            take: 10,
        });

        // 提取学生姓名数组
        const suggestions = records.map(r => r.studentName);

        return success(suggestions);
    } catch (err) {
        console.error('获取学生姓名联想失败:', err);
        return error('获取学生姓名联想失败', 500);
    }
}
