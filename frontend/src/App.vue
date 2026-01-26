<script setup lang="ts">
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app';

onLaunch(() => {
  console.log('App Launch');
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
