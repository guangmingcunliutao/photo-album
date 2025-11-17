import { ref } from 'vue'

export const useLongPressAndClick = (
  onTrigger: () => void,
  longPressDuration = 2000
) => {
  const longPressTimer = ref<number | null>(null)
  const isLongPressing = ref(false)
  const hasLongPressed = ref(false)
  const longPressStartTime = ref<number | null>(null)

  const handleTouchStart = () => {
    hasLongPressed.value = false
    isLongPressing.value = true
    longPressStartTime.value = Date.now()

    longPressTimer.value = window.setTimeout(() => {
      // 长按完成，标记为已长按
      hasLongPressed.value = true
      isLongPressing.value = false
      // 可以在这里添加视觉反馈，比如震动
      if (navigator.vibrate) {
        navigator.vibrate(50)
      }
    }, longPressDuration)
  }

  const handleTouchEnd = () => {
    const now = Date.now()

    if (longPressTimer.value) {
      clearTimeout(longPressTimer.value)
      longPressTimer.value = null
    }

    // 如果已经长按过（长按完成），并且现在释放（相当于点击），触发回调
    if (hasLongPressed.value && longPressStartTime.value) {
      const timeSinceLongPress = now - (longPressStartTime.value + longPressDuration)
      // 在长按完成后的1秒内点击，都算有效
      if (timeSinceLongPress < 1000) {
        onTrigger()
        hasLongPressed.value = false
        longPressStartTime.value = null
      }
    }

    isLongPressing.value = false
  }

  const handleTouchCancel = () => {
    if (longPressTimer.value) {
      clearTimeout(longPressTimer.value)
      longPressTimer.value = null
    }
    isLongPressing.value = false
    hasLongPressed.value = false
    longPressStartTime.value = null
  }

  return {
    handleTouchStart,
    handleTouchEnd,
    handleTouchCancel,
    isLongPressing,
    hasLongPressed,
  }
}

