<template>
  <view class="page">
    <scroll-view class="content-scroll" scroll-y v-if="record">
      <!-- 基本信息卡片 -->
      <view class="card">
        <view class="info-row">
          <view class="info-item">
            <text class="info-label">学生姓名</text>
            <text class="info-value">{{ record.student_name }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">班级/学号</text>
            <text class="info-value">{{ record.class_name }} / {{ record.student_no }}</text>
          </view>
        </view>
        <view class="info-row">
          <view class="info-item">
            <text class="info-label">谈话时间</text>
            <text class="info-value">{{ formatDateTime(record.talk_time) }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">谈话地点</text>
            <text class="info-value">{{ record.talk_place }}</text>
          </view>
        </view>
        <view class="info-row single">
          <view class="info-item full">
            <text class="info-label">参与人</text>
            <text class="info-value">{{ record.participants }}</text>
          </view>
        </view>
      </view>

      <!-- 谈话事由 -->
      <view class="card">
        <view class="card-header">
          <text class="card-title">谈话事由</text>
          <view :class="['risk-badge', `risk-${record.risk_level}`]">
            {{ getRiskLabel(record.risk_level) }}
          </view>
        </view>
        <text class="card-content">{{ record.reason }}</text>
      </view>

      <!-- 关键事实 -->
      <view class="card" v-if="record.form_data?.key_facts">
        <text class="card-title">关键事实</text>
        <text class="card-content">{{ record.form_data.key_facts }}</text>
      </view>

      <!-- 学生态度/情绪 -->
      <view class="card" v-if="record.form_data?.attitude">
        <text class="card-title">学生态度/情绪</text>
        <text class="card-content">{{ record.form_data.attitude }}</text>
      </view>

      <!-- 原因分析 -->
      <view class="card" v-if="record.form_data?.analysis">
        <text class="card-title">原因分析</text>
        <text class="card-content">{{ record.form_data.analysis }}</text>
      </view>

      <!-- 处理与辅导措施 -->
      <view class="card" v-if="record.form_data?.measures">
        <text class="card-title">处理与辅导措施</text>
        <text class="card-content">{{ record.form_data.measures }}</text>
      </view>

      <!-- 后续跟进计划 -->
      <view class="card" v-if="record.form_data?.followup_plan">
        <text class="card-title">后续跟进计划</text>
        <text class="card-content">{{ record.form_data.followup_plan }}</text>
      </view>

      <!-- 生成的完整记录 -->
      <view class="card" v-if="record.generated_content">
        <text class="card-title">📋 完整记录文本</text>
        <view class="generated-content">
          <text>{{ record.generated_content }}</text>
        </view>
      </view>

      <!-- 原始谈话片段 -->
      <view class="card">
        <text class="card-title">原始谈话片段</text>
        <text class="card-content raw-text">{{ record.raw_text }}</text>
      </view>

      <!-- 底部占位 -->
      <view style="height: 100px;"></view>
    </scroll-view>

    <!-- 加载中 -->
    <view v-else class="loading">
      <text>加载中...</text>
    </view>

    <!-- 底部操作栏 -->
    <view class="bottom-bar">
      <button class="btn btn-secondary" @click="handleCopy">
        📋 复制文本
      </button>
      <button class="btn btn-danger" @click="handleDelete">
        🗑️ 删除记录
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getRecordDetail, deleteRecord, type TalkRecord } from '@/api/index';

const record = ref<TalkRecord | null>(null);
const recordId = ref(0);

// 获取记录详情
async function fetchDetail() {
  try {
    const res = await getRecordDetail(recordId.value);
    record.value = res.data;
  } catch (error) {
    console.error('获取详情失败:', error);
    uni.showToast({ title: '获取详情失败', icon: 'none' });
  }
}

// 格式化日期时间
function formatDateTime(dateStr: string): string {
  const date = new Date(dateStr);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
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

// 复制文本
function handleCopy() {
  if (!record.value) return;
  
  const text = record.value.generated_content || `
学生姓名：${record.value.student_name}
班级/学号：${record.value.class_name} / ${record.value.student_no}
谈话时间：${formatDateTime(record.value.talk_time)}
谈话地点：${record.value.talk_place}
参与人：${record.value.participants}
谈话事由：${record.value.reason}
`;
  
  uni.setClipboardData({
    data: text,
    success: () => {
      uni.showToast({ title: '已复制到剪贴板', icon: 'success' });
    },
  });
}

// 删除记录
function handleDelete() {
  uni.showModal({
    title: '确认删除',
    content: '删除后无法恢复，确定要删除这条记录吗？',
    confirmColor: '#ff4d4f',
    success: async (res) => {
      if (res.confirm) {
        try {
          await deleteRecord(recordId.value);
          uni.showToast({ title: '删除成功', icon: 'success' });
          
          // 通知列表页刷新
          uni.$emit('refreshRecordList');
          
          // 返回列表页
          setTimeout(() => {
            uni.navigateBack();
          }, 1500);
        } catch (error) {
          console.error('删除失败:', error);
        }
      }
    },
  });
}

onMounted(() => {
  // 获取页面参数
  const pages = getCurrentPages();
  const currentPage = pages[pages.length - 1];
  const options = (currentPage as unknown as { options: { id: string } }).options;
  
  if (options?.id) {
    recordId.value = parseInt(options.id, 10);
    fetchDetail();
  }
});
</script>

<style scoped>
.page {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.content-scroll {
  height: calc(100vh - 80px);
}

.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  color: #999;
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
}

.card-title {
  font-size: 14px;
  color: #999;
  margin-bottom: 8px;
  display: block;
}

.card-content {
  font-size: 15px;
  color: #333;
  line-height: 1.6;
}

.raw-text {
  color: #666;
  font-size: 14px;
}

.info-row {
  display: flex;
  margin-bottom: 16px;
}

.info-row:last-child {
  margin-bottom: 0;
}

.info-row.single {
  display: block;
}

.info-item {
  flex: 1;
}

.info-item.full {
  width: 100%;
}

.info-label {
  font-size: 12px;
  color: #999;
  display: block;
  margin-bottom: 4px;
}

.info-value {
  font-size: 15px;
  color: #333;
  font-weight: 500;
}

.risk-badge {
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 12px;
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

.generated-content {
  background-color: #fafafa;
  padding: 12px;
  border-radius: 8px;
  margin-top: 8px;
}

.generated-content text {
  font-size: 14px;
  color: #333;
  line-height: 1.8;
  white-space: pre-wrap;
}

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 12px 16px;
  background-color: #fff;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.08);
  display: flex;
  gap: 12px;
}

.btn {
  flex: 1;
  height: 44px;
  border-radius: 22px;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
}

.btn-secondary {
  background-color: #f5f5f5;
  color: #333;
}

.btn-danger {
  background-color: #fff2f0;
  color: #ff4d4f;
}
</style>
