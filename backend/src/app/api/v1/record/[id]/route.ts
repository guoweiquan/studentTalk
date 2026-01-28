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

// GET /api/v1/record/:id - 获取记录详情
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const recordId = parseInt(id, 10);

        if (isNaN(recordId)) {
            return error('无效的记录ID', 400);
        }

        const record = await prisma.talkRecord.findUnique({
            where: { id: recordId },
        });

        if (!record) {
            return error('记录不存在', 404);
        }

        // 转换字段名为下划线格式
        const data = {
            id: record.id,
            student_name: record.studentName,
            class_name: record.className,
            student_no: record.studentNo,
            talk_time: record.talkTime,
            talk_place: record.talkPlace,
            participants: record.participants,
            reason: record.reason,
            raw_text: record.rawText,
            form_data: record.formData,
            tags: record.tags,
            risk_level: record.riskLevel,
            followup_date: record.followupDate,
            generated_content: record.generatedContent,
            record_date: record.recordDate,
            create_time: record.createTime,
            update_time: record.updateTime,
        };

        return success(data);
    } catch (err) {
        console.error('获取记录详情失败:', err);
        return error('获取记录详情失败', 500);
    }
}

// DELETE /api/v1/record/:id - 删除记录
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const recordId = parseInt(id, 10);

        if (isNaN(recordId)) {
            return error('无效的记录ID', 400);
        }

        // 检查记录是否存在
        const existingRecord = await prisma.talkRecord.findUnique({
            where: { id: recordId },
        });

        if (!existingRecord) {
            return error('记录不存在', 404);
        }

        // 删除记录
        await prisma.talkRecord.delete({
            where: { id: recordId },
        });

        return success(null, '删除成功');
    } catch (err) {
        console.error('删除记录失败:', err);
        return error('删除记录失败', 500);
    }
}
