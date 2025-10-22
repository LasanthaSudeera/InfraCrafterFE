<template>
  <div
    :class="[
      'resize-handle',
      `resize-${edge}`,
      cursorClass
    ]"
    @mousedown.stop="handleMouseDown"
  ></div>
</template>

<script setup>
import { computed, getCurrentInstance } from 'vue'

const props = defineProps({
  edge: {
    type: String,
    required: true,
    validator: (value) => ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'].includes(value)
  },
  nodeId: String,
})

const emit = defineEmits(['start-resize'])

const cursorClass = computed(() => {
  const cursorMap = {
    'n': 'cursor-ns-resize',
    's': 'cursor-ns-resize',
    'e': 'cursor-ew-resize',
    'w': 'cursor-ew-resize',
    'ne': 'cursor-nesw-resize',
    'nw': 'cursor-nwse-resize',
    'se': 'cursor-nwse-resize',
    'sw': 'cursor-nesw-resize',
  }
  return cursorMap[props.edge]
})

const handleMouseDown = (event) => {
  event.preventDefault()
  event.stopPropagation()
  
  // Get the node element - it's the .vue-flow__node wrapper
  let nodeElement = event.target.closest('.vue-flow__node')
  if (!nodeElement) {
    console.error('Could not find node element')
    return
  }

  // Get the actual custom node element - it's the parent of the resize handle
  const customNodeElement = event.target.parentElement
  
  if (!customNodeElement) {
    console.error('Could not find custom node element')
    return
  }

  // Use offsetWidth/offsetHeight which are the actual DOM dimensions
  const width = customNodeElement.offsetWidth
  const height = customNodeElement.offsetHeight
  
  if (!width || !height) {
    console.error('Invalid dimensions:', { width, height })
    return
  }
  
  emit('start-resize', {
    id: props.nodeId,
    edge: props.edge,
    startX: event.clientX,
    startY: event.clientY,
    startWidth: width,
    startHeight: height,
  })
}
</script>

<style scoped>
.resize-handle {
  position: absolute;
  background: transparent;
  z-index: 10;
}

.resize-handle:hover {
  background: rgba(59, 130, 246, 0.3);
}

/* Edge handles */
.resize-n {
  top: 0;
  left: 8px;
  right: 8px;
  height: 8px;
}

.resize-s {
  bottom: 0;
  left: 8px;
  right: 8px;
  height: 8px;
}

.resize-e {
  right: 0;
  top: 8px;
  bottom: 8px;
  width: 8px;
}

.resize-w {
  left: 0;
  top: 8px;
  bottom: 8px;
  width: 8px;
}

/* Corner handles */
.resize-ne {
  top: 0;
  right: 0;
  width: 12px;
  height: 12px;
}

.resize-nw {
  top: 0;
  left: 0;
  width: 12px;
  height: 12px;
}

.resize-se {
  bottom: 0;
  right: 0;
  width: 12px;
  height: 12px;
}

.resize-sw {
  bottom: 0;
  left: 0;
  width: 12px;
  height: 12px;
}
</style>
