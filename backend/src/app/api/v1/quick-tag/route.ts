import prisma from '@/lib/prisma';
import { success, error, options } from '@/lib/response';

// OPTIONS - 处理 CORS 预检请求
export async function OPTIONS() {
    return options();
}

// GET /api/v1/quick-tag - 获取所有类别及其明细
export async function GET() {
    try {
        const categories = await prisma.quickTag.findMany({
            orderBy: {
                sortOrder: 'asc',
            },
            include: {
                details: {
                    where: {
                        isActive: 1,
                    },
                    orderBy: {
                        sortOrder: 'desc',
                    },
                },
            },
        });

        // 转换为 API 响应格式
        const data = categories.map((category) => ({
            id: category.id,
            category_code: category.categoryCode,
            category_name: category.categoryName,
            sort_order: category.sortOrder,
            details: category.details.map((detail) => ({
                id: detail.id,
                tag_value: detail.tagValue,
                tag_type: detail.tagType,
                is_active: detail.isActive,
                sort_order: detail.sortOrder,
            })),
        }));

        return success(data);
    } catch (err) {
        console.error('获取快捷标签失败:', err);
        return error('获取快捷标签失败', 500);
    }
}
