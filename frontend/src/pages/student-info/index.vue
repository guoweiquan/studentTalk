<template>
  <view class="page">
    <view class="form-container">
      <view class="card">
        <view class="form-item">
          <view class="form-label"><text class="required">*</text>学生姓名</view>
          <input 
            class="input" 
            v-model="studentInfo.student_name" 
            placeholder="请输入学生姓名"
            :disabled="isViewMode"
          />
        </view>
        
        <view class="form-item">
          <view class="form-label"><text class="required">*</text>学号</view>
          <input 
            class="input" 
            v-model="studentInfo.student_no" 
            placeholder="如：202301"
            :disabled="isViewMode"
          />
        </view>
        
        <view class="form-item">
          <view class="form-label"><text class="required">*</text>班级</view>
          <input 
            class="input" 
            v-model="studentInfo.class_name" 
            placeholder="如：7年级2班"
            :disabled="isViewMode"
          />
        </view>
      </view>
    </view>
    
    <!-- 底部按钮 -->
    <view class="bottom-bar" v-if="!isViewMode">
      <button class="btn btn-primary" @click="handleConfirm">
        {{ isEditMode ? '确认修改' : '确认添加' }}
      </button>
      <button v-if="isEditMode" class="btn btn-danger" @click="handleDelete">
        删除学生
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';

// 学生信息接口
interface StudentInfo {
  student_name: string;
  student_no: string;
  class_name: string;
}

// 页面模式
const mode = ref<'add' | 'edit' | 'view'>('add');
const editIndex = ref<number>(-1);

// 学生信息
const studentInfo = reactive<StudentInfo>({
  student_name: '',
  student_no: '',
  class_name: '',
});

// 计算属性
const isEditMode = computed(() => mode.value === 'edit');
const isViewMode = computed(() => mode.value === 'view');

// 页面加载
onMounted(() => {
  // 获取传递的参数
  const pages = getCurrentPages();
  const currentPage = pages[pages.length - 1];
  const options = (currentPage as any).options || {};
  
  // 读取模式
  if (options.mode) {
    mode.value = options.mode as 'add' | 'edit' | 'view';
  }
  
  // 读取编辑索引
  if (options.index !== undefined) {
    editIndex.value = parseInt(options.index, 10);
  }
  
  // 如果是编辑模式，从 Storage 读取学生信息
  if (mode.value === 'edit' || mode.value === 'view') {
    const students = uni.getStorageSync('temp_students') || [];
    if (editIndex.value >= 0 && editIndex.value < students.length) {
      const student = students[editIndex.value];
      studentInfo.student_name = student.student_name;
      studentInfo.student_no = student.student_no;
      studentInfo.class_name = student.class_name;
    }
  }
});

// 表单验证
function validateForm(): boolean {
  if (!studentInfo.student_name.trim()) {
    uni.showToast({ title: '请输入学生姓名', icon: 'none' });
    return false;
  }
  if (!studentInfo.student_no.trim()) {
    uni.showToast({ title: '请输入学号', icon: 'none' });
    return false;
  }
  if (!studentInfo.class_name.trim()) {
    uni.showToast({ title: '请输入班级', icon: 'none' });
    return false;
  }
  return true;
}

// 确认添加/修改
function handleConfirm() {
  if (!validateForm()) return;
  
  // 读取当前学生列表
  const students: StudentInfo[] = uni.getStorageSync('temp_students') || [];
  
  if (mode.value === 'edit' && editIndex.value >= 0) {
    // 编辑模式：更新对应索引的学生
    students[editIndex.value] = {
      student_name: studentInfo.student_name.trim(),
      student_no: studentInfo.student_no.trim(),
      class_name: studentInfo.class_name.trim(),
    };
  } else {
    // 新增模式：添加到列表
    students.push({
      student_name: studentInfo.student_name.trim(),
      student_no: studentInfo.student_no.trim(),
      class_name: studentInfo.class_name.trim(),
    });
  }
  
  // 保存到 Storage
  uni.setStorageSync('temp_students', students);
  
  // 返回上一页
  uni.navigateBack();
}

// 删除学生
function handleDelete() {
  uni.showModal({
    title: '确认删除',
    content: '确定要删除该学生吗？',
    success: (res) => {
      if (res.confirm) {
        const students: StudentInfo[] = uni.getStorageSync('temp_students') || [];
        
        if (editIndex.value >= 0 && editIndex.value < students.length) {
          students.splice(editIndex.value, 1);
          uni.setStorageSync('temp_students', students);
        }
        
        uni.navigateBack();
      }
    },
  });
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 120px;
}

.form-container {
  padding: 10px;
}

.card {
  background: #fff;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 10px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

.form-item {
  margin-bottom: 15px;
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

.input {
  width: 100%;
  height: 40px;
  padding: 0 12px;
  font-size: 14px;
  border: 1px solid #e5e5e5;
  border-radius: 6px;
  box-sizing: border-box;
  background: #fafafa;
}

.input:focus {
  border-color: #007AFF;
  background: #fff;
}

.input[disabled] {
  background: #f0f0f0;
  color: #999;
}

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 10px 15px;
  padding-bottom: calc(10px + env(safe-area-inset-bottom));
  background: #fff;
  box-shadow: 0 -1px 4px rgba(0, 0, 0, 0.05);
  display: flex;
  gap: 10px;
}

.btn {
  flex: 1;
  height: 44px;
  border-radius: 22px;
  font-size: 16px;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
}

.btn.btn-primary {
  background: linear-gradient(135deg, #007AFF, #0056CC);
  color: #fff;
}

.btn.btn-primary:active {
  opacity: 0.9;
}

.btn.btn-danger {
  background: #fff;
  color: #ff4d4f;
  border: 1px solid #ff4d4f;
}

.btn.btn-danger:active {
  background: #fff5f5;
}
</style>
