<template>
  <div class="subnet-node border-3 border-blue-400 bg-blue-50 rounded-lg shadow-md p-3 w-full h-full">
    <div class="flex items-center justify-between mb-2">
      <div class="font-semibold text-blue-800">🌐 {{ data.label }}</div>
      <div class="text-xs text-blue-600 bg-blue-200 px-2 py-1 rounded">Subnet</div>
    </div>
    <div class="text-sm text-blue-700">{{ data.cidr }}</div>
    <div class="text-xs text-blue-500 mt-1">Drop EC2 instances here</div>
    
    <!-- Resize handles -->
    <ResizeHandle edge="n" :node-id="id" @start-resize="$emit('start-resize', $event)" />
    <ResizeHandle edge="s" :node-id="id" @start-resize="$emit('start-resize', $event)" />
    <ResizeHandle edge="e" :node-id="id" @start-resize="$emit('start-resize', $event)" />
    <ResizeHandle edge="w" :node-id="id" @start-resize="$emit('start-resize', $event)" />
    <ResizeHandle edge="ne" :node-id="id" @start-resize="$emit('start-resize', $event)" />
    <ResizeHandle edge="nw" :node-id="id" @start-resize="$emit('start-resize', $event)" />
    <ResizeHandle edge="se" :node-id="id" @start-resize="$emit('start-resize', $event)" />
    <ResizeHandle edge="sw" :node-id="id" @start-resize="$emit('start-resize', $event)" />
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
.subnet-node {
  position: relative;
}
</style>
