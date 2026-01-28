import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { success, error, paginatedSuccess, options } from '@/lib/response';

// OPTIONS - 处理 CORS 预检请求
export async function OPTIONS() {
    return options();
}

// 创建记录请求体类型
interface CreateRecordBody {
    student_name: string;
    class_name: string;
    student_no: string;
    talk_time: string;
    talk_place: string;
    participants: string;
    reason: string;
    raw_text: string;
    form_data: Record<string, unknown>;
    tags?: string[];
    risk_level?: number;
    followup_date?: string;
    generated_content?: string;
    record_date: string;
}

// GET /api/v1/record - 获取记录列表
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const page = parseInt(searchParams.get('page') || '1', 10);
        const size = parseInt(searchParams.get('size') || '10', 10);
        const name = searchParams.get('name') || '';

        const skip = (page - 1) * size;

        // 构建查询条件
        const where = name
            ? {
                studentName: {
                    contains: name,
                },
            }
            : {};

        // 并行查询数据和总数
        const [records, total] = await Promise.all([
            prisma.talkRecord.findMany({
                where,
                skip,
                take: size,
                orderBy: {
                    createTime: 'desc',
                },
            }),
            prisma.talkRecord.count({ where }),
        ]);

        // 转换字段名为下划线格式（API响应）
        const list = records.map((record) => ({
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
        }));

        return paginatedSuccess(list, total, page, size);
    } catch (err) {
        console.error('获取记录列表失败:', err);
        return error('获取记录列表失败', 500);
    }
}

// POST /api/v1/record - 创建新记录
export async function POST(request: NextRequest) {
    try {
        const body: CreateRecordBody = await request.json();

        // 验证必填字段
        const requiredFields = [
            'student_name',
            'class_name',
            'student_no',
            'talk_time',
            'talk_place',
            'participants',
            'reason',
            'raw_text',
            'form_data',
            'record_date',
        ];

        for (const field of requiredFields) {
            if (!body[field as keyof CreateRecordBody]) {
                return error(`缺少必填字段: ${field}`, 400);
            }
        }

        // 创建记录
        const record = await prisma.talkRecord.create({
            data: {
                studentName: body.student_name,
                className: body.class_name,
                studentNo: body.student_no,
                talkTime: new Date(body.talk_time),
                talkPlace: body.talk_place,
                participants: body.participants,
                reason: body.reason,
                rawText: body.raw_text,
                formData: body.form_data,
                tags: body.tags || [],
                riskLevel: body.risk_level || 1,
                followupDate: body.followup_date ? new Date(body.followup_date) : null,
                generatedContent: body.generated_content || null,
                recordDate: new Date(body.record_date),
            },
        });

        return success(
            {
                id: record.id,
                student_name: record.studentName,
                record_date: record.recordDate,
                create_time: record.createTime,
            },
            '创建成功'
        );
    } catch (err) {
        console.error('创建记录失败:', err);
        return error('创建记录失败', 500);
    }
}
