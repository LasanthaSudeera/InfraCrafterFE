<template>
  <div 
    :class="[
      'subnet-node border-3 rounded-lg shadow-md p-3 w-full h-full',
      hasRouteTable ? 'border-green-500 bg-green-50' : 'border-blue-400 bg-blue-50'
    ]"
  >
    <div class="flex items-center justify-between mb-2">
      <div :class="hasRouteTable ? 'text-green-800' : 'text-blue-800'" class="font-semibold">
        🌐 {{ data.label }}
      </div>
      <div class="flex gap-1 items-center">
        <div 
          v-if="hasRouteTable"
          class="text-xs text-green-700 bg-green-200 px-2 py-1 rounded font-semibold"
          title="Associated with Route Table"
        >
          ✓ RT
        </div>
        <div :class="hasRouteTable ? 'text-green-600 bg-green-200' : 'text-blue-600 bg-blue-200'" class="text-xs px-2 py-1 rounded">
          Subnet
        </div>
      </div>
    </div>
    <div :class="hasRouteTable ? 'text-green-700' : 'text-blue-700'" class="text-sm">{{ data.cidr }}</div>
    <div :class="hasRouteTable ? 'text-green-500' : 'text-blue-500'" class="text-xs mt-1">Drop EC2 instances here</div>
    
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

// Check if subnet has a route table association
const hasRouteTable = computed(() => {
  return !!props.data.routeTableId
})
</script>

<style scoped>
.subnet-node {
  position: relative;
}
</style>
