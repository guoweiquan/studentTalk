<template>
  <view class="page">
    <scroll-view class="content-scroll" scroll-y>
      <!-- 说明提示 -->
      <view class="tip-card">
        <text class="tip-text">💡 在此配置各字段的快捷标签，保存后会自动同步到"新增记录"页面的复选框选项中。</text>
      </view>

      <!-- 标签类别列表 -->
      <view v-for="category in categories" :key="category.id" class="card">
        <view class="card-header">
          <text class="card-title">{{ category.category_name }}</text>
          <text class="tag-count">{{ getTotalTagCount(category) }} 个标签</text>
        </view>

        <!-- 按标签类型分组展示（仅对非参与人类别），只显示有数据的类型 -->
        <template v-if="category.category_code !== 'participants'">
          <view 
            v-for="tagType in tagTypes" 
            :key="tagType" 
            class="type-section"
            v-show="getDetailsByType(category, tagType).length > 0"
          >
            <view class="type-header">
              <text class="type-title">{{ tagType }}</text>
            </view>
            <view class="tag-list">
              <view
                v-for="detail in getDetailsByType(category, tagType)"
                :key="detail.id"
                class="tag-item"
                :class="getTagColorClass(tagType)"
              >
                <text class="tag-text">{{ detail.tag_value }}</text>
                <text class="delete-btn" @click="handleDeleteTag(detail.id, category.id)">×</text>
              </view>
            </view>
          </view>

          <!-- 添加标签（带类型选择） -->
          <view class="add-tag-section">
            <view class="type-selector">
              <text class="selector-label">新增标签</text>
              <view class="type-options">
                <view
                  v-for="tagType in tagTypes"
                  :key="tagType"
                  class="type-option"
                  :class="{ 'type-option-active': selectedTypes[category.category_code] === tagType }"
                  @click="selectedTypes[category.category_code] = tagType"
                >
                  <text>{{ tagType }}</text>
                </view>
              </view>
            </view>
            <view class="add-tag-row">
              <input
                class="add-input"
                v-model="newTagInputs[category.category_code]"
                placeholder="输入新标签值..."
                @confirm="handleAddTag(category)"
              />
              <button
                class="add-btn"
                @click="handleAddTag(category)"
                :disabled="!newTagInputs[category.category_code]?.trim()"
              >
                添加
              </button>
            </view>
          </view>
        </template>

        <!-- 参与人类别：不分类型 -->
        <template v-else>
          <view class="tag-list">
            <view
              v-for="detail in category.details"
              :key="detail.id"
              class="tag-item tag-default"
            >
              <text class="tag-text">{{ detail.tag_value }}</text>
              <text class="delete-btn" @click="handleDeleteTag(detail.id, category.id)">×</text>
            </view>
            <view v-if="category.details.length === 0" class="empty-tags">
              <text>暂无标签</text>
            </view>
          </view>

          <!-- 添加标签（无类型选择） -->
          <view class="add-tag-row">
            <input
              class="add-input"
              v-model="newTagInputs[category.category_code]"
              placeholder="输入新标签值..."
              @confirm="handleAddTag(category)"
            />
            <button
              class="add-btn"
              @click="handleAddTag(category)"
              :disabled="!newTagInputs[category.category_code]?.trim()"
            >
              添加
            </button>
          </view>
        </template>
      </view>

      <!-- 底部占位 -->
      <view style="height: 20px;"></view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { getQuickTags, addTagDetail, deleteTagDetail, TAG_TYPES, type QuickTag, type TagDetail } from '@/api/index';

const tagTypes = TAG_TYPES;
const categories = ref<QuickTag[]>([]);
const newTagInputs = reactive<Record<string, string>>({});
const selectedTypes = reactive<Record<string, string>>({});

// 获取指定类型的标签
function getDetailsByType(category: QuickTag, tagType: string): TagDetail[] {
  return category.details.filter(d => d.tag_type === tagType);
}

// 获取类别下所有标签总数
function getTotalTagCount(category: QuickTag): number {
  return category.details.length;
}

// 获取标签颜色类名
function getTagColorClass(tagType: string): string {
  const colorMap: Record<string, string> = {
    '学业': 'tag-study',
    '违纪': 'tag-discipline',
    '心理': 'tag-psychology',
    '宿舍': 'tag-dormitory',
  };
  return colorMap[tagType] || 'tag-default';
}

// 加载所有标签类别
async function loadCategories() {
  try {
    const res = await getQuickTags();
    categories.value = res.data;
    
    // 初始化输入框和选中类型
    res.data.forEach((cat: QuickTag) => {
      newTagInputs[cat.category_code] = '';
      selectedTypes[cat.category_code] = '学业';
    });
  } catch (error) {
    console.error('加载标签失败:', error);
  }
}

// 添加标签
async function handleAddTag(category: QuickTag) {
  const value = newTagInputs[category.category_code]?.trim();
  if (!value) {
    uni.showToast({ title: '请输入标签内容', icon: 'none' });
    return;
  }

  // 获取选中的标签类型（参与人类别默认使用"学业"）
  const tagType = category.category_code === 'participants' 
    ? '学业' 
    : (selectedTypes[category.category_code] || '学业');

  try {
    const res = await addTagDetail(category.id, value, tagType);
    
    // 更新本地数据
    const cat = categories.value.find(c => c.id === category.id);
    if (cat) {
      cat.details.push({
        id: res.data.id,
        tag_value: res.data.tag_value,
        tag_type: res.data.tag_type,
        is_active: res.data.is_active,
        sort_order: res.data.sort_order,
      });
    }
    
    // 清空输入框
    newTagInputs[category.category_code] = '';
    
    uni.showToast({ title: '添加成功', icon: 'success' });
  } catch (error) {
    console.error('添加标签失败:', error);
  }
}

// 删除标签
async function handleDeleteTag(detailId: number, categoryId: number) {
  uni.showModal({
    title: '确认删除',
    content: '确定要删除这个标签吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          await deleteTagDetail(detailId);
          
          // 更新本地数据
          const cat = categories.value.find(c => c.id === categoryId);
          if (cat) {
            cat.details = cat.details.filter(d => d.id !== detailId);
          }
          
          uni.showToast({ title: '删除成功', icon: 'success' });
        } catch (error) {
          console.error('删除标签失败:', error);
        }
      }
    },
  });
}

onMounted(() => {
  loadCategories();
});
</script>

<style scoped>
.page {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.content-scroll {
  height: 100vh;
}

.tip-card {
  margin: 12px;
  padding: 12px 16px;
  background: linear-gradient(135deg, #e6f4ff 0%, #f0f9ff 100%);
  border-radius: 12px;
  border-left: 4px solid #007AFF;
}

.tip-text {
  font-size: 13px;
  color: #0056CC;
  line-height: 1.5;
}

.card {
  background-color: #fff;
  margin: 12px;
  padding: 16px;
  border-radius: 12px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.tag-count {
  font-size: 12px;
  color: #999;
}

/* 类型分组样式 */
.type-section {
  margin-bottom: 16px;
}

.type-header {
  margin-bottom: 8px;
}

.type-title {
  font-size: 14px;
  font-weight: 500;
  color: #666;
  padding-left: 8px;
  border-left: 3px solid #007AFF;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  min-height: 32px;
}

.tag-item {
  display: flex;
  align-items: center;
  padding: 6px 12px;
  border-radius: 16px;
  gap: 6px;
}

.tag-text {
  font-size: 13px;
}

.delete-btn {
  font-size: 14px;
  color: #999;
  padding: 2px 4px;
  font-weight: bold;
}

.delete-btn:active {
  color: #ff4d4f;
}

/* 不同类型的标签颜色 */
.tag-default {
  background-color: #f5f5f5;
  color: #333;
}

.tag-study {
  background-color: #f5f5f5;
  color: #333;
}

.tag-study .tag-text {
  color: #333;
}

.tag-discipline {
  background-color: #fff7e6;
  color: #d46b08;
}

.tag-discipline .tag-text {
  color: #d46b08;
}

.tag-psychology {
  background-color: #f6ffed;
  color: #389e0d;
}

.tag-psychology .tag-text {
  color: #389e0d;
}

.tag-dormitory {
  background-color: #e6f7ff;
  color: #0958d9;
}

.tag-dormitory .tag-text {
  color: #0958d9;
}

.empty-tags,
.empty-type {
  width: 100%;
  padding: 8px 0;
}

.empty-tags text,
.empty-type text {
  font-size: 12px;
  color: #ccc;
}

/* 添加标签区域 - 用户录入区域 */
.add-tag-section {
  margin-top: 16px;
  padding: 16px;
  background-color: #f0f7ff;
  border: 1px solid #bae0ff;
  border-radius: 8px;
}

.type-selector {
  margin-bottom: 12px;
}

.selector-label {
  font-size: 13px;
  color: #666;
  margin-bottom: 8px;
  display: block;
}

.type-options {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.type-option {
  padding: 6px 14px;
  border-radius: 16px;
  background-color: #f5f5f5;
  font-size: 13px;
  color: #666;
  border: 1px solid transparent;
  transition: all 0.2s;
}

.type-option-active {
  background-color: #e6f4ff;
  color: #007AFF;
  border-color: #007AFF;
}

.add-tag-row {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-top: 12px;
}

.add-input {
  flex: 1;
  height: 36px;
  padding: 0 12px;
  border: 1px solid #e0e0e0;
  border-radius: 18px;
  font-size: 14px;
}

.add-btn {
  width: 64px;
  height: 36px;
  background: linear-gradient(135deg, #007AFF 0%, #0056CC 100%);
  color: #fff;
  border: none;
  border-radius: 18px;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
}

.add-btn[disabled] {
  opacity: 0.5;
}
</style>
