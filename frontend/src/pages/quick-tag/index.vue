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
          <text class="tag-count">{{ category.details.length }} 个标签</text>
        </view>

        <!-- 标签列表 -->
        <view class="tag-list">
          <view
            v-for="detail in category.details"
            :key="detail.id"
            class="tag-item"
          >
            <text class="tag-text">{{ detail.tag_value }}</text>
            <text class="delete-btn" @click="handleDeleteTag(detail.id, category.id)">✕</text>
          </view>
          <view v-if="category.details.length === 0" class="empty-tags">
            <text>暂无标签</text>
          </view>
        </view>

        <!-- 添加标签 -->
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

      <!-- 底部占位 -->
      <view style="height: 20px;"></view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { getQuickTags, addTagDetail, deleteTagDetail, type QuickTag } from '@/api/index';

const categories = ref<QuickTag[]>([]);
const newTagInputs = reactive<Record<string, string>>({});

// 加载所有标签类别
async function loadCategories() {
  try {
    const res = await getQuickTags();
    categories.value = res.data;
    
    // 初始化输入框
    res.data.forEach((cat: QuickTag) => {
      newTagInputs[cat.category_code] = '';
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

  try {
    const res = await addTagDetail(category.id, value);
    
    // 更新本地数据
    const cat = categories.value.find(c => c.id === category.id);
    if (cat) {
      cat.details.push({
        id: res.data.id,
        tag_value: res.data.tag_value,
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
  margin-bottom: 12px;
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

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
  min-height: 40px;
}

.tag-item {
  display: flex;
  align-items: center;
  padding: 6px 12px;
  background-color: #f5f5f5;
  border-radius: 16px;
  gap: 8px;
}

.tag-text {
  font-size: 13px;
  color: #333;
}

.delete-btn {
  font-size: 12px;
  color: #999;
  padding: 2px 4px;
}

.delete-btn:active {
  color: #ff4d4f;
}

.empty-tags {
  width: 100%;
  text-align: center;
  padding: 12px;
}

.empty-tags text {
  font-size: 13px;
  color: #ccc;
}

.add-tag-row {
  display: flex;
  gap: 10px;
  align-items: center;
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
