import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { success, error, options } from '@/lib/response';

// OPTIONS - 处理 CORS 预检请求
export async function OPTIONS() {
    return options();
}

interface RouteParams {
    params: Promise<{ id: string }>;
}

interface AddDetailBody {
    tag_value: string;
}

// POST /api/v1/quick-tag/:id/detail - 添加标签明细
export async function POST(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const tagId = parseInt(id, 10);

        if (isNaN(tagId)) {
            return error('无效的类别ID', 400);
        }

        const body: AddDetailBody = await request.json();

        if (!body.tag_value || body.tag_value.trim() === '') {
            return error('标签值不能为空', 400);
        }

        // 检查类别是否存在
        const category = await prisma.quickTag.findUnique({
            where: { id: tagId },
        });

        if (!category) {
            return error('类别不存在', 404);
        }

        // 检查是否已存在相同的标签值
        const existingDetail = await prisma.quickTagDetail.findFirst({
            where: {
                tagId: tagId,
                tagValue: body.tag_value.trim(),
            },
        });

        if (existingDetail) {
            return error('该标签已存在', 400);
        }

        // 获取当前最大排序值
        const maxSortOrder = await prisma.quickTagDetail.findFirst({
            where: { tagId: tagId },
            orderBy: { sortOrder: 'desc' },
            select: { sortOrder: true },
        });

        // 创建新标签明细
        const detail = await prisma.quickTagDetail.create({
            data: {
                tagId: tagId,
                tagValue: body.tag_value.trim(),
                isActive: 1,
                sortOrder: (maxSortOrder?.sortOrder || 0) + 1,
            },
        });

        return success(
            {
                id: detail.id,
                tag_id: detail.tagId,
                tag_value: detail.tagValue,
                is_active: detail.isActive,
                sort_order: detail.sortOrder,
                create_time: detail.createTime,
            },
            '添加成功'
        );
    } catch (err) {
        console.error('添加标签明细失败:', err);
        return error('添加标签明细失败', 500);
    }
}
