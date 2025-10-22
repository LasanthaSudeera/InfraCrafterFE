<template>
  <div class="ec2-node border-2 border-orange-400 bg-orange-50 rounded shadow p-3 w-full h-full">
    <div class="flex items-center justify-between mb-1">
      <div class="font-semibold text-orange-800 text-sm">💻 {{ data.label }}</div>
    </div>
    <div class="text-xs text-orange-700 bg-orange-100 px-2 py-1 rounded inline-block">
      {{ data.instanceType }}
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
.ec2-node {
  position: relative;
}
</style>
