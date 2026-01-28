import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { success, error, options } from '@/lib/response';

// OPTIONS - 处理 CORS 预检请求
export async function OPTIONS() {
    return options();
}

interface RouteParams {
    params: Promise<{ detailId: string }>;
}

// DELETE /api/v1/quick-tag/detail/:detailId - 删除标签明细
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const { detailId } = await params;
        const id = parseInt(detailId, 10);

        if (isNaN(id)) {
            return error('无效的明细ID', 400);
        }

        // 检查明细是否存在
        const existingDetail = await prisma.quickTagDetail.findUnique({
            where: { id: id },
        });

        if (!existingDetail) {
            return error('标签明细不存在', 404);
        }

        // 删除明细
        await prisma.quickTagDetail.delete({
            where: { id: id },
        });

        return success(null, '删除成功');
    } catch (err) {
        console.error('删除标签明细失败:', err);
        return error('删除标签明细失败', 500);
    }
}
