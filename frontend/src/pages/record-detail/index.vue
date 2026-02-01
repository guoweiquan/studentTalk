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

      <!-- 学生表现 -->
      <view class="card" v-if="record.form_data?.student_behavior">
        <text class="card-title">学生表现</text>
        <text class="card-content">{{ record.form_data.student_behavior }}</text>
      </view>

      <!-- 原因分析 -->
      <view class="card" v-if="record.form_data?.analysis">
        <text class="card-title">原因分析</text>
        <text class="card-content">{{ record.form_data.analysis }}</text>
      </view>

      <!-- 处置结果 -->
      <view class="card" v-if="record.form_data?.result">
        <text class="card-title">处置结果</text>
        <text class="card-content">{{ record.form_data.result }}</text>
      </view>

      <!-- 谈话记录 -->
      <view class="card" v-if="record.talk_content">
        <text class="card-title">谈话记录</text>
        <text class="card-content">{{ record.talk_content }}</text>
      </view>

      <!-- 生成的完整记录 -->
      <view class="card" v-if="record.generated_content">
        <text class="card-title">📋 完整记录文本</text>
        <view class="generated-content">
          <text>{{ record.generated_content }}</text>
        </view>
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
      <button class="btn btn-secondary" @click="handleEdit">
        编辑记录
      </button>
      <button class="btn btn-danger" @click="handleDelete">
        删除记录
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { getRecordDetail, deleteRecord, type TalkRecord } from '@/api/index';

const record = ref<TalkRecord | null>(null);
const recordId = ref(0);

// 获取记录详情
async function fetchDetail() {
  if (!recordId.value) {
    console.error('记录ID为空');
    uni.showToast({ title: '记录ID无效', icon: 'none' });
    return;
  }
  
  try {
    console.log('开始获取记录详情，ID:', recordId.value);
    const res = await getRecordDetail(recordId.value);
    console.log('获取记录详情成功:', res);
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

// 编辑记录
function handleEdit() {
  if (!record.value || !recordId.value) return;
  
  console.log('准备编辑记录，ID:', recordId.value);
  console.log('记录数据:', record.value);
  
  // 将记录数据缓存到本地存储
  uni.setStorageSync('editRecord', {
    id: recordId.value,
    ...record.value
  });
  
  // 验证数据是否保存成功
  const savedData = uni.getStorageSync('editRecord');
  console.log('保存到 localStorage 的数据:', savedData);
  
  // 保存来源信息：标记是从详情页跳转过来的
  uni.setStorageSync('editRecordSource', {
    fromDetail: true,
    recordId: recordId.value
  });
  
  console.log('准备跳转到新增记录页');
  
  // 跳转到新增记录页（tabBar页）
  uni.switchTab({
    url: '/pages/record-add/index',
    success: () => {
      console.log('跳转成功，发送 loadEditRecord 事件');
      // 通知新增页面加载编辑数据
      uni.$emit('loadEditRecord');
    },
    fail: () => {
      console.error('跳转失败');
      uni.showToast({ title: '跳转失败', icon: 'none' });
    }
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

// 使用 onLoad 获取页面参数（兼容 H5 和小程序）
onLoad((options) => {
  console.log('onLoad 接收到的参数:', options);
  
  if (options?.id) {
    recordId.value = parseInt(options.id as string, 10);
    console.log('解析后的 recordId:', recordId.value);
    fetchDetail();
  } else {
    console.error('未接收到 id 参数');
    uni.showToast({ title: '缺少记录ID参数', icon: 'none' });
  }
});

onMounted(() => {
  console.log('record-detail 页面 onMounted 触发');
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
