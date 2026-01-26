<template>
  <view class="page">
    <scroll-view class="form-scroll" scroll-y>
      <!-- 原始谈话片段 -->
      <view class="card">
        <view class="form-item">
          <view class="form-label"><text class="required">*</text>原始谈话片段</view>
          <textarea
            class="textarea"
            v-model="formData.raw_text"
            placeholder="请粘贴原始、凌乱的谈话记录..."
            :maxlength="2000"
          />
        </view>
      </view>

      <!-- 基本信息 -->
      <view class="card">
        <view class="card-title">基本信息</view>
        
        <view class="form-item">
          <view class="form-label"><text class="required">*</text>学生姓名</view>
          <input class="input" v-model="formData.student_name" placeholder="请输入学生姓名" />
        </view>

        <view class="form-row">
          <view class="form-item half">
            <view class="form-label"><text class="required">*</text>班级</view>
            <input class="input" v-model="formData.class_name" placeholder="如：7年级2班" />
          </view>
          <view class="form-item half">
            <view class="form-label"><text class="required">*</text>学号</view>
            <input class="input" v-model="formData.student_no" placeholder="如：202301" />
          </view>
        </view>

        <view class="form-row">
          <view class="form-item half">
            <view class="form-label"><text class="required">*</text>谈话时间</view>
            <picker mode="date" :value="talkDate" @change="onDateChange">
              <view class="input picker-input">{{ talkDate || '选择日期' }}</view>
            </picker>
          </view>
          <view class="form-item half">
            <view class="form-label"><text class="required">*</text>谈话地点</view>
            <input class="input" v-model="formData.talk_place" placeholder="如：办公室" />
          </view>
        </view>
      </view>

      <!-- 参与人 -->
      <view class="card">
        <view class="form-item">
          <view class="form-label"><text class="required">*</text>参与人</view>
          <view class="checkbox-group">
            <view
              v-for="tag in tagOptions.participants"
              :key="tag.id"
              :class="['checkbox-item', { active: selectedTags.participants.includes(tag.tag_value) }]"
              @click="toggleTag('participants', tag.tag_value)"
            >
              {{ tag.tag_value }}
            </view>
          </view>
          <input class="input" v-model="customInputs.participants" placeholder="其他（自定义输入）" />
        </view>
      </view>

      <!-- 事由/问题 -->
      <view class="card">
        <view class="form-item">
          <view class="form-label"><text class="required">*</text>事由/问题</view>
          <view class="checkbox-group">
            <view
              v-for="tag in tagOptions.reason"
              :key="tag.id"
              :class="['checkbox-item', { active: selectedTags.reason.includes(tag.tag_value) }]"
              @click="toggleTag('reason', tag.tag_value)"
            >
              {{ tag.tag_value }}
            </view>
          </view>
          <input class="input" v-model="customInputs.reason" placeholder="其他（自定义输入）" />
        </view>
      </view>

      <!-- 关键事实 -->
      <view class="card">
        <view class="form-item">
          <view class="form-label"><text class="required">*</text>关键事实</view>
          <textarea
            class="textarea small"
            v-model="formData.form_data.key_facts"
            placeholder="从原始片段中提取的要点"
            :maxlength="500"
          />
        </view>
      </view>

      <!-- 学生态度/情绪 -->
      <view class="card">
        <view class="form-item">
          <view class="form-label"><text class="required">*</text>学生态度/情绪</view>
          <view class="checkbox-group">
            <view
              v-for="tag in tagOptions.attitude"
              :key="tag.id"
              :class="['checkbox-item', { active: selectedTags.attitude.includes(tag.tag_value) }]"
              @click="toggleTag('attitude', tag.tag_value)"
            >
              {{ tag.tag_value }}
            </view>
          </view>
          <input class="input" v-model="customInputs.attitude" placeholder="其他（自定义输入）" />
        </view>
      </view>

      <!-- 原因分析 -->
      <view class="card">
        <view class="form-item">
          <view class="form-label"><text class="required">*</text>原因分析</view>
          <view class="checkbox-group">
            <view
              v-for="tag in tagOptions.analysis"
              :key="tag.id"
              :class="['checkbox-item', { active: selectedTags.analysis.includes(tag.tag_value) }]"
              @click="toggleTag('analysis', tag.tag_value)"
            >
              {{ tag.tag_value }}
            </view>
          </view>
          <input class="input" v-model="customInputs.analysis" placeholder="其他（自定义输入）" />
        </view>
      </view>

      <!-- 处理与辅导措施 -->
      <view class="card">
        <view class="form-item">
          <view class="form-label"><text class="required">*</text>处理与辅导措施</view>
          <view class="checkbox-group">
            <view
              v-for="tag in tagOptions.measures"
              :key="tag.id"
              :class="['checkbox-item', { active: selectedTags.measures.includes(tag.tag_value) }]"
              @click="toggleTag('measures', tag.tag_value)"
            >
              {{ tag.tag_value }}
            </view>
          </view>
          <input class="input" v-model="customInputs.measures" placeholder="其他（自定义输入）" />
        </view>
      </view>

      <!-- 后续跟进计划 -->
      <view class="card">
        <view class="form-item">
          <view class="form-label"><text class="required">*</text>后续跟进计划</view>
          <view class="checkbox-group">
            <view
              v-for="tag in tagOptions.followup_plan"
              :key="tag.id"
              :class="['checkbox-item', { active: selectedTags.followup_plan.includes(tag.tag_value) }]"
              @click="toggleTag('followup_plan', tag.tag_value)"
            >
              {{ tag.tag_value }}
            </view>
          </view>
          <input class="input" v-model="customInputs.followup_plan" placeholder="其他（自定义输入）" />
        </view>
      </view>

      <!-- 风险等级 -->
      <view class="card">
        <view class="form-item">
          <view class="form-label"><text class="required">*</text>风险等级</view>
          <view class="radio-group">
            <view
              v-for="level in riskLevels"
              :key="level.value"
              :class="['radio-item', { active: formData.risk_level === level.value }]"
              @click="formData.risk_level = level.value"
            >
              <view :class="['radio-dot', `risk-${level.value}`]"></view>
              <text>{{ level.label }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 底部占位 -->
      <view style="height: 100px;"></view>
    </scroll-view>

    <!-- 底部按钮 -->
    <view class="bottom-bar">
      <button class="btn btn-primary" @click="handleSubmit" :disabled="submitting">
        {{ submitting ? '保存中...' : '提交保存' }}
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { getQuickTags, createRecord, type QuickTag, type TagDetail } from '@/api/index';

// 风险等级选项
const riskLevels = [
  { value: 1, label: '低' },
  { value: 2, label: '中' },
  { value: 3, label: '高' },
];

// 表单数据
const formData = reactive({
  student_name: '',
  class_name: '',
  student_no: '',
  talk_time: '',
  talk_place: '',
  raw_text: '',
  risk_level: 1,
  form_data: {
    key_facts: '',
    attitude: '',
    analysis: '',
    measures: '',
    followup_plan: '',
  },
});

const talkDate = ref('');

// 标签选项
const tagOptions = reactive<Record<string, TagDetail[]>>({
  participants: [],
  reason: [],
  attitude: [],
  analysis: [],
  measures: [],
  followup_plan: [],
});

// 已选标签
const selectedTags = reactive<Record<string, string[]>>({
  participants: [],
  reason: [],
  attitude: [],
  analysis: [],
  measures: [],
  followup_plan: [],
});

// 自定义输入
const customInputs = reactive<Record<string, string>>({
  participants: '',
  reason: '',
  attitude: '',
  analysis: '',
  measures: '',
  followup_plan: '',
});

const submitting = ref(false);

// 加载快捷标签
async function loadQuickTags() {
  try {
    const res = await getQuickTags();
    res.data.forEach((tag: QuickTag) => {
      if (tagOptions[tag.category_code]) {
        tagOptions[tag.category_code] = tag.details;
      }
    });
  } catch (error) {
    console.error('加载快捷标签失败:', error);
  }
}

// 切换标签选中状态
function toggleTag(category: string, value: string) {
  const index = selectedTags[category].indexOf(value);
  if (index === -1) {
    selectedTags[category].push(value);
  } else {
    selectedTags[category].splice(index, 1);
  }
}

// 日期选择
function onDateChange(e: { detail: { value: string } }) {
  talkDate.value = e.detail.value;
  formData.talk_time = e.detail.value + ' 09:00:00';
}

// 合并选中标签和自定义输入
function mergeTagsAndCustom(category: string): string {
  const tags = [...selectedTags[category]];
  if (customInputs[category].trim()) {
    tags.push(customInputs[category].trim());
  }
  return tags.join('、');
}

// 生成记录文本
function generateContent(): string {
  const participants = mergeTagsAndCustom('participants');
  const reason = mergeTagsAndCustom('reason');
  const attitude = mergeTagsAndCustom('attitude');
  const analysis = mergeTagsAndCustom('analysis');
  const measures = mergeTagsAndCustom('measures');
  const followupPlan = mergeTagsAndCustom('followup_plan');
  const riskLabel = riskLevels.find(l => l.value === formData.risk_level)?.label || '低';

  return `【学生谈话记录表】
学生姓名：${formData.student_name}    班级/学号：${formData.class_name} / ${formData.student_no}
谈话时间：${talkDate.value}    地点：${formData.talk_place}    参与人：${participants}
谈话事由：${reason}
关键事实：${formData.form_data.key_facts}
学生态度/情绪：${attitude}
原因分析：${analysis}
处理与辅导措施：${measures}
后续跟进计划：${followupPlan}
风险等级：${riskLabel}`;
}

// 表单验证
function validateForm(): boolean {
  if (!formData.raw_text.trim()) {
    uni.showToast({ title: '请输入原始谈话片段', icon: 'none' });
    return false;
  }
  if (!formData.student_name.trim()) {
    uni.showToast({ title: '请输入学生姓名', icon: 'none' });
    return false;
  }
  if (!formData.class_name.trim()) {
    uni.showToast({ title: '请输入班级', icon: 'none' });
    return false;
  }
  if (!formData.student_no.trim()) {
    uni.showToast({ title: '请输入学号', icon: 'none' });
    return false;
  }
  if (!talkDate.value) {
    uni.showToast({ title: '请选择谈话时间', icon: 'none' });
    return false;
  }
  if (!formData.talk_place.trim()) {
    uni.showToast({ title: '请输入谈话地点', icon: 'none' });
    return false;
  }
  if (selectedTags.participants.length === 0 && !customInputs.participants.trim()) {
    uni.showToast({ title: '请选择或输入参与人', icon: 'none' });
    return false;
  }
  if (selectedTags.reason.length === 0 && !customInputs.reason.trim()) {
    uni.showToast({ title: '请选择或输入事由/问题', icon: 'none' });
    return false;
  }
  if (!formData.form_data.key_facts.trim()) {
    uni.showToast({ title: '请输入关键事实', icon: 'none' });
    return false;
  }
  return true;
}

// 提交表单
async function handleSubmit() {
  if (!validateForm()) return;
  
  submitting.value = true;
  
  try {
    const generatedContent = generateContent();
    
    await createRecord({
      student_name: formData.student_name,
      class_name: formData.class_name,
      student_no: formData.student_no,
      talk_time: formData.talk_time,
      talk_place: formData.talk_place,
      participants: mergeTagsAndCustom('participants'),
      reason: mergeTagsAndCustom('reason'),
      raw_text: formData.raw_text,
      form_data: {
        key_facts: formData.form_data.key_facts,
        attitude: mergeTagsAndCustom('attitude'),
        analysis: mergeTagsAndCustom('analysis'),
        measures: mergeTagsAndCustom('measures'),
        followup_plan: mergeTagsAndCustom('followup_plan'),
      },
      tags: [
        ...selectedTags.participants,
        ...selectedTags.reason,
        ...selectedTags.attitude,
        ...selectedTags.analysis,
        ...selectedTags.measures,
        ...selectedTags.followup_plan,
      ],
      risk_level: formData.risk_level,
      generated_content: generatedContent,
      record_date: talkDate.value,
    });
    
    uni.showToast({ title: '保存成功', icon: 'success' });
    
    // 通知列表页刷新
    uni.$emit('refreshRecordList');
    
    // 返回列表页
    setTimeout(() => {
      uni.switchTab({ url: '/pages/record-list/index' });
    }, 1500);
  } catch (error) {
    console.error('保存失败:', error);
  } finally {
    submitting.value = false;
  }
}

onMounted(() => {
  loadQuickTags();
  // 默认日期为今天
  const today = new Date();
  talkDate.value = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  formData.talk_time = talkDate.value + ' 09:00:00';
});
</script>

<style scoped>
.page {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.form-scroll {
  height: calc(100vh - 80px);
}

.card {
  background-color: #fff;
  margin: 12px;
  padding: 16px;
  border-radius: 12px;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.form-item {
  margin-bottom: 16px;
}

.form-item:last-child {
  margin-bottom: 0;
}

.form-label {
  font-size: 14px;
  color: #333;
  margin-bottom: 8px;
  font-weight: 500;
}

.required {
  color: #ff4d4f;
  margin-right: 4px;
}

.form-row {
  display: flex;
  gap: 12px;
}

.half {
  flex: 1;
}

.input {
  width: 100%;
  height: 40px;
  padding: 0 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  box-sizing: border-box;
}

.picker-input {
  display: flex;
  align-items: center;
  color: #333;
}

.textarea {
  width: 100%;
  height: 120px;
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  box-sizing: border-box;
}

.textarea.small {
  height: 80px;
}

.checkbox-group {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}

.checkbox-item {
  padding: 6px 14px;
  border: 1px solid #e0e0e0;
  border-radius: 16px;
  font-size: 13px;
  color: #666;
  background-color: #fafafa;
}

.checkbox-item.active {
  background-color: #e6f4ff;
  border-color: #007AFF;
  color: #007AFF;
}

.radio-group {
  display: flex;
  gap: 24px;
}

.radio-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #666;
}

.radio-item.active {
  color: #333;
  font-weight: 500;
}

.radio-dot {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid #e0e0e0;
}

.radio-item.active .radio-dot {
  border-width: 5px;
}

.radio-item.active .risk-1 {
  border-color: #13c2c2;
}

.radio-item.active .risk-2 {
  border-color: #faad14;
}

.radio-item.active .risk-3 {
  border-color: #ff4d4f;
}

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 12px 16px;
  background-color: #fff;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.08);
}

.btn {
  width: 100%;
  height: 48px;
  border-radius: 24px;
  font-size: 16px;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-primary {
  background: linear-gradient(135deg, #007AFF 0%, #0056CC 100%);
  color: #fff;
  border: none;
}

.btn-primary[disabled] {
  opacity: 0.6;
}
</style>
