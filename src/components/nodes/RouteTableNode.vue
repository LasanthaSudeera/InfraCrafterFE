<template>
  <div 
    :class="[
      'rt-node border-3 rounded-lg shadow-md p-3 w-full h-full',
      colorScheme.border,
      colorScheme.bg
    ]"
  >
    <div class="flex items-center justify-between mb-2">
      <div :class="colorScheme.text" class="font-semibold">
        🗺️ {{ data.label }}
      </div>
      <div class="flex gap-1 items-center">
        <div 
          v-if="hasAssociations"
          :class="colorScheme.badge"
          class="text-xs px-2 py-1 rounded font-semibold"
          :title="`${associationCount} subnet(s) associated`"
        >
          🔗 {{ associationCount }}
        </div>
        <div 
          :class="colorScheme.badge" 
          class="text-xs px-2 py-1 rounded"
        >
          Route Table
        </div>
      </div>
    </div>
    <div :class="colorScheme.text" class="text-xs mt-1 opacity-70">
      Drop IGW or NAT Gateway here
    </div>
    
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
import { computed } from 'vue'
import ResizeHandle from '../ResizeHandle.vue'

const props = defineProps({
  data: Object,
  id: String,
})

defineEmits(['start-resize'])

// Check if route table has associations
const hasAssociations = computed(() => {
  return props.data.associatedSubnets && props.data.associatedSubnets.length > 0
})

const associationCount = computed(() => {
  return props.data.associatedSubnets?.length || 0
})

// Get color scheme (should be set when route table is created)
const colorScheme = computed(() => {
  return props.data.colorScheme || {
    border: 'border-amber-400',
    bg: 'bg-amber-50',
    text: 'text-amber-800',
    badge: 'bg-amber-200 text-amber-600',
  }
})
</script>

<style scoped>
.rt-node {
  position: relative;
}
</style>
