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
    tag_type?: string;
}

// 有效的标签类型
const VALID_TAG_TYPES = ['学业', '违纪', '心理', '宿舍'];

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

        // 验证 tag_type（如果提供）
        const tagType = body.tag_type?.trim() || '学业';
        if (!VALID_TAG_TYPES.includes(tagType)) {
            return error('无效的标签类型，必须是：学业、违纪、心理、宿舍', 400);
        }

        // 检查是否已存在相同的 标签值 + 标签类型 组合
        // 同一类别下，同一标签值可以在不同类型下重复添加
        const existingDetail = await prisma.quickTagDetail.findFirst({
            where: {
                tagId: tagId,
                tagValue: body.tag_value.trim(),
                tagType: tagType,
            },
        });

        if (existingDetail) {
            return error(`该标签在"${tagType}"类型下已存在`, 400);
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
                tagType: tagType,
                isActive: 1,
                sortOrder: (maxSortOrder?.sortOrder || 0) + 1,
            },
        });

        return success(
            {
                id: detail.id,
                tag_id: detail.tagId,
                tag_value: detail.tagValue,
                tag_type: detail.tagType,
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
