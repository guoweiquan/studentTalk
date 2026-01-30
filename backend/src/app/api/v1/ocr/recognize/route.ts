import { NextRequest, NextResponse } from 'next/server';

// 百度OCR API配置
const BAIDU_OCR_API_KEY = process.env.BAIDU_OCR_API_KEY || '';
const BAIDU_OCR_SECRET_KEY = process.env.BAIDU_OCR_SECRET_KEY || '';

// 缓存access_token
let cachedAccessToken: string | null = null;
let tokenExpireTime: number = 0;

// 获取百度OCR的access_token
async function getAccessToken(): Promise<string> {
    // 如果缓存的token还有效，直接返回
    if (cachedAccessToken && Date.now() < tokenExpireTime) {
        return cachedAccessToken;
    }

    const url = `https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=${BAIDU_OCR_API_KEY}&client_secret=${BAIDU_OCR_SECRET_KEY}`;

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error('获取百度OCR access_token失败');
    }

    const data = await response.json();

    if (data.error) {
        throw new Error(`百度OCR认证失败: ${data.error_description || data.error}`);
    }

    // 缓存token，提前5分钟过期
    cachedAccessToken = data.access_token;
    tokenExpireTime = Date.now() + (data.expires_in - 300) * 1000;

    return cachedAccessToken;
}

// 调用百度通用文字识别（高精度版）
async function recognizeText(imageBase64: string): Promise<string> {
    const accessToken = await getAccessToken();

    // 使用通用文字识别（高精度版）- 适合手写体识别
    const url = `https://aip.baidubce.com/rest/2.0/ocr/v1/accurate_basic?access_token=${accessToken}`;

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `image=${encodeURIComponent(imageBase64)}`,
    });

    if (!response.ok) {
        throw new Error('调用百度OCR接口失败');
    }

    const data = await response.json();

    if (data.error_code) {
        throw new Error(`OCR识别失败: ${data.error_msg || data.error_code}`);
    }

    // 合并所有识别结果
    if (data.words_result && data.words_result.length > 0) {
        return data.words_result.map((item: { words: string }) => item.words).join('\n');
    }

    return '';
}

export async function POST(request: NextRequest) {
    try {
        // 检查API配置
        if (!BAIDU_OCR_API_KEY || !BAIDU_OCR_SECRET_KEY) {
            return NextResponse.json(
                { code: 500, message: '百度OCR未配置，请在.env中配置BAIDU_OCR_API_KEY和BAIDU_OCR_SECRET_KEY' },
                { status: 500 }
            );
        }

        // 获取上传的图片
        const formData = await request.formData();
        const file = formData.get('image') as File | null;

        if (!file) {
            return NextResponse.json(
                { code: 400, message: '请上传图片' },
                { status: 400 }
            );
        }

        // 读取文件内容并转换为base64
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64Image = buffer.toString('base64');

        // 调用百度OCR进行识别
        const recognizedText = await recognizeText(base64Image);

        if (!recognizedText) {
            return NextResponse.json(
                { code: 200, message: '未识别到文字内容', data: { text: '' } }
            );
        }

        return NextResponse.json({
            code: 200,
            message: 'success',
            data: {
                text: recognizedText,
            },
        });
    } catch (error) {
        console.error('OCR识别错误:', error);
        return NextResponse.json(
            { code: 500, message: error instanceof Error ? error.message : 'OCR识别失败' },
            { status: 500 }
        );
    }
}
