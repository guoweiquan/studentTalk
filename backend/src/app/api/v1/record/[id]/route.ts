import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { success, error, options } from '@/lib/response';
import { updateTagUsageCount } from '@/lib/tagUsage';

// OPTIONS - 处理 CORS 预检请求
export async function OPTIONS() {
    return options();
}

interface RouteParams {
    params: Promise<{ id: string }>;
}

// 更新记录请求体类型
interface UpdateRecordBody {
    student_name?: string;
    class_name?: string;
    student_no?: string;
    talk_time?: string;
    talk_place?: string;
    participants?: string;
    reason?: string;
    form_data?: Record<string, unknown>;
    tags?: string[];
    risk_level?: number;
    talk_content?: string;
    situation_analysis?: string;
    disposal_result?: string;
    generated_content?: string;
    record_date?: string;
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
            form_data: record.formData,
            tags: record.tags,
            risk_level: record.riskLevel,
            talk_content: record.talkContent,
            situation_analysis: record.situationAnalysis,
            disposal_result: record.disposalResult,
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

// PUT /api/v1/record/:id - 更新记录
export async function PUT(request: NextRequest, { params }: RouteParams) {
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

        const body: UpdateRecordBody = await request.json();

        // 构建更新数据
        const updateData: Record<string, unknown> = {};

        if (body.student_name !== undefined) updateData.studentName = body.student_name;
        if (body.class_name !== undefined) updateData.className = body.class_name;
        if (body.student_no !== undefined) updateData.studentNo = body.student_no;
        if (body.talk_time !== undefined) updateData.talkTime = new Date(body.talk_time);
        if (body.talk_place !== undefined) updateData.talkPlace = body.talk_place;
        if (body.participants !== undefined) updateData.participants = body.participants;
        if (body.reason !== undefined) updateData.reason = body.reason;
        if (body.form_data !== undefined) updateData.formData = body.form_data;
        if (body.tags !== undefined) updateData.tags = body.tags;
        if (body.risk_level !== undefined) updateData.riskLevel = body.risk_level;
        if (body.talk_content !== undefined) updateData.talkContent = body.talk_content;
        if (body.situation_analysis !== undefined) updateData.situationAnalysis = body.situation_analysis;
        if (body.disposal_result !== undefined) updateData.disposalResult = body.disposal_result;
        if (body.generated_content !== undefined) updateData.generatedContent = body.generated_content;
        if (body.record_date !== undefined) updateData.recordDate = new Date(body.record_date);

        // 更新记录
        const record = await prisma.talkRecord.update({
            where: { id: recordId },
            data: updateData,
        });

        // 异步更新标签使用次数（不阻塞响应）
        if (body.tags && body.tags.length > 0) {
            updateTagUsageCount(body.tags).catch((err) => {
                console.error('更新标签使用次数失败:', err);
            });
        }

        return success(
            {
                id: record.id,
                student_name: record.studentName,
                update_time: record.updateTime,
            },
            '更新成功'
        );
    } catch (err) {
        console.error('更新记录失败:', err);
        return error('更新记录失败', 500);
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
