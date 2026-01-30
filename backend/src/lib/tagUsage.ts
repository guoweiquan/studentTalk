/**
 * 标签使用次数统计工具
 * 用于统计近10天内各标签的使用次数，并更新 quick_tag_detail 表的 sort_order 字段
 */

import prisma from './prisma';

/**
 * 更新标签使用次数
 * 统计近10天内所有记录中各标签出现的次数，并更新到 quick_tag_detail.sort_order
 * @param usedTags 本次使用的标签数组（用于优化，只更新相关标签）
 */
export async function updateTagUsageCount(usedTags?: string[]): Promise<void> {
    try {
        // 计算10天前的日期
        const tenDaysAgo = new Date();
        tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);
        tenDaysAgo.setHours(0, 0, 0, 0);

        // 获取近10天的所有记录
        const recentRecords = await prisma.talkRecord.findMany({
            where: {
                createTime: {
                    gte: tenDaysAgo,
                },
            },
            select: {
                tags: true,
            },
        });

        // 统计每个标签的使用次数
        const tagCountMap = new Map<string, number>();

        for (const record of recentRecords) {
            const tags = record.tags as string[] | null;
            if (tags && Array.isArray(tags)) {
                for (const tag of tags) {
                    const currentCount = tagCountMap.get(tag) || 0;
                    tagCountMap.set(tag, currentCount + 1);
                }
            }
        }

        // 如果指定了 usedTags，只更新这些标签；否则更新所有统计到的标签
        const tagsToUpdate = usedTags && usedTags.length > 0 ? usedTags : Array.from(tagCountMap.keys());

        // 批量更新 quick_tag_detail 表的 sort_order
        for (const tagValue of tagsToUpdate) {
            const count = tagCountMap.get(tagValue) || 0;
            await prisma.quickTagDetail.updateMany({
                where: {
                    tagValue: tagValue,
                },
                data: {
                    sortOrder: count,
                },
            });
        }

        console.log(`[标签统计] 更新了 ${tagsToUpdate.length} 个标签的使用次数`);
    } catch (err) {
        console.error('[标签统计] 更新标签使用次数失败:', err);
        // 不抛出错误，避免影响主流程
    }
}
