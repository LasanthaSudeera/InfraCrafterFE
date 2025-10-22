<template>
  <div class="nat-node border-2 border-teal-400 bg-teal-50 rounded shadow p-3 w-full h-full">
    <div class="flex items-center justify-between mb-1">
      <div class="font-semibold text-teal-800 text-sm">🔒 {{ data.label }}</div>
    </div>
    <div class="text-xs text-teal-700 bg-teal-100 px-2 py-1 rounded inline-block">
      NAT GW
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
.nat-node {
  position: relative;
}
</style>
