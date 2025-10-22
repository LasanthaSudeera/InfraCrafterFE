<template>
  <div 
    class="vpc-node border-4 border-purple-500 bg-purple-50 rounded-lg shadow-lg p-4" 
  >
    <div class="flex items-center justify-between mb-2">
      <div class="text-lg font-bold text-purple-800">🏢 {{ data.label }}</div>
      <div class="text-xs text-purple-600 bg-purple-200 px-2 py-1 rounded">VPC</div>
    </div>
    <div class="text-sm text-purple-700">{{ data.cidr }}</div>
    <div class="text-xs text-purple-500 mt-1">Drop subnets here</div>
    
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
.vpc-node {
  position: relative;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
}
</style>
