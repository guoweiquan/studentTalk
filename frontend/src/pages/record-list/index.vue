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
          @confirm="handleSearch"
        />
        <text v-if="searchName" class="clear-icon" @click="clearSearch">✕</text>
      </view>
    </view>

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

      <view
        v-for="record in records"
        :key="record.id"
        class="record-card"
        @click="goToDetail(record.id)"
      >
        <view class="record-header">
          <text class="student-name">{{ record.student_name }}</text>
          <text class="record-date">{{ formatDate(record.record_date) }}</text>
        </view>
        <view class="record-content">
          <text class="reason-text">{{ truncateText(record.reason, 30) }}</text>
        </view>
        <view class="record-footer">
          <view :class="['risk-tag', `risk-${record.risk_level}`]">
            {{ getRiskLabel(record.risk_level) }}
          </view>
          <text class="class-info">{{ record.class_name }}</text>
        </view>
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
import { ref, onMounted } from 'vue';
import { getRecordList, type TalkRecord } from '@/api/index';

// 状态
const records = ref<TalkRecord[]>([]);
const searchName = ref('');
const loading = ref(false);
const isRefreshing = ref(false);
const page = ref(1);
const size = 10;
const hasMore = ref(true);

// 获取记录列表
async function fetchRecords(isRefresh = false) {
  if (loading.value) return;
  
  loading.value = true;
  
  try {
    if (isRefresh) {
      page.value = 1;
      hasMore.value = true;
    }
    
    const res = await getRecordList({
      page: page.value,
      size,
      name: searchName.value || undefined,
    });
    
    const list = res.data.list;
    
    if (isRefresh) {
      records.value = list;
    } else {
      records.value = [...records.value, ...list];
    }
    
    hasMore.value = page.value < res.data.totalPages;
  } catch (error) {
    console.error('获取记录失败:', error);
  } finally {
    loading.value = false;
    isRefreshing.value = false;
  }
}

// 搜索
function handleSearch() {
  fetchRecords(true);
}

// 清除搜索
function clearSearch() {
  searchName.value = '';
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

// 格式化日期
function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

// 截断文本
function truncateText(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  return text.substring(0, maxLen) + '...';
}

// 获取风险等级标签
function getRiskLabel(level: number): string {
  const labels: Record<number, string> = {
    1: '低风险',
    2: '中风险',
    3: '高风险',
  };
  return labels[level] || '未知';
}

// 页面加载
onMounted(() => {
  fetchRecords(true);
});

// 页面显示时刷新（从详情页返回后）
uni.$on('refreshRecordList', () => {
  fetchRecords(true);
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
  z-index: 10;
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

.record-list {
  height: calc(100vh - 120px);
  padding-bottom: 20px;
}

.record-card {
  background-color: #fff;
  margin: 12px 16px;
  padding: 16px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.record-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.student-name {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.record-date {
  font-size: 12px;
  color: #999;
}

.record-content {
  margin-bottom: 12px;
}

.reason-text {
  font-size: 14px;
  color: #666;
  line-height: 1.5;
}

.record-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.risk-tag {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 10px;
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

.class-info {
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
