// API 配置和请求封装

// API 基础路径
// H5 开发走 Vite 代理（/api -> http://localhost:3000）
let BASE_URL = '/api/v1';

// 小程序：优先读本地缓存，其次读环境变量，最后回退到示例 IP
// 如需固定地址，建议使用 cpolar/域名并写入缓存
// #ifdef MP-WEIXIN
const MP_CACHED_BASE_URL = uni.getStorageSync('API_BASE_URL');
const MP_ENV_BASE_URL = (import.meta as any).env?.VITE_MP_API_BASE_URL as string | undefined;
BASE_URL = MP_CACHED_BASE_URL || MP_ENV_BASE_URL || 'http://192.168.0.100:3000/api/v1';
// #endif

export function setApiBaseUrl(url: string) {
    BASE_URL = url;
    // #ifdef MP-WEIXIN
    uni.setStorageSync('API_BASE_URL', url);
    // #endif
}

export function getApiBaseUrl() {
    return BASE_URL;
}

// 通用响应类型
interface ApiResponse<T = unknown> {
    code: number;
    message: string;
    data: T;
}

// 分页响应类型
interface PaginatedData<T> {
    list: T[];
    total: number;
    page: number;
    size: number;
    totalPages: number;
}

// 请求封装
async function request<T>(
    url: string,
    options: UniApp.RequestOptions = {}
): Promise<ApiResponse<T>> {
    return new Promise((resolve, reject) => {
        uni.request({
            url: `${BASE_URL}${url}`,
            ...options,
            success: (res) => {
                const data = res.data as ApiResponse<T>;
                if (data.code === 200) {
                    resolve(data);
                } else {
                    uni.showToast({
                        title: data.message || '请求失败',
                        icon: 'none',
                    });
                    reject(new Error(data.message));
                }
            },
            fail: (err) => {
                uni.showToast({
                    title: '网络请求失败',
                    icon: 'none',
                });
                reject(err);
            },
        });
    });
}

// ========================
// 记录相关接口
// ========================

// 记录类型
export interface TalkRecord {
    id: number;
    student_name: string;
    class_name: string;
    student_no: string;
    talk_time: string;
    talk_place: string;
    participants: string;
    reason: string;
    form_data: {
        student_behavior?: string;
        analysis?: string;
        result?: string;
    };
    tags?: string[];
    risk_level: number;
    talk_content?: string;
    situation_analysis?: string;
    disposal_result?: string;
    generated_content?: string;
    record_date: string;
    create_time: string;
    update_time: string;
}

// 创建记录请求体
export interface CreateRecordRequest {
    student_name: string;
    class_name: string;
    student_no: string;
    talk_time: string;
    talk_place: string;
    participants: string;
    reason: string;
    form_data: Record<string, string>;
    tags?: string[];
    risk_level?: number;
    talk_content?: string;
    situation_analysis?: string;
    disposal_result?: string;
    generated_content?: string;
    record_date: string;
}

// 获取记录列表
export function getRecordList(params: { page?: number; size?: number; name?: string }) {
    // 手动构建查询字符串（URLSearchParams 在小程序环境不可用）
    const queryParts: string[] = [];
    if (params.page) queryParts.push(`page=${params.page}`);
    if (params.size) queryParts.push(`size=${params.size}`);
    if (params.name) queryParts.push(`name=${encodeURIComponent(params.name)}`);
    const queryString = queryParts.length > 0 ? `?${queryParts.join('&')}` : '';

    return request<PaginatedData<TalkRecord>>(`/record${queryString}`, {
        method: 'GET',
    });
}

// 获取记录详情
export function getRecordDetail(id: number) {
    return request<TalkRecord>(`/record/${id}`, {
        method: 'GET',
    });
}

// 更新记录
export function updateRecord(id: number, data: CreateRecordRequest) {
    return request<{ id: number; student_name: string; update_time: string }>(`/record/${id}`, {
        method: 'PUT',
        header: {
            'Content-Type': 'application/json',
        },
        data,
    });
}

// 创建记录
export function createRecord(data: CreateRecordRequest) {
    return request<{ id: number }>('/record', {
        method: 'POST',
        header: {
            'Content-Type': 'application/json',
        },
        data,
    });
}

// 删除记录
export function deleteRecord(id: number) {
    return request<null>(`/record/${id}`, {
        method: 'DELETE',
    });
}

// 联想结果类型
export interface SuggestionItem {
    student_name: string;
    class_name: string;
}

// 获取学生姓名联想
export function getStudentSuggestions(keyword: string) {
    return request<SuggestionItem[]>(`/record/suggest?keyword=${encodeURIComponent(keyword)}`, {
        method: 'GET',
    });
}

// ========================
// 快捷标签相关接口
// ========================

// 标签明细类型
export interface TagDetail {
    id: number;
    tag_value: string;
    tag_type: string;
    is_active: number;
    sort_order: number;
}

// 标签类型常量
export const TAG_TYPES = ['学业', '违纪', '心理', '宿舍'] as const;
export type TagType = typeof TAG_TYPES[number];

// 标签类别类型
export interface QuickTag {
    id: number;
    category_code: string;
    category_name: string;
    sort_order: number;
    details: TagDetail[];
}

// 获取所有快捷标签
export function getQuickTags() {
    return request<QuickTag[]>('/quick-tag', {
        method: 'GET',
    });
}

// 获取指定类别的明细
export function getTagDetails(tagId: number) {
    return request<{ category: QuickTag; details: TagDetail[] }>(`/quick-tag/${tagId}/details`, {
        method: 'GET',
    });
}

// 添加标签明细
export function addTagDetail(tagId: number, tagValue: string, tagType: string = '学业') {
    return request<TagDetail>(`/quick-tag/${tagId}/detail`, {
        method: 'POST',
        header: {
            'Content-Type': 'application/json',
        },
        data: {
            tag_value: tagValue,
            tag_type: tagType,
        },
    });
}

// 删除标签明细
export function deleteTagDetail(detailId: number) {
    return request<null>(`/quick-tag/detail/${detailId}`, {
        method: 'DELETE',
    });
}
