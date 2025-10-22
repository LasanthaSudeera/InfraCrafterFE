<template>
  <div class="igw-node border-2 border-cyan-400 bg-cyan-50 rounded shadow p-3 w-full h-full">
    <div class="flex items-center justify-between mb-1">
      <div class="font-semibold text-cyan-800 text-sm">🌍 {{ data.label }}</div>
    </div>
    <div class="text-xs text-cyan-700 bg-cyan-100 px-2 py-1 rounded inline-block">
      IGW
    </div>
    
    <!-- Resize handles -->
    <ResizeHandle edge="se" :node-id="id" @start-resize="$emit('start-resize', $event)" />
    <ResizeHandle edge="e" :node-id="id" @start-resize="$emit('start-resize', $event)" />
    <ResizeHandle edge="s" :node-id="id" @start-resize="$emit('start-resize', $event)" />
  </div>
</template>

<script setup>
import ResizeHandle from '../ResizeHandle.vue'

defineProps({
  data: Object,
  id: String,
})

defineEmits(['start-resize'])
</script>

<style scoped>
.igw-node {
  position: relative;
}
</style>
