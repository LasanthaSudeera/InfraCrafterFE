<template>
  <div 
    :class="[
      'subnet-node border-3 rounded-lg shadow-md p-3 w-full h-full',
      colorScheme.border,
      colorScheme.bg
    ]"
  >
    <div class="flex items-center justify-between mb-2">
      <div :class="colorScheme.text" class="font-semibold">
        🌐 {{ data.label }}
      </div>
      <div class="flex gap-1 items-center">
        <div 
          v-if="hasRouteTable"
          :class="colorScheme.badge"
          class="text-xs px-2 py-1 rounded font-semibold"
          title="Associated with Route Table"
        >
          ✓ RT
        </div>
        <div :class="colorScheme.badge" class="text-xs px-2 py-1 rounded">
          Subnet
        </div>
      </div>
    </div>
    <div :class="colorScheme.text" class="text-sm">{{ data.cidr }}</div>
    <div :class="colorScheme.text" class="text-xs mt-1 opacity-70">Drop EC2 instances here</div>
    
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

// Default color scheme for unassociated subnets
const defaultColorScheme = {
  border: 'border-blue-400',
  bg: 'bg-blue-50',
  text: 'text-blue-800',
  badge: 'bg-blue-200 text-blue-600',
}

// Check if subnet has a route table association
const hasRouteTable = computed(() => {
  return !!props.data.routeTableId
})

// Get color scheme (from route table association or default)
const colorScheme = computed(() => {
  return props.data.colorScheme || defaultColorScheme
})
</script>

<style scoped>
.subnet-node {
  position: relative;
}
</style>
