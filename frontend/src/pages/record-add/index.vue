<template>
  <view class="page">
    <scroll-view class="form-scroll" scroll-y>
      <!-- 学生信息卡片区域 -->
      <view class="card">
        <view class="card-title">学生信息</view>
        <view class="student-cards">
          <!-- 已添加的学生卡片 -->
          <view 
            v-for="(student, index) in students" 
            :key="index" 
            class="student-card"
            @click="handleEditStudent(index)"
          >
            <text class="student-name">{{ student.student_name }}</text>
          </view>
          
          <!-- 添加学生按钮 -->
          <view 
            v-if="mode === 'add'" 
            class="student-card add-card" 
            @click="handleAddStudent"
          >
            <text class="add-icon">+</text>
            <text class="add-text">添加</text>
          </view>
        </view>
      </view>

      <!-- 场景选择 -->
      <view class="card scene-card" v-if="mode !== 'view'">
        <view class="form-item">
          <view class="form-label">场景（可选）</view>
          <view class="scene-group">
            <view
              v-for="scene in sceneOptions"
              :key="scene.value"
              :class="['scene-item', { active: selectedScene === scene.value }]"
              :style="selectedScene === scene.value ? { borderColor: scene.color, backgroundColor: scene.color + '15', color: scene.color } : {}"
              @click="mode !== 'view' && (selectedScene = scene.value)"
            >
              <view 
                :class="['scene-dot', selectedScene === scene.value ? 'active' : '']"
                :style="selectedScene === scene.value ? { borderColor: scene.color } : {}"
              ></view>
              <text v-if="scene.icon" class="scene-icon">{{ scene.icon }}</text>
              <text>{{ scene.label }}</text>
            </view>
          </view>
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
              :class="['checkbox-item', 'tag-blue', { active: selectedTags.reason.includes(tag.tag_value) }]"
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
              :class="['checkbox-item', 'tag-cyan', { active: selectedTags.attitude.includes(tag.tag_value) }]"
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
              :class="['checkbox-item', 'tag-green', { active: selectedTags.analysis.includes(tag.tag_value) }]"
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
              :class="['checkbox-item', 'tag-orange', { active: selectedTags.measures.includes(tag.tag_value) }]"
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

      <!-- 谈话记录 (合并版) -->
      <view class="card">
        <view class="card-title">谈话记录</view>
        
        <!-- 谈话事由 -->
        <view class="form-item">
          <view class="form-label"><text class="required">*</text>谈话事由</view>
          <textarea
            class="textarea"
            v-model="formData.talk_content"
            placeholder="请输入谈话事由及详细内容..."
            :maxlength="2000"
            @focus="currentFocusField = 'talk_content'"
          />
        </view>

        <!-- 情况分析 -->
        <view class="form-item">
          <view class="form-label"><text class="required">*</text>情况分析</view>
          <textarea
            class="textarea"
            v-model="formData.situation_analysis"
            placeholder="请输入情况分析内容..."
            :maxlength="2000"
             @focus="currentFocusField = 'situation_analysis'"
          />
        </view>

        <!-- 处置结果 -->
        <view class="form-item">
          <view class="form-label"><text class="required">*</text>处置结果</view>
          <textarea
            class="textarea"
            v-model="formData.disposal_result"
            placeholder="请输入处置结果内容..."
            :maxlength="2000"
             @focus="currentFocusField = 'disposal_result'"
          />
        </view>

        <!-- 底部共享按钮 -->
        <view class="assist-buttons centered">
          <view 
            :class="['assist-btn', 'assist-btn-small', { recording: isAnyRecording }]" 
            @click="handleVoiceInput()"
          >
            <text class="assist-icon">🎤</text>
            <text class="assist-text">{{ isAnyRecording ? '录音中...' : '语音输入' }}</text>
          </view>
          <view 
            class="assist-btn assist-btn-small" 
            @click="handleOcrInput()"
            :class="{ disabled: isAnyOcrProcessing }"
          >
            <text class="assist-icon">📷</text>
            <text class="assist-text">{{ isAnyOcrProcessing ? '识别中...' : '拍照识别' }}</text>
          </view>
        </view>
      </view>

      <!-- 底部占位 -->
      <view style="height: 100px;"></view>
    </scroll-view>

    <!-- 底部按钮 -->
    <view class="bottom-bar">
      <!-- 新增模式 -->
      <button v-if="mode === 'add'" class="btn btn-primary" @click="handleSubmit" :disabled="submitting">
        {{ submitting ? '保存中...' : '提交保存' }}
      </button>
      
      <!-- 查看模式 -->
      <template v-if="mode === 'view'">
        <button class="btn btn-secondary" @click="handleEdit">编辑记录</button>
        <button class="btn btn-danger" @click="handleDelete">删除记录</button>
      </template>
      
      <!-- 编辑模式 -->
      <template v-if="mode === 'edit'">
        <button class="btn btn-secondary" @click="handleCancel">取消</button>
        <button class="btn btn-primary" @click="handleSubmit" :disabled="submitting">
          {{ submitting ? '保存中...' : '保存' }}
        </button>
      </template>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import { getQuickTags, createRecord, updateRecord, deleteRecord, getRecordDetail, type QuickTag, type TagDetail } from '@/api/index';

// 页面模式: 新增/查看/编辑
type PageMode = 'add' | 'view' | 'edit';
const mode = ref<PageMode>('add');
const recordId = ref<number | null>(null);

// 学生信息接口
interface StudentInfo {
  student_name: string;
  student_no: string;
  class_name: string;
}

// 学生列表（新增模式下支持多学生）
const students = ref<StudentInfo[]>([]);

// 风险等级选项
const riskLevels = [
  { value: 1, label: '低' },
  { value: 2, label: '中' },
  { value: 3, label: '高' },
];

// 表单数据（不再包含学生信息和谈话地点）
const formData = reactive({
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

const isAnyRecording = computed(() => isRecordingTalkContent.value || isRecordingSituationAnalysis.value || isRecordingDisposalResult.value);
const isAnyOcrProcessing = computed(() => isOcrProcessingTalkContent.value || isOcrProcessingSituationAnalysis.value || isOcrProcessingDisposalResult.value);

// 当前聚焦的输入框 (默认第一个)
const currentFocusField = ref('talk_content');

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
  { value: '', label: '全部', icon: '', color: '#007AFF' },
  { value: '学业', label: '学业', icon: '📚', color: '#1890ff' },
  { value: '违纪', label: '违纪', icon: '⚠️', color: '#faad14' },
  { value: '心理', label: '心理', icon: '💗', color: '#eb2f96' },
  { value: '宿舍', label: '宿舍', icon: '🏠', color: '#52c41a' },
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

// 判断字段是否禁用
function isFieldDisabled(fieldName: string): boolean {
  // 新增模式：所有字段可编辑
  if (mode.value === 'add') return false;
  
  // 查看模式：所有字段禁用
  if (mode.value === 'view') return true;
  
  // 编辑模式：基础信息字段禁用,其他字段可编辑
  const baseInfoFields = ['student_name', 'student_no', 'class_name', 'talk_place', 'talk_time'];
  if (mode.value === 'edit' && baseInfoFields.includes(fieldName)) {
    return true;
  }
  
  return false;
}

// 加载记录详情
async function loadRecordDetail(id: number) {
  try {
    const res = await getRecordDetail(id);
    const data = res.data;
    
    // 填充学生信息到 students 数组
    students.value = [{
      student_name: data.student_name,
      student_no: data.student_no,
      class_name: data.class_name,
    }];
    
    // 填充其他表单数据
    formData.risk_level = data.risk_level;
    formData.talk_content = data.talk_content || '';
    formData.situation_analysis = data.situation_analysis || '';
    formData.disposal_result = data.disposal_result || '';
    
    // 解析并填充标签数据
    if (data.tags && Array.isArray(data.tags)) {
      selectedTags.participants = data.tags.filter(t => tagOptions.participants.some(opt => opt.tag_value === t));
      selectedTags.reason = data.tags.filter(t => tagOptions.reason.some(opt => opt.tag_value === t));
      selectedTags.attitude = data.tags.filter(t => tagOptions.attitude.some(opt => opt.tag_value === t));
      selectedTags.analysis = data.tags.filter(t => tagOptions.analysis.some(opt => opt.tag_value === t));
      selectedTags.measures = data.tags.filter(t => tagOptions.measures.some(opt => opt.tag_value === t));
    }
    
    // 设置谈话日期
    if (data.record_date) {
      talkDate.value = data.record_date.split('T')[0];
    }
    
    // 解析参与人
    if (data.participants) {
      const parts = data.participants.split('、');
      const knownTags = tagOptions.participants.map(t => t.tag_value);
      selectedTags.participants = parts.filter(p => knownTags.includes(p));
      const custom = parts.filter(p => !knownTags.includes(p));
      if (custom.length > 0) {
        customInputs.participants = custom.join('、');
      }
    }
    
    // 类似地解析其他字段
    ['reason', 'attitude', 'analysis', 'measures'].forEach((key) => {
      const fieldKey = key === 'attitude' ? 'student_behavior' : 
                       key === 'analysis' ? 'analysis' : 
                       key === 'measures' ? 'result' : key;
      const value = data.form_data?.[fieldKey];
      if (typeof value === 'string') {
        const parts = value.split('、');
        const knownTags = tagOptions[key].map((t: TagDetail) => t.tag_value);
        selectedTags[key] = parts.filter(p => knownTags.includes(p));
        const custom = parts.filter(p => !knownTags.includes(p));
        if (custom.length > 0) {
          customInputs[key] = custom.join('、');
        }
      }
    });
    
  } catch (error) {
    console.error('加载记录详情失败:', error);
    uni.showToast({ title: '加载记录失败', icon: 'none' });
  }
}

// 编辑记录
function handleEdit() {
  mode.value = 'edit';
}

// 删除记录
async function handleDelete() {
  if (!recordId.value) return;
  
  uni.showModal({
    title: '确认删除',
    content: '确定要删除这条记录吗？删除后无法恢复。',
    success: async (res) => {
      if (res.confirm && recordId.value) {
        try {
          await deleteRecord(recordId.value);
          uni.showToast({ title: '删除成功', icon: 'success' });
          setTimeout(() => {
            uni.switchTab({ url: '/pages/record-list/index' });
          }, 1500);
        } catch (error) {
          console.error('删除失败:', error);
          uni.showToast({ title: '删除失败', icon: 'none' });
        }
      }
    },
  });
}

// 取消编辑
function handleCancel() {
  // 检查是否是从详情页跳转过来的
  const source = uni.getStorageSync('editRecordSource');
  
  if (source && source.fromDetail && source.recordId) {
    // 清除来源标记和编辑数据
    uni.removeStorageSync('editRecordSource');
    uni.removeStorageSync('editRecord');
    
    // 返回详情页（只读模式）
    uni.navigateTo({
      url: `/pages/record-detail/index?id=${source.recordId}`,
      success: () => {
        console.log('取消编辑，返回详情页');
      },
      fail: (err) => {
        console.error('返回详情页失败:', err);
        // 如果跳转失败，fallback 到原有逻辑
        mode.value = 'view';
        if (recordId.value) {
          loadRecordDetail(recordId.value);
        }
      }
    });
  } else {
    // 原有逻辑：直接切换到查看模式
    mode.value = 'view';
    // 重新加载数据
    if (recordId.value) {
      loadRecordDetail(recordId.value);
    }
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

// ============ 学生操作函数 ============

// 添加学生
function handleAddStudent() {
  // 保存当前学生列表到 Storage
  uni.setStorageSync('temp_students', students.value);
  // 跳转到学生信息页面（新增模式）
  uni.navigateTo({
    url: '/pages/student-info/index?mode=add',
  });
}

// 编辑学生
function handleEditStudent(index: number) {
  // 保存当前学生列表到 Storage
  uni.setStorageSync('temp_students', students.value);
  // 跳转到学生信息页面（编辑模式）
  uni.navigateTo({
    url: `/pages/student-info/index?mode=edit&index=${index}`,
  });
}


// 合并选中标签和自定义输入
function mergeTagsAndCustom(category: string): string {
  const tags = [...selectedTags[category]];
  if (customInputs[category].trim()) {
    tags.push(customInputs[category].trim());
  }
  return tags.join('、');
}

// 生成记录文本（单个学生版本）
function generateContent(student: StudentInfo): string {
  const reason = mergeTagsAndCustom('reason');
  const studentBehavior = mergeTagsAndCustom('attitude');
  const analysis = mergeTagsAndCustom('analysis');
  const result = mergeTagsAndCustom('measures');
  const riskLabel = riskLevels.find(l => l.value === formData.risk_level)?.label || '低';

  return `【学生谈话记录表】
学生姓名：${student.student_name}    班级/学号：${student.class_name} / ${student.student_no}
谈话时间：${talkDate.value}
谈话事由：${reason}
学生表现：${studentBehavior}
原因分析：${analysis}
处置结果：${result}
风险等级：${riskLabel}
谈话记录：${formData.talk_content}`;
}

// 表单验证
function validateForm(): boolean {
  // 新增模式下检查学生数组
  if (mode.value === 'add' && students.value.length === 0) {
    uni.showToast({ title: '请添加至少一个学生', icon: 'none' });
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
function handleVoiceInput(targetField?: string) {
  // #ifdef MP-WEIXIN
  if (!manager) {
    uni.showToast({ title: '请先在小程序后台添加同声传译插件', icon: 'none' });
    return;
  }
  
  // 如果正在录音，则停止（无论当前点击的是哪个字段，或者共享按钮）
  if (isRecordingTalkContent.value || isRecordingSituationAnalysis.value || isRecordingDisposalResult.value) {
    manager.stop();
    return;
  }
  
  // 确定目标字段 (参数优先 > 当前焦点 > 默认)
  const field = targetField || currentFocusField.value || 'talk_content';
  
  // 开始录音
  currentRecordingField.value = field;
  setRecordingState(field, true);
  manager.start({
    lang: 'zh_CN',  // 中文
  });
  uni.showToast({ title: '开始录音，再次点击结束', icon: 'none' });

  // #endif
  
  // #ifdef H5
  uni.showToast({ title: '语音输入仅支持微信小程序', icon: 'none' });
  // #endif
}

// ============ 拍照识别功能（OCR） ============
// 百度OCR - 需要配置后端API
async function handleOcrInput(targetField?: string) {
  // 确定目标字段 (参数优先 > 当前焦点 > 默认)
  const field = targetField || currentFocusField.value || 'talk_content';

  // 检查该字段是否正在处理
  if (field === 'talk_content' && isOcrProcessingTalkContent.value) return;
  if (field === 'situation_analysis' && isOcrProcessingSituationAnalysis.value) return;
  if (field === 'disposal_result' && isOcrProcessingDisposalResult.value) return;
  
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
    
    setOcrProcessingState(field, true);
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
            if (field === 'talk_content') {
              if (formData.talk_content) formData.talk_content += '\n';
              formData.talk_content += data.data.text;
            } else if (field === 'situation_analysis') {
              if (formData.situation_analysis) formData.situation_analysis += '\n';
              formData.situation_analysis += data.data.text;
            } else if (field === 'disposal_result') {
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
        setOcrProcessingState(field, false);
        uni.hideLoading();
      },
    });
  } catch (err) {
    console.error('选择图片失败:', err);
    setOcrProcessingState(field, false);
  }
}

// 重置表单
function resetForm() {
  // 重置学生列表
  students.value = [];
  uni.removeStorageSync('temp_students');
  
  // 重置表单数据
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
}

// 提交表单
async function handleSubmit() {
  if (!validateForm()) return;
  
  submitting.value = true;
  
  try {
    const talkTime = talkDate.value + ' 09:00:00';
    const commonData = {
      talk_time: talkTime,
      participants: '',  // 参与人已移除，设为空字符串
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
      record_date: talkDate.value,
    };
    
    if (mode.value === 'edit' && recordId.value && students.value.length > 0) {
      // 编辑模式：更新单条记录
      const student = students.value[0];
      const requestData = {
        ...commonData,
        student_name: student.student_name,
        class_name: student.class_name,
        student_no: student.student_no,
        generated_content: generateContent(student),
      };
      await updateRecord(recordId.value, requestData);
      uni.showToast({ title: '更新成功', icon: 'success' });
      
      // 通知列表页刷新
      uni.$emit('refreshRecordList');
      
      // 返回列表页
      setTimeout(() => {
        uni.switchTab({ url: '/pages/record-list/index' });
      }, 1500);
    } else {
      // 新增模式：为每个学生创建一条记录
      for (const student of students.value) {
        const requestData = {
          ...commonData,
          student_name: student.student_name,
          class_name: student.class_name,
          student_no: student.student_no,
          generated_content: generateContent(student),
        };
        await createRecord(requestData);
      }
      
      const count = students.value.length;
      uni.showToast({ title: `成功创建 ${count} 条记录`, icon: 'success' });
      
      // 通知列表页刷新
      uni.$emit('refreshRecordList');
      
      // 清空表单，停留在新增页面继续录入
      setTimeout(() => {
        resetForm();
      }, 1500);
    }
  } catch (error) {
    console.error('保存失败:', error);
    uni.showToast({ title: '保存失败', icon: 'none' });
  } finally {
    submitting.value = false;
  }
}

onMounted(() => {
  console.log('record-add 页面 onMounted 触发');
  loadQuickTags();
  initVoicePlugin();  // 初始化语音识别插件
  
  // 解析URL参数
  const pages = getCurrentPages();
  const currentPage = pages[pages.length - 1];
  const options = (currentPage as any).$page?.options || {};
  
  // 检查是否是编辑模式（从详情页跳转过来）
  const editRecord = uni.getStorageSync('editRecord');
  console.log('onMounted 检查 editRecord:', editRecord);
  
  if (editRecord && editRecord.id) {
    console.log('检测到编辑记录，准备加载，ID:', editRecord.id);
    // 切换到编辑模式
    recordId.value = editRecord.id;
    mode.value = 'edit';
    
    // 加载记录详情
    loadRecordDetail(recordId.value);
    
    // 清除缓存
    uni.removeStorageSync('editRecord');
  } else if (options.id) {
    recordId.value = parseInt(options.id, 10);
    mode.value = options.mode === 'edit' ? 'edit' : 'view';
    loadRecordDetail(recordId.value);
  } else {
    // 新增模式：默认日期为今天
    console.log('进入新增模式');
    const today = new Date();
    talkDate.value = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    formData.talk_time = talkDate.value + ' 09:00:00';
    
    // 清除来源标记（如果用户直接点击 tabBar 进入新增模式）
    uni.removeStorageSync('editRecordSource');
  }
  
  // 监听从详情页发来的加载编辑记录事件
  uni.$on('loadEditRecord', () => {
    const editRecordData = uni.getStorageSync('editRecord');
    if (editRecordData && editRecordData.id) {
      recordId.value = editRecordData.id;
      mode.value = 'edit';
      loadRecordDetail(recordId.value);
      uni.removeStorageSync('editRecord');
    }
  });
});

// 添加 onShow 生命周期，确保每次页面显示时都检查编辑数据
onShow(() => {
  console.log('record-add 页面 onShow 触发');
  
  // 检查是否有待编辑的记录（针对 H5 环境的兼容处理）
  const editRecord = uni.getStorageSync('editRecord');
  console.log('onShow 检查 editRecord:', editRecord);
  
  if (editRecord && editRecord.id) {
    console.log('onShow 检测到编辑记录，准备加载，ID:', editRecord.id);
    // 切换到编辑模式
    recordId.value = editRecord.id;
    mode.value = 'edit';
    
    // 加载记录详情
    loadRecordDetail(recordId.value);
    
    // 清除缓存
    uni.removeStorageSync('editRecord');
  }
  
  // 检查是否从学生信息页面返回（读取 temp_students）
  if (mode.value === 'add') {
    const tempStudents = uni.getStorageSync('temp_students');
    if (tempStudents && Array.isArray(tempStudents)) {
      students.value = tempStudents;
      console.log('从 Storage 读取学生列表:', tempStudents);
    }
  }
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

/* 学生卡片区域 */
.student-cards {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.student-card {
  min-width: 80px;
  padding: 12px 16px;
  background: linear-gradient(135deg, #e6f4ff, #f0f9ff);
  border: 1px solid #91caff;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.student-card:active {
  transform: scale(0.98);
  background: linear-gradient(135deg, #d6e8ff, #e6f4ff);
}

.student-name {
  font-size: 14px;
  font-weight: 500;
  color: #1677ff;
}

.student-card.add-card {
  background: #fafafa;
  border: 1px dashed #d9d9d9;
  color: #999;
}

.student-card.add-card:active {
  background: #f0f0f0;
  border-color: #bfbfbf;
}

.add-icon {
  font-size: 24px;
  font-weight: 300;
  color: #999;
  line-height: 1;
}

.add-text {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
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
  background-color: #fff;
}

.input[disabled] {
  background-color: #f5f5f5;
  color: #999;
}

.picker-input {
  display: flex;
  align-items: center;
  color: #333;
}

.textarea {
  width: 100%;
  height: 72px;
  padding: 10px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  line-height: 1.5;
  box-sizing: border-box;
  overflow-y: auto;
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

/* 标签配色方案 - 淡蓝色系 (事由/问题) */
.tag-blue {
  background-color: #f0f5ff;
  border-color: #adc6ff;
  color: #597ef7;
}
.tag-blue.active {
  background-color: #e6f4ff;
  border-color: #1677ff;
  color: #1677ff;
}

/* 标签配色方案 - 青色系 (学生表现) */
.tag-cyan {
  background-color: #e6fffb;
  border-color: #87e8de;
  color: #13c2c2;
}
.tag-cyan.active {
  background-color: #b5f5ec;
  border-color: #13c2c2;
  color: #006d75;
}

/* 标签配色方案 - 橙色系 (原因分析) */
.tag-orange {
  background-color: #fff7e6;
  border-color: #ffd591;
  color: #fa8c16;
}
.tag-orange.active {
  background-color: #ffe7ba;
  border-color: #fa8c16;
  color: #d46b08;
}

/* 标签配色方案 - 绿色系 (处置结果) */
.tag-green {
  background-color: #f6ffed;
  border-color: #b7eb8f;
  color: #52c41a;
}
.tag-green.active {
  background-color: #d9f7be;
  border-color: #52c41a;
  color: #389e0d;
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
  display: flex;
  gap: 12px;
}

.btn {
  flex: 1;
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

.btn-secondary {
  background: #f5f5f5;
  color: #333;
  border: 1px solid #e0e0e0;
}

.btn-danger {
  background: #ff4d4f;
  color: #fff;
  border: none;
}

/* 辅助输入按钮样式 */
.assist-buttons {
  display: flex;
  gap: 12px;
  margin-top: 12px;
}

.assist-buttons.centered {
  justify-content: center;
}

.assist-btn-small {
  flex: none;
  min-width: 100px;
  max-width: 120px;
  padding: 10px 14px;
}

.assist-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 14px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border: 1px solid #dee2e6;
  border-radius: 20px;
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

.scene-icon {
  font-size: 16px;
  margin-right: 2px;
}


</style>
