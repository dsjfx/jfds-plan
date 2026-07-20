<template>
  <div class="text-container" ref="wrapperRef">
    <!-- 主文字显示 -->
    <div class="text-content" @click="openDialogHandle" @mouseenter="handleMouseEnter" @mouseleave="handleMouseLeave"
      ref="textRef">
      <!-- <span class="text-display">{{ displayText }}</span> -->
      <el-icon v-if="remark" class="remark-icon" :class="{ 'has-remark': remark }">
        <Edit />
      </el-icon>
      <el-icon v-else class="remark-icon" :class="{ 'no-remark': !remark }">
        <Plus />
      </el-icon>
    </div>

    <!-- 自定义Tooltip -->
    <Transition name="tooltip-fade">
      <div v-if="showTooltip && remark" class="custom-tooltip" :style="tooltipStyle">
        <div class="tooltip-content">
          <span class="tooltip-text">{{ remark }}</span>
          <span class="tooltip-arrow"></span>
        </div>
      </div>
    </Transition>

    <!-- 自定义对话框 -->
    <Transition name="dialog-slide">
      <div v-if="dialogVisible" class="dialog-overlay" @click.self="handleDialogClose">
        <div class="dialog-panel" :style="dialogStyle" ref="dialogRef">
          <!-- <div class="dialog-header">
            <span class="dialog-title">
              <i class="el-icon-edit"></i>
              编辑备注
            </span>
            <i class="el-icon-close close-btn" @click="handleDialogClose"></i>
          </div> -->

          <div class="dialog-body">
            <!-- <div v-if="remark" class="remark-info">
              <span class="label">当前备注：</span>
              <span class="current-remark">{{ remark }}</span>
            </div> -->

            <textarea ref="textareaRef" v-model="editRemark" placeholder="请输入备注内容..." rows="4" maxlength="150"
              class="remark-textarea" @keydown.ctrl.enter="handleSave"></textarea>

            <div class="dialog-footer-actions">
              <span class="char-count">{{ editRemark.length }}/200</span>
              <div class="action-buttons">
                <button class="btn-cancel" @click="handleDialogClose">取消</button>
                <button class="btn-save" @click="handleSave" :disabled="saving">
                  {{ saving ? '保存中...' : '保存备注' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted, CSSProperties } from 'vue'

// ============ Types ============
export interface RemarkData {
  id: number
  content?: string
}

export interface RemarkEmits {
  (e: 'update:modelValue', value: string): void
  (e: 'save', data: RemarkData): Promise<boolean> | boolean | void
  (e: 'open', data: RemarkData): void
  (e: 'close', data: RemarkData): void
}

export interface RemarkExpose {
  setRemark: (content: string) => void
  getRemark: () => string
  openEditor: () => void
  closeEditor: () => void
  refresh: () => void
}

// ============ Props ============
interface Props {
  id: number
  content: string
  modelValue?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: ''
})

// ============ Emits ============
const emit = defineEmits<RemarkEmits>()

// ============ Refs ============
const wrapperRef = ref<HTMLElement | null>(null)
const textRef = ref<HTMLElement | null>(null)
const dialogRef = ref<HTMLElement | null>(null)
const textareaRef = ref<HTMLTextAreaElement | null>(null)

// ============ State ============
const remark = ref<string>(props.modelValue)
const editRemark = ref<string>('')
const dialogVisible = ref<boolean>(false)
const showTooltip = ref<boolean>(false)
const saving = ref<boolean>(false)
const tooltipTimer = ref<number | null>(null)

// ============ Computed ============
const displayText = computed<string>(() => {
  return props.content
})

// interface Position {
//   top: number
//   left: number
// }

// Tooltip样式
const tooltipStyle = computed<CSSProperties>(() => {
  if (!textRef.value) return {}

  const rect: DOMRect = textRef.value.getBoundingClientRect()
  return {
    position: 'fixed',
    top: `${rect.bottom + 8}px`,
    left: `${rect.left}px`,
    zIndex: '999'
  }
})

// Dialog样式 - 紧贴文字下方
const dialogStyle = computed<CSSProperties>(() => {
  if (!textRef.value) return {}

  const rect: DOMRect = textRef.value.getBoundingClientRect()
  const dialogWidth = 320
  let left = rect.left

  // 防止溢出右边界
  if (left + dialogWidth > window.innerWidth - 20) {
    left = window.innerWidth - dialogWidth - 20
  }
  // 防止溢出左边界
  if (left < 20) {
    left = 20
  }

  return {
    position: 'fixed',
    top: `${rect.bottom + 8}px`,
    left: `${left}px`,
    width: `${dialogWidth}px`,
    zIndex: '1000'
  }
})

// ============ Watch ============
watch(() => props.modelValue, (newVal: string) => {
  remark.value = newVal
})

watch(remark, (newVal: string) => {
  emit('update:modelValue', newVal)
})

// ============ Methods ============
// 鼠标悬停
const handleMouseEnter = (): void => {
  clearTimeout(tooltipTimer.value as number)
  tooltipTimer.value = window.setTimeout(() => {
    showTooltip.value = true
  }, 300)
}

const handleMouseLeave = (): void => {
  clearTimeout(tooltipTimer.value as number)
  tooltipTimer.value = window.setTimeout(() => {
    showTooltip.value = false
  }, 200)
}

// 打开编辑器
const openDialogHandle = (): void => {
  editRemark.value = remark.value
  dialogVisible.value = true
  showTooltip.value = false

  emit('open', {
    id: props.id,
    content: remark.value
  })

  // 自动聚焦
  nextTick(() => {
    if (textareaRef.value) {
      textareaRef.value.focus()
    }
  })
}

// 保存备注
const handleSave = async (): Promise<void> => {
  if (saving.value) return

  // 验证
  if (editRemark.value.length > 200) {
    // 可以在这里添加提示
    return
  }

  saving.value = true

  try {
    // 触发保存事件，由父组件处理实际保存逻辑
    const result = emit('save', {
      id: props.id,
      content: editRemark.value
    })

    // 如果保存成功，更新本地数据
    if (result !== false) {
      remark.value = editRemark.value
      dialogVisible.value = false
    }
  } catch (error) {
    console.error('保存失败:', error)
  } finally {
    saving.value = false
  }
}

// 关闭对话框
const handleDialogClose = (): void => {
  // 如果有修改，提示是否放弃
  if (editRemark.value !== remark.value && editRemark.value !== '') {
    // 可以在这里添加确认对话框
    dialogVisible.value = false
    editRemark.value = remark.value
  } else {
    dialogVisible.value = false
    editRemark.value = remark.value
  }

  emit('close', {
    id: props.id
  })
}

// 点击外部关闭
const handleClickOutside = (event: MouseEvent): void => {
  if (!dialogVisible.value) return
  if (!wrapperRef.value) return

  const target = event.target as HTMLElement

  // 检查点击是否在对话框内部
  if (dialogRef.value && !dialogRef.value.contains(target)) {
    // 检查点击是否在文字元素上（避免点击文字时关闭又打开）
    if (textRef.value && textRef.value.contains(target)) {
      return
    }
    handleDialogClose()
  }
}

// 键盘事件 - ESC关闭
const handleKeydown = (event: KeyboardEvent): void => {
  if (event.key === 'Escape' && dialogVisible.value) {
    handleDialogClose()
  }
}

// 窗口大小变化时重新计算位置
const handleResize = (): void => {
  if (dialogVisible.value) {
    // 重新计算位置会触发响应式更新
  }
}

// ============ Expose ============
defineExpose<RemarkExpose>({
  setRemark: (content: string) => {
    remark.value = content
  },
  getRemark: () => remark.value,
  openEditor: openDialogHandle,
  closeEditor: handleDialogClose,
  refresh: () => {
    emit('update:modelValue', remark.value)
  }
})

// ============ Lifecycle ============
onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside)
  document.addEventListener('keydown', handleKeydown)
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  document.removeEventListener('mousedown', handleClickOutside)
  document.removeEventListener('keydown', handleKeydown)
  window.removeEventListener('resize', handleResize)

  if (tooltipTimer.value) {
    clearTimeout(tooltipTimer.value)
  }
})
</script>

<style lang="scss" scoped>
// ============ Variables ============
$primary-color: #409eff;
$primary-hover: #66b1ff;
$success-color: #67c23a;
$warning-color: #e6a23c;
$danger-color: #f56c6c;

$text-primary: #303133;
$text-regular: #606266;
$text-secondary: #028181;
$text-placeholder: #c0c4cc;

$border-base: #dcdfe6;
$border-light: #e4e7ed;
$border-lighter: #f0f0f0;

$bg-base: #f5f7fa;
$bg-hover: #ecf5ff;
$bg-active: #fafafa;
$bg-white: #ffffff;

$shadow-base: 0 2px 12px rgba(0, 0, 0, 0.15);
$shadow-hover: 0 4px 12px rgba(64, 158, 255, 0.15);
$shadow-dialog: 0 8px 40px rgba(0, 0, 0, 0.15);

$radius-sm: 4px;
$radius-base: 6px;
$radius-lg: 8px;
$radius-xl: 12px;

$transition-base: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
$transition-bounce: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);

// ============ Mixins ============
@mixin flex-center {
  display: flex;
  align-items: center;
}

@mixin flex-between {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

@mixin text-ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@mixin hover-effect {
  transition: $transition-base;

  &:hover {
    transform: translateY(-1px);
    box-shadow: $shadow-hover;
  }
}

@mixin focus-ring($color: $primary-color) {
  &:focus {
    outline: none;
    border-color: $color;
    box-shadow: 0 0 0 3px rgba($color, 0.1);
  }
}

// ============ Animations ============
@keyframes overlayFade {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

@keyframes dialogSlideIn {
  from {
    opacity: 0;
    transform: translateY(-12px) scale(0.95);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes dialogSlideOut {
  from {
    opacity: 1;
    transform: translateY(0) scale(1);
  }

  to {
    opacity: 0;
    transform: translateY(-12px) scale(0.95);
  }
}

@keyframes infoSlideIn {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }

  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes tooltipFadeIn {
  from {
    opacity: 0;
    transform: translateY(-8px) scale(0.95);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes tooltipFadeOut {
  from {
    opacity: 1;
    transform: translateY(0) scale(1);
  }

  to {
    opacity: 0;
    transform: translateY(-4px) scale(0.95);
  }
}

// ============ Styles ============
.text-container {
  display: inline-block;
  position: relative;

  // ===== 文字内容 =====
  .text-content {
    position: relative;
    display: inline-flex;
    align-items: center;
    padding: 5px;
    gap: 6px;
    // background: $bg-base;
    // border: 1px solid $border-base;
    // border-radius: $radius-base;
    cursor: pointer;
    transition: $transition-base;
    user-select: none;

    @include hover-effect;

    &:active {
      transform: scale(0.98);
    }

    .text-display {
      color: $text-regular;
      font-size: 14px;
      transition: color 0.3s;
    }

    &:hover .text-display {
      color: $primary-color;
    }

    .remark-icon {
      font-size: 14px;
      transition: $transition-base;

      &.has-remark {
        color: $success-color;

        &:hover {
          transform: rotate(90deg) scale(1.1);
        }
      }

      &.no-remark {
        color: $text-secondary;

        &:hover {
          transform: scale(1.2);
          color: $primary-color;
        }
      }
    }
  }

  // ===== Tooltip =====
  .custom-tooltip {
    position: fixed;
    pointer-events: none;

    .tooltip-content {
      background: $text-secondary;
      color: $bg-white;
      padding: 8px 12px;
      border-radius: $radius-sm;
      font-size: 14px;
      max-width: 300px;
      word-wrap: break-word;
      position: relative;
      box-shadow: $shadow-base;

      .tooltip-text {
        line-height: 1.6;
      }

      .tooltip-arrow {
        position: absolute;
        top: -6px;
        left: 20px;
        width: 0;
        height: 0;
        border-left: 6px solid transparent;
        border-right: 6px solid transparent;
        border-bottom: 6px solid $text-primary;
      }
    }
  }

  // ===== Tooltip 过渡 =====
  .tooltip-fade-enter-active {
    animation: tooltipFadeIn 0.25s $transition-base;
  }

  .tooltip-fade-leave-active {
    animation: tooltipFadeOut 0.2s $transition-base;
  }

  // ===== Dialog =====
  .dialog-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 999;
    background: rgba(0, 0, 0, 0.2);
    animation: overlayFade 0.25s ease;

    .dialog-panel {
      background: $bg-white;
      border-radius: $radius-xl;
      box-shadow: $shadow-dialog;
      overflow: hidden;
      animation: dialogSlideIn 0.3s $transition-bounce;

      // 对话框头部
      .dialog-header {
        @include flex-between;
        padding: 16px 20px;
        border-bottom: 1px solid $border-lighter;
        background: $bg-active;

        .dialog-title {
          font-size: 15px;
          font-weight: 600;
          color: $text-primary;
          @include flex-center;
          gap: 8px;

          i {
            color: $primary-color;
          }
        }

        .close-btn {
          font-size: 18px;
          color: $text-secondary;
          cursor: pointer;
          transition: $transition-base;
          padding: 4px;
          border-radius: $radius-sm;

          &:hover {
            color: $danger-color;
            background: #fef0f0;
            transform: rotate(90deg);
          }
        }
      }

      // 对话框主体
      .dialog-body {
        padding: 20px;

        .remark-info {
          margin-bottom: 16px;
          padding: 10px 12px;
          background: #f0f9eb;
          border-radius: $radius-base;
          border-left: 3px solid $success-color;
          animation: infoSlideIn 0.3s ease;

          .label {
            color: $text-secondary;
            font-size: 13px;
            margin-right: 8px;
          }

          .current-remark {
            color: $text-primary;
            font-size: 14px;
            font-weight: 500;
            word-break: break-all;
          }
        }

        .remark-textarea {
          width: 100%;
          padding: 10px 12px;
          border: 1.5px solid $border-base;
          border-radius: $radius-base;
          font-size: 14px;
          font-family: inherit;
          resize: vertical;
          box-sizing: border-box;
          transition: $transition-base;
          line-height: 1.6;
          min-height: 120px;

          @include focus-ring;

          &::placeholder {
            color: $text-placeholder;
          }
        }

        .dialog-footer-actions {
          @include flex-between;
          margin-top: 12px;

          .char-count {
            color: $text-secondary;
            font-size: 12px;
          }

          .action-buttons {
            display: flex;
            gap: 8px;

            button {
              padding: 8px 20px;
              border: none;
              border-radius: $radius-base;
              font-size: 14px;
              cursor: pointer;
              transition: $transition-base;
              font-weight: 500;

              &.btn-cancel {
                background: $bg-base;
                color: $text-regular;

                &:hover {
                  background: $border-light;
                }
              }

              &.btn-save {
                background: $primary-color;
                color: $bg-white;
                padding: 8px 24px;

                &:hover:not(:disabled) {
                  background: $primary-hover;
                  transform: translateY(-1px);
                  box-shadow: 0 4px 12px rgba($primary-color, 0.3);
                }

                &:active:not(:disabled) {
                  transform: scale(0.98);
                }

                &:disabled {
                  opacity: 0.6;
                  cursor: not-allowed;
                }
              }
            }
          }
        }
      }
    }
  }

  // ===== Dialog 过渡 =====
  .dialog-slide-enter-active {
    animation: dialogSlideIn 0.3s $transition-bounce;
  }

  .dialog-slide-leave-active {
    animation: dialogSlideOut 0.2s $transition-base;
  }
}

// ============ 响应式 ============
@media (max-width: 768px) {
  .text-container {
    .dialog-overlay .dialog-panel {
      width: calc(100vw - 32px) !important;
      left: 16px !important;
      max-height: 80vh;

      .dialog-body .remark-textarea {
        min-height: 100px;
      }
    }
  }
}
</style>