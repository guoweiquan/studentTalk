<template>
  <view class="page">
    <scroll-view class="form-scroll" scroll-y>
      <!-- 基本信息 -->
      <view class="card">
        <view class="card-title">基本信息</view>
        
        <!-- 第1行：学生姓名 + 学号 -->
        <view class="form-row">
          <view class="form-item half">
            <view class="form-label"><text class="required">*</text>学生姓名</view>
            <input class="input" v-model="formData.student_name" placeholder="请输入学生姓名" />
          </view>
          <view class="form-item half">
            <view class="form-label"><text class="required">*</text>学号</view>
            <input class="input" v-model="formData.student_no" placeholder="如：202301" />
          </view>
        </view>

        <!-- 第2行：班级 + 谈话地点 -->
        <view class="form-row">
          <view class="form-item half">
            <view class="form-label"><text class="required">*</text>班级</view>
            <input class="input" v-model="formData.class_name" placeholder="如：7年级2班" />
          </view>
          <view class="form-item half">
            <view class="form-label"><text class="required">*</text>谈话地点</view>
            <input class="input" v-model="formData.talk_place" placeholder="如：办公室" />
          </view>
        </view>

        <!-- 第3行：谈话时间（只读，标签与日期同行） -->
        <view class="form-item">
          <view class="talk-time-row">
            <text class="talk-time-label">谈话时间：</text>
            <text class="talk-time-value">{{ talkDate }}</text>
          </view>
        </view>
      </view>

      <!-- 场景选择 -->
      <view class="card scene-card">
        <view class="form-item">
          <view class="form-label">场景（可选）</view>
          <view class="scene-group">
            <view
              v-for="scene in sceneOptions"
              :key="scene.value"
              :class="['scene-item', { active: selectedScene === scene.value }]"
              @click="selectedScene = scene.value"
            >
              <view :class="['scene-dot', selectedScene === scene.value ? 'active' : '']"></view>
              <text>{{ scene.label }}</text>
            </view>
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
              v-for="tag in getFilteredTags('reason')"
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

      <!-- 学生表现 -->
      <view class="card">
        <view class="form-item">
          <view class="form-label"><text class="required">*</text>学生表现</view>
          <view class="checkbox-group">
            <view
              v-for="tag in getFilteredTags('attitude')"
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
              v-for="tag in getFilteredTags('analysis')"
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

      <!-- 处置结果 -->
      <view class="card">
        <view class="form-item">
          <view class="form-label"><text class="required">*</text>处置结果</view>
          <view class="checkbox-group">
            <view
              v-for="tag in getFilteredTags('measures')"
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

      <!-- 谈话记录 -->
      <view class="card">
        <view class="form-item">
          <view class="form-label"><text class="required">*</text>谈话记录</view>
          <textarea
            class="textarea"
            v-model="formData.talk_content"
            placeholder="请输入谈话事由及详细内容..."
            :maxlength="2000"
          />
          <!-- 辅助输入按钮 -->
          <view class="assist-buttons">
            <view 
              :class="['assist-btn', { recording: isRecordingTalkContent }]" 
              @click="handleVoiceInput('talk_content')"
            >
              <text class="assist-icon">🎤</text>
              <text class="assist-text">{{ isRecordingTalkContent ? '录音中...' : '语音输入' }}</text>
            </view>
            <view 
              class="assist-btn" 
              @click="handleOcrInput('talk_content')"
              :class="{ disabled: isOcrProcessingTalkContent }"
            >
              <text class="assist-icon">📷</text>
              <text class="assist-text">{{ isOcrProcessingTalkContent ? '识别中...' : '拍照识别' }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 情况分析 -->
      <view class="card">
        <view class="form-item">
          <view class="form-label"><text class="required">*</text>情况分析</view>
          <textarea
            class="textarea"
            v-model="formData.situation_analysis"
            placeholder="请输入情况分析内容..."
            :maxlength="2000"
          />
          <!-- 辅助输入按钮 -->
          <view class="assist-buttons">
            <view 
              :class="['assist-btn', { recording: isRecordingSituationAnalysis }]" 
              @click="handleVoiceInput('situation_analysis')"
            >
              <text class="assist-icon">🎤</text>
              <text class="assist-text">{{ isRecordingSituationAnalysis ? '录音中...' : '语音输入' }}</text>
            </view>
            <view 
              class="assist-btn" 
              @click="handleOcrInput('situation_analysis')"
              :class="{ disabled: isOcrProcessingSituationAnalysis }"
            >
              <text class="assist-icon">📷</text>
              <text class="assist-text">{{ isOcrProcessingSituationAnalysis ? '识别中...' : '拍照识别' }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 处置结果 -->
      <view class="card">
        <view class="form-item">
          <view class="form-label"><text class="required">*</text>处置结果</view>
          <textarea
            class="textarea"
            v-model="formData.disposal_result"
            placeholder="请输入处置结果内容..."
            :maxlength="2000"
          />
          <!-- 辅助输入按钮 -->
          <view class="assist-buttons">
            <view 
              :class="['assist-btn', { recording: isRecordingDisposalResult }]" 
              @click="handleVoiceInput('disposal_result')"
            >
              <text class="assist-icon">🎤</text>
              <text class="assist-text">{{ isRecordingDisposalResult ? '录音中...' : '语音输入' }}</text>
            </view>
            <view 
              class="assist-btn" 
              @click="handleOcrInput('disposal_result')"
              :class="{ disabled: isOcrProcessingDisposalResult }"
            >
              <text class="assist-icon">📷</text>
              <text class="assist-text">{{ isOcrProcessingDisposalResult ? '识别中...' : '拍照识别' }}</text>
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
  risk_level: 1,
  talk_content: '',
  situation_analysis: '',
  disposal_result: '',
  form_data: {
    student_behavior: '',
    analysis: '',
    result: '',
  },
});

const talkDate = ref('');

// 语音输入和OCR识别状态（每个输入区域独立控制）
const isRecordingTalkContent = ref(false);
const isRecordingSituationAnalysis = ref(false);
const isRecordingDisposalResult = ref(false);
const isOcrProcessingTalkContent = ref(false);
const isOcrProcessingSituationAnalysis = ref(false);
const isOcrProcessingDisposalResult = ref(false);

// 当前正在录音的目标字段
const currentRecordingField = ref<string | null>(null);

// 标签选项（5个类别）
const tagOptions = reactive<Record<string, TagDetail[]>>({
  participants: [],
  reason: [],
  attitude: [],
  analysis: [],
  measures: [],
});

// 已选标签
const selectedTags = reactive<Record<string, string[]>>({
  participants: [],
  reason: [],
  attitude: [],
  analysis: [],
  measures: [],
});

// 自定义输入
const customInputs = reactive<Record<string, string>>({
  participants: '',
  reason: '',
  attitude: '',
  analysis: '',
  measures: '',
});

const submitting = ref(false);

// 场景选项
const sceneOptions = [
  { value: '', label: '全部' },
  { value: '学业', label: '学业' },
  { value: '违纪', label: '违纪' },
  { value: '心理', label: '心理' },
  { value: '宿舍', label: '宿舍' },
];

// 当前选中的场景（空字符串表示全部）
const selectedScene = ref('');

// 获取过滤后的标签列表（根据场景过滤，参与人除外）
function getFilteredTags(category: string): TagDetail[] {
  const allTags = tagOptions[category] || [];
  
  // 如果选择了"全部"（空字符串），返回去重后的标签
  if (!selectedScene.value) {
    // 按 tag_value 去重
    const seen = new Set<string>();
    return allTags.filter(tag => {
      if (seen.has(tag.tag_value)) {
        return false;
      }
      seen.add(tag.tag_value);
      return true;
    });
  }
  
  // 否则按 tag_type 过滤
  return allTags.filter(tag => tag.tag_type === selectedScene.value);
}

// 加载快捷标签
async function loadQuickTags() {
  try {
    const res = await getQuickTags();
    res.data.forEach((tag: QuickTag) => {
      if (tagOptions[tag.category_code] !== undefined) {
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
  const studentBehavior = mergeTagsAndCustom('attitude');
  const analysis = mergeTagsAndCustom('analysis');
  const result = mergeTagsAndCustom('measures');
  const riskLabel = riskLevels.find(l => l.value === formData.risk_level)?.label || '低';

  return `【学生谈话记录表】
学生姓名：${formData.student_name}    班级/学号：${formData.class_name} / ${formData.student_no}
谈话时间：${talkDate.value}    地点：${formData.talk_place}    参与人：${participants}
谈话事由：${reason}
学生表现：${studentBehavior}
原因分析：${analysis}
处置结果：${result}
风险等级：${riskLabel}
谈话记录：${formData.talk_content}`;
}

// 表单验证
function validateForm(): boolean {
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
  if (!formData.talk_content.trim()) {
    uni.showToast({ title: '请输入谈话记录', icon: 'none' });
    return false;
  }
  return true;
}

// ============ 语音输入功能 ============
// 微信同声传译插件（需要在小程序后台添加插件）
// 插件AppID: wx069ba97219f66d99
let plugin: any = null;
let manager: any = null;

// 初始化语音识别插件
function initVoicePlugin() {
  // #ifdef MP-WEIXIN
  try {
    plugin = requirePlugin('WechatSI');
    manager = plugin.getRecordRecognitionManager();
    
    // 识别结果回调
    manager.onRecognize = (res: { result: string }) => {
      if (res.result && currentRecordingField.value) {
        // 追加到对应字段
        appendTextToField(currentRecordingField.value, res.result);
      }
    };
    
    // 识别结束回调
    manager.onStop = (res: { result: string }) => {
      setRecordingState(currentRecordingField.value, false);
      if (res.result && currentRecordingField.value) {
        appendTextToField(currentRecordingField.value, res.result);
        uni.showToast({ title: '识别完成', icon: 'success' });
      }
      currentRecordingField.value = null;
    };
    
    // 错误回调
    manager.onError = (err: { msg: string }) => {
      setRecordingState(currentRecordingField.value, false);
      currentRecordingField.value = null;
      console.error('语音识别错误:', err);
      uni.showToast({ title: err.msg || '语音识别失败', icon: 'none' });
    };
  } catch (e) {
    console.error('加载语音插件失败，请确保已添加微信同声传译插件');
  }
  // #endif
}

// 设置录音状态
function setRecordingState(field: string | null, state: boolean) {
  if (field === 'talk_content') {
    isRecordingTalkContent.value = state;
  } else if (field === 'situation_analysis') {
    isRecordingSituationAnalysis.value = state;
  } else if (field === 'disposal_result') {
    isRecordingDisposalResult.value = state;
  }
}

// 设置OCR处理状态
function setOcrProcessingState(field: string, state: boolean) {
  if (field === 'talk_content') {
    isOcrProcessingTalkContent.value = state;
  } else if (field === 'situation_analysis') {
    isOcrProcessingSituationAnalysis.value = state;
  } else if (field === 'disposal_result') {
    isOcrProcessingDisposalResult.value = state;
  }
}

// 追加文本到指定字段
function appendTextToField(field: string, text: string) {
  if (field === 'talk_content') {
    formData.talk_content += text;
  } else if (field === 'situation_analysis') {
    formData.situation_analysis += text;
  } else if (field === 'disposal_result') {
    formData.disposal_result += text;
  }
}

// 检查是否正在录音
function isFieldRecording(field: string): boolean {
  if (field === 'talk_content') return isRecordingTalkContent.value;
  if (field === 'situation_analysis') return isRecordingSituationAnalysis.value;
  if (field === 'disposal_result') return isRecordingDisposalResult.value;
  return false;
}

// 语音输入处理
function handleVoiceInput(targetField: string) {
  // #ifdef MP-WEIXIN
  if (!manager) {
    uni.showToast({ title: '请先在小程序后台添加同声传译插件', icon: 'none' });
    return;
  }
  
  if (isFieldRecording(targetField)) {
    // 停止录音
    manager.stop();
  } else {
    // 开始录音
    currentRecordingField.value = targetField;
    setRecordingState(targetField, true);
    manager.start({
      lang: 'zh_CN',  // 中文
    });
    uni.showToast({ title: '开始录音，再次点击结束', icon: 'none' });
  }
  // #endif
  
  // #ifdef H5
  uni.showToast({ title: '语音输入仅支持微信小程序', icon: 'none' });
  // #endif
}

// ============ 拍照识别功能（OCR） ============
// 百度OCR - 需要配置后端API
async function handleOcrInput(targetField: string) {
  // 检查该字段是否正在处理
  if (targetField === 'talk_content' && isOcrProcessingTalkContent.value) return;
  if (targetField === 'situation_analysis' && isOcrProcessingSituationAnalysis.value) return;
  if (targetField === 'disposal_result' && isOcrProcessingDisposalResult.value) return;
  
  try {
    // 选择图片（拍照或相册）
    const res = await uni.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['camera', 'album'],
    });
    
    if (!res.tempFilePaths || res.tempFilePaths.length === 0) {
      return;
    }
    
    setOcrProcessingState(targetField, true);
    uni.showLoading({ title: '正在识别...' });
    
    const imagePath = res.tempFilePaths[0];
    
    // 上传图片到后端进行OCR识别
    uni.uploadFile({
      url: 'http://192.168.0.103:3000/api/v1/ocr/recognize',
      filePath: imagePath,
      name: 'image',
      success: (uploadRes) => {
        try {
          const data = JSON.parse(uploadRes.data);
          if (data.code === 200 && data.data?.text) {
            // 追加识别结果到对应字段
            if (targetField === 'talk_content') {
              if (formData.talk_content) formData.talk_content += '\n';
              formData.talk_content += data.data.text;
            } else if (targetField === 'situation_analysis') {
              if (formData.situation_analysis) formData.situation_analysis += '\n';
              formData.situation_analysis += data.data.text;
            } else if (targetField === 'disposal_result') {
              if (formData.disposal_result) formData.disposal_result += '\n';
              formData.disposal_result += data.data.text;
            }
            uni.showToast({ title: '识别完成', icon: 'success' });
          } else {
            uni.showToast({ title: data.message || 'OCR识别失败', icon: 'none' });
          }
        } catch (e) {
          uni.showToast({ title: '解析识别结果失败', icon: 'none' });
        }
      },
      fail: (err) => {
        console.error('上传图片失败:', err);
        uni.showToast({ title: '上传图片失败', icon: 'none' });
      },
      complete: () => {
        setOcrProcessingState(targetField, false);
        uni.hideLoading();
      },
    });
  } catch (err) {
    console.error('选择图片失败:', err);
    setOcrProcessingState(targetField, false);
  }
}

// 重置表单
function resetForm() {
  // 重置基本信息
  formData.student_name = '';
  formData.class_name = '';
  formData.student_no = '';
  formData.talk_place = '';
  formData.risk_level = 1;
  formData.talk_content = '';
  formData.situation_analysis = '';
  formData.disposal_result = '';
  
  // 重置选中标签
  selectedTags.participants = [];
  selectedTags.reason = [];
  selectedTags.attitude = [];
  selectedTags.analysis = [];
  selectedTags.measures = [];
  
  // 重置自定义输入
  customInputs.participants = '';
  customInputs.reason = '';
  customInputs.attitude = '';
  customInputs.analysis = '';
  customInputs.measures = '';
  
  // 重置场景
  selectedScene.value = '';
  
  // 重置日期
  const today = new Date();
  talkDate.value = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  formData.talk_time = talkDate.value + ' 09:00:00';
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
      form_data: {
        student_behavior: mergeTagsAndCustom('attitude'),
        analysis: mergeTagsAndCustom('analysis'),
        result: mergeTagsAndCustom('measures'),
      },
      tags: [
        ...selectedTags.participants,
        ...selectedTags.reason,
        ...selectedTags.attitude,
        ...selectedTags.analysis,
        ...selectedTags.measures,
      ],
      risk_level: formData.risk_level,
      talk_content: formData.talk_content,
      situation_analysis: formData.situation_analysis,
      disposal_result: formData.disposal_result,
      generated_content: generatedContent,
      record_date: talkDate.value,
    });
    
    uni.showToast({ title: '保存成功', icon: 'success' });
    
    // 通知列表页刷新
    uni.$emit('refreshRecordList');
    
    // 返回列表页并重置表单
    setTimeout(() => {
      resetForm(); //清空表单
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
  initVoicePlugin();  // 初始化语音识别插件
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

.talk-time-row {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  background-color: #f9f9f9;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

.talk-time-label {
  font-size: 14px;
  color: #666;
}

.talk-time-value {
  font-size: 14px;
  color: #333;
  font-weight: 500;
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
  bottom: var(--window-bottom, 0);
  left: 0;
  right: 0;
  padding: 12px 16px;
  padding-bottom: calc(12px + constant(safe-area-inset-bottom));
  padding-bottom: calc(12px + env(safe-area-inset-bottom));
  background-color: #fff;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.08);
  z-index: 999;
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

/* 辅助输入按钮样式 */
.assist-buttons {
  display: flex;
  gap: 12px;
  margin-top: 12px;
}

.assist-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 12px 16px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border: 1px solid #dee2e6;
  border-radius: 12px;
  transition: all 0.2s ease;
}

.assist-btn:active {
  transform: scale(0.98);
  background: linear-gradient(135deg, #e9ecef 0%, #dee2e6 100%);
}

.assist-btn.recording {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5253 100%);
  border-color: #ee5253;
}

.assist-btn.recording .assist-text {
  color: #fff;
}

.assist-btn.disabled {
  opacity: 0.6;
  pointer-events: none;
}

.assist-icon {
  font-size: 18px;
}

.assist-text {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

/* 场景选择样式 */
.scene-card {
  background-color: #f0f7ff !important;
  border: 1px solid #bae0ff;
}

.scene-group {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.scene-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 20px;
  font-size: 14px;
  color: #666;
  background-color: #fafafa;
  cursor: pointer;
  transition: all 0.2s ease;
}

.scene-item:active {
  transform: scale(0.98);
}

.scene-item.active {
  background-color: #e6f4ff;
  border-color: #007AFF;
  color: #007AFF;
  font-weight: 500;
}

.scene-dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 2px solid #e0e0e0;
  transition: all 0.2s ease;
}

.scene-dot.active {
  border-color: #007AFF;
  border-width: 4px;
}


</style>
