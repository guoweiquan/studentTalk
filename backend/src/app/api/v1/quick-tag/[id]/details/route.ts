import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { success, error } from '@/lib/response';

interface RouteParams {
    params: Promise<{ id: string }>;
}

// GET /api/v1/quick-tag/:id/details - 获取指定类别的明细列表
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const tagId = parseInt(id, 10);

        if (isNaN(tagId)) {
            return error('无效的类别ID', 400);
        }

        // 获取类别信息
        const category = await prisma.quickTag.findUnique({
            where: { id: tagId },
        });

        if (!category) {
            return error('类别不存在', 404);
        }

        // 获取明细列表
        const details = await prisma.quickTagDetail.findMany({
            where: {
                tagId: tagId,
                isActive: 1,
            },
            orderBy: {
                sortOrder: 'asc',
            },
        });

        return success({
            category: {
                id: category.id,
                category_code: category.categoryCode,
                category_name: category.categoryName,
            },
            details: details.map((detail) => ({
                id: detail.id,
                tag_value: detail.tagValue,
                is_active: detail.isActive,
                sort_order: detail.sortOrder,
            })),
        });
    } catch (err) {
        console.error('获取类别明细失败:', err);
        return error('获取类别明细失败', 500);
    }
}
