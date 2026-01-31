<template>
  <view class="page">
    <!-- 搜索框 -->
    <view class="search-box">
      <view class="search-input-wrap">
        <text class="search-icon">🔍</text>
        <input
          class="search-input"
          type="text"
          placeholder="搜索学生姓名..."
          v-model="searchName"
          @input="handleInputChange"
          @confirm="handleSearch"
          @focus="showSuggestions = suggestions.length > 0"
        />
        <text v-if="searchName" class="clear-icon" @click="clearSearch">✕</text>
      </view>
      <!-- 联想下拉列表 -->
      <view v-if="showSuggestions && suggestions.length > 0" class="suggestions-dropdown">
        <view
          v-for="(name, index) in suggestions"
          :key="index"
          class="suggestion-item"
          @click="selectSuggestion(name)"
        >
          {{ name }}
        </view>
      </view>
    </view>
    <!-- 遮罩层，点击关闭联想 -->
    <view v-if="showSuggestions" class="suggestions-overlay" @click="showSuggestions = false"></view>

    <!-- 记录列表 -->
    <scroll-view
      class="record-list"
      scroll-y
      @scrolltolower="loadMore"
      refresher-enabled
      :refresher-triggered="isRefreshing"
      @refresherrefresh="onRefresh"
    >
      <view v-if="records.length === 0 && !loading" class="empty-state">
        <text class="empty-text">暂无记录</text>
        <text class="empty-tip">点击底部"新增记录"添加谈话记录</text>
      </view>

      <!-- 单行记录列表 -->
      <view
        v-for="record in records"
        :key="record.id"
        class="record-row"
        @click="goToDetail(record.id)"
      >
        <text class="row-name">{{ truncateText(record.student_name, 4) }}</text>
        <text class="row-reason">{{ truncateText(record.reason, 4) }}</text>
        <view :class="['row-risk', `risk-${record.risk_level}`]">
          <text class="risk-dot">{{ getRiskIcon(record.risk_level) }}</text>
          <text>{{ getRiskShortLabel(record.risk_level) }}</text>
        </view>
        <text class="row-class">{{ formatClassName(record.class_name) }}</text>
        <text class="row-date">{{ formatShortDate(record.record_date) }}</text>
      </view>

      <!-- 加载更多 -->
      <view v-if="hasMore && records.length > 0" class="load-more">
        <text v-if="loading">加载中...</text>
        <text v-else>上拉加载更多</text>
      </view>
      
      <view v-if="!hasMore && records.length > 0" class="no-more">
        <text>没有更多了</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import { getRecordList, getStudentSuggestions, type TalkRecord } from '@/api/index';

// 状态
const records = ref<TalkRecord[]>([]);
const searchName = ref('');
const loading = ref(false);
const isRefreshing = ref(false);
const page = ref(1);
const size = 10;
const hasMore = ref(true);

// 联想相关
const suggestions = ref<string[]>([]);
const showSuggestions = ref(false);
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

// 防抖函数
function debounce<T extends (...args: unknown[]) => void>(fn: T, delay: number) {
  return (...args: Parameters<T>) => {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => fn(...args), delay);
  };
}

// 获取联想建议
async function fetchSuggestions(keyword: string) {
  if (!keyword.trim()) {
    suggestions.value = [];
    showSuggestions.value = false;
    return;
  }
  
  try {
    const res = await getStudentSuggestions(keyword);
    suggestions.value = res.data || [];
    showSuggestions.value = suggestions.value.length > 0;
  } catch (error) {
    console.error('获取联想失败:', error);
    suggestions.value = [];
  }
}

// 防抖版本的获取联想
const debouncedFetchSuggestions = debounce((keyword: string) => {
  fetchSuggestions(keyword);
}, 300);

// 处理输入变化
function handleInputChange(e: { detail: { value: string } }) {
  const value = e.detail.value;
  debouncedFetchSuggestions(value);
}

// 选择联想项
function selectSuggestion(name: string) {
  searchName.value = name;
  showSuggestions.value = false;
  suggestions.value = [];
  fetchRecords(true);
}

// 获取记录列表
async function fetchRecords(isRefresh = false) {
  if (loading.value) return;
  
  loading.value = true;
  
  try {
    if (isRefresh) {
      page.value = 1;
      hasMore.value = true;
    }
    
    console.log('正在请求记录列表...', { page: page.value, size, name: searchName.value });
    
    const res = await getRecordList({
      page: page.value,
      size,
      name: searchName.value || undefined,
    });
    
    console.log('获取记录列表成功:', res);
    
    const list = res.data.list;
    
    if (isRefresh) {
      records.value = list;
    } else {
      records.value = [...records.value, ...list];
    }
    
    hasMore.value = page.value < res.data.totalPages;
  } catch (error) {
    console.error('获取记录失败:', error);
    uni.showToast({ title: '加载失败，请下拉刷新', icon: 'none' });
  } finally {
    loading.value = false;
    isRefreshing.value = false;
  }
}

// 搜索
function handleSearch() {
  showSuggestions.value = false;
  fetchRecords(true);
}

// 清除搜索
function clearSearch() {
  searchName.value = '';
  suggestions.value = [];
  showSuggestions.value = false;
  fetchRecords(true);
}

// 下拉刷新
function onRefresh() {
  isRefreshing.value = true;
  fetchRecords(true);
}

// 加载更多
function loadMore() {
  if (!hasMore.value || loading.value) return;
  page.value++;
  fetchRecords();
}

// 跳转到详情页
function goToDetail(id: number) {
  uni.navigateTo({
    url: `/pages/record-detail/index?id=${id}`,
  });
}

// 格式化日期为 MM-DD
function formatShortDate(dateStr: string): string {
  const date = new Date(dateStr);
  return `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

// 截断文本
function truncateText(text: string, maxLen: number): string {
  if (!text) return '';
  if (text.length <= maxLen) return text;
  return text.substring(0, maxLen) + '...';
}

// 格式化班级名称（简写）
function formatClassName(className: string): string {
  if (!className) return '';
  // 尝试简写，如 "六年级3班" -> "六年3班"
  return className.replace('年级', '年');
}

// 获取风险等级简短标签
function getRiskShortLabel(level: number): string {
  const labels: Record<number, string> = {
    1: '低',
    2: '中',
    3: '高',
  };
  return labels[level] || '-';
}

// 获取风险等级图标
function getRiskIcon(level: number): string {
  const icons: Record<number, string> = {
    1: '🟢',
    2: '🟡',
    3: '🔴',
  };
  return icons[level] || '⚪';
}

// 页面显示时加载数据（每次切换到此页面都会触发）
onShow(() => {
  console.log('记录列表页面 onShow 触发');
  fetchRecords(true);
});

// 监听从新增页面发来的刷新事件
const refreshHandler = () => {
  fetchRecords(true);
};

onMounted(() => {
  uni.$on('refreshRecordList', refreshHandler);
});

onUnmounted(() => {
  uni.$off('refreshRecordList', refreshHandler);
});
</script>

<style scoped>
.page {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.search-box {
  padding: 12px 16px;
  background-color: #fff;
  position: sticky;
  top: 0;
  z-index: 100;
}

.search-input-wrap {
  display: flex;
  align-items: center;
  background-color: #f5f5f5;
  border-radius: 20px;
  padding: 8px 16px;
}

.search-icon {
  font-size: 16px;
  margin-right: 8px;
}

.search-input {
  flex: 1;
  font-size: 14px;
  background: transparent;
}

.clear-icon {
  font-size: 14px;
  color: #999;
  padding: 4px;
}

/* 联想下拉列表 */
.suggestions-dropdown {
  position: absolute;
  left: 16px;
  right: 16px;
  top: 56px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  max-height: 300px;
  overflow-y: auto;
  z-index: 101;
}

.suggestion-item {
  padding: 12px 16px;
  font-size: 14px;
  color: #333;
  border-bottom: 1px solid #f0f0f0;
}

.suggestion-item:last-child {
  border-bottom: none;
}

.suggestion-item:active {
  background-color: #f5f5f5;
}

.suggestions-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 99;
}

.record-list {
  height: calc(100vh - 120px);
  padding-bottom: 20px;
}

/* 单行记录样式 */
.record-row {
  display: flex;
  align-items: center;
  background-color: #fff;
  margin: 0 0 1px 0;
  padding: 14px 12px;
  gap: 8px;
}

.record-row:active {
  background-color: #f9f9f9;
}

.row-name {
  flex: 0 0 auto;
  min-width: 50px;
  max-width: 60px;
  font-size: 14px;
  font-weight: 600;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.row-reason {
  flex: 0 0 auto;
  min-width: 50px;
  max-width: 60px;
  font-size: 13px;
  color: #666;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.row-risk {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  gap: 2px;
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 10px;
}

.risk-dot {
  font-size: 10px;
}

.risk-1 {
  background-color: #e6fffb;
  color: #13c2c2;
}

.risk-2 {
  background-color: #fffbe6;
  color: #faad14;
}

.risk-3 {
  background-color: #fff2f0;
  color: #ff4d4f;
}

.row-class {
  flex: 1 1 auto;
  font-size: 12px;
  color: #999;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: right;
}

.row-date {
  flex: 0 0 auto;
  font-size: 12px;
  color: #999;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
}

.empty-text {
  font-size: 16px;
  color: #999;
  margin-bottom: 8px;
}

.empty-tip {
  font-size: 14px;
  color: #ccc;
}

.load-more,
.no-more {
  text-align: center;
  padding: 20px;
  font-size: 14px;
  color: #999;
}
</style>
