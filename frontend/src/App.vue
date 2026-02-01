<template>
  <view>
    <!-- #ifdef MP-WEIXIN -->
    <view v-if="showApiConfig" class="api-config-mask">
      <view class="api-config-card">
        <view class="api-config-title">设置 API 地址</view>
        <view class="api-config-desc">仅首次启动需要设置，建议填写带 <text>/api/v1</text> 的完整地址。</view>
        <input
          v-model="apiInput"
          class="api-config-input"
          placeholder="例如：http://192.168.0.100:3000/api/v1"
          placeholder-class="api-config-placeholder"
        />
        <view class="api-config-actions">
          <button class="btn-secondary" @click="handleSkip">稍后再说</button>
          <button class="btn-primary" @click="handleSave">保存</button>
        </view>
      </view>
    </view>
    <!-- #endif -->
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app';
import { getApiBaseUrl, setApiBaseUrl } from './api';

const showApiConfig = ref(false);
const apiInput = ref('');

function normalizeApiBaseUrl(raw: string) {
  let value = raw.trim();
  if (!value) return '';
  value = value.replace(/\s+/g, '');
  if (!/^https?:\/\//i.test(value)) return '';
  if (value.endsWith('/')) value = value.slice(0, -1);
  if (!/\/api\/v1$/i.test(value)) {
    value = `${value}/api/v1`;
  }
  return value;
}

function handleSave() {
  const normalized = normalizeApiBaseUrl(apiInput.value);
  if (!normalized) {
    uni.showToast({
      title: '请输入有效的 API 地址',
      icon: 'none',
    });
    return;
  }
  setApiBaseUrl(normalized);
  showApiConfig.value = false;
  uni.showToast({
    title: '已保存',
    icon: 'success',
  });
}

function handleSkip() {
  showApiConfig.value = false;
}

onLaunch(() => {
  console.log('App Launch');
  // #ifdef MP-WEIXIN
  const cached = uni.getStorageSync('API_BASE_URL');
  if (!cached) {
    showApiConfig.value = true;
    apiInput.value = getApiBaseUrl();
  }
  // #endif
});

onShow(() => {
  console.log('App Show');
});

onHide(() => {
  console.log('App Hide');
});
</script>

<style>
/* 全局样式 */
page {
  background-color: #f5f5f5;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}


/* 通用卡片样式 */
.card {
  background-color: #ffffff;
  border-radius: 12px;
  padding: 16px;
  margin: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

/* 表单样式 */
.form-item {
  margin-bottom: 16px;
}

.form-label {
  font-size: 14px;
  color: #333;
  margin-bottom: 8px;
  font-weight: 500;
}

.form-label .required {
  color: #ff4d4f;
  margin-right: 4px;
}

/* 按钮样式 */
.btn-primary {
  background: linear-gradient(135deg, #007AFF 0%, #0056CC 100%);
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 500;
}

.btn-secondary {
  background-color: #f5f5f5;
  color: #333;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 16px;
}

.btn-danger {
  background-color: #ff4d4f;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 16px;
}

/* API 配置弹窗样式 */
.api-config-mask {
  position: fixed;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 24px;
}

.api-config-card {
  width: 100%;
  max-width: 560rpx;
  background: #fff;
  border-radius: 16px;
  padding: 32rpx 28rpx;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.12);
}

.api-config-title {
  font-size: 18px;
  font-weight: 600;
  color: #1f1f1f;
  margin-bottom: 12px;
}

.api-config-desc {
  font-size: 13px;
  color: #666;
  margin-bottom: 18px;
}

.api-config-input {
  width: 100%;
  border: 1px solid #e5e5e5;
  border-radius: 10px;
  padding: 10px 12px;
  font-size: 14px;
  color: #222;
  background: #fafafa;
  box-sizing: border-box;
}

.api-config-placeholder {
  color: #999;
}

.api-config-actions {
  margin-top: 18px;
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

/* 标签样式 */
.tag {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 12px;
  margin: 4px;
}


.tag-primary {
  background-color: #e6f4ff;
  color: #007AFF;
}

.tag-success {
  background-color: #e6fffb;
  color: #13c2c2;
}

.tag-warning {
  background-color: #fffbe6;
  color: #faad14;
}

.tag-danger {
  background-color: #fff2f0;
  color: #ff4d4f;
}
</style>
