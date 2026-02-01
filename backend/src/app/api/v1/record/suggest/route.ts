import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { success, error, options } from '@/lib/response';

// OPTIONS - 处理 CORS 预检请求
export async function OPTIONS() {
    return options();
}

// 联想结果类型
interface SuggestionItem {
    student_name: string;
    class_name: string;
}

// GET /api/v1/record/suggest - 获取学生姓名联想
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const keyword = searchParams.get('keyword') || '';

        if (!keyword.trim()) {
            return success<SuggestionItem[]>([]);
        }

        // 查询匹配的学生姓名和班级（按组合去重）
        const records = await prisma.talkRecord.findMany({
            where: {
                studentName: {
                    contains: keyword,
                },
            },
            select: {
                studentName: true,
                className: true,
            },
            distinct: ['studentName', 'className'],
            orderBy: [
                { studentName: 'asc' },
                { className: 'asc' },
            ],
            take: 10,
        });

        // 转换为前端需要的格式
        const suggestions: SuggestionItem[] = records.map(r => ({
            student_name: r.studentName,
            class_name: r.className,
        }));

        return success(suggestions);
    } catch (err) {
        console.error('获取学生姓名联想失败:', err);
        return error('获取学生姓名联想失败', 500);
    }
}
