<template>
  <div class="flex-1 relative">
    <!-- Export button -->
    <button
      @click="handleExport"
      class="absolute top-4 right-4 z-10 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow-lg"
    >
      Export PNG
    </button>

    <!-- Vue Flow Canvas -->
    <div
      ref="canvasRef"
      class="w-full h-full"
      @drop="handleDrop"
      @dragover.prevent
    >
      <VueFlow
        :nodes="nodes"
        :edges="edges"
        @node-click="$emit('node-click', $event)"
        @pane-click="$emit('pane-click')"
        @nodes-change="$emit('nodes-change', $event)"
        @edges-change="$emit('edges-change', $event)"
        :default-zoom="1"
        :min-zoom="0.2"
        :max-zoom="4"
        :node-extent="[[0, 0], [5000, 5000]]"
        :fit-view-on-init="false"
      >
        <Background pattern-color="#aaa" :gap="16" />
        <Controls />

        <!-- Custom node templates -->
        <template #node-vpc="{ data, id }">
          <VpcNode :data="data" :id="id" @start-resize="startResize" />
        </template>

        <template #node-subnet="{ data, id }">
          <SubnetNode :data="data" :id="id" @start-resize="startResize" />
        </template>

        <template #node-ec2="{ data, id }">
          <Ec2Node :data="data" :id="id" @start-resize="startResize" />
        </template>

        <template #node-internetgateway="{ data, id }">
          <InternetGatewayNode :data="data" :id="id" @start-resize="startResize" />
        </template>

        <template #node-natgateway="{ data, id }">
          <NatGatewayNode :data="data" :id="id" @start-resize="startResize" />
        </template>

        <template #node-routetable="{ data, id }">
          <RouteTableNode :data="data" :id="id" @start-resize="startResize" />
        </template>
      </VueFlow>
    </div>
    
    <!-- Global resize overlay -->
    <div
      v-if="resizing"
      class="fixed inset-0 z-50"
      :style="{ cursor: getCursor(resizing.edge) }"
      @mousemove.prevent="handleResize"
      @mouseup.prevent="stopResize"
    ></div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { VueFlow } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'
import { toPng } from 'html-to-image'
import VpcNode from './nodes/VpcNode.vue'
import SubnetNode from './nodes/SubnetNode.vue'
import Ec2Node from './nodes/Ec2Node.vue'
import InternetGatewayNode from './nodes/InternetGatewayNode.vue'
import NatGatewayNode from './nodes/NatGatewayNode.vue'
import RouteTableNode from './nodes/RouteTableNode.vue'

import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'

const props = defineProps({
  nodes: Array,
  edges: Array,
})

const emit = defineEmits(['drop', 'node-click', 'pane-click', 'nodes-change', 'edges-change', 'node-resize', 'export'])

const canvasRef = ref(null)
const resizing = ref(null) // { id, edge, startX, startY, startWidth, startHeight }

// Handle drop event
const handleDrop = (event) => {
  event.preventDefault()
  
  const rect = canvasRef.value.getBoundingClientRect()
  const position = {
    x: event.clientX - rect.left - 75, // center the node
    y: event.clientY - rect.top - 40,
  }
  
  emit('drop', position)
}

// Export canvas as PNG
const handleExport = async () => {
  const vueFlowElement = canvasRef.value.querySelector('.vue-flow')
  if (!vueFlowElement) return

  try {
    const dataUrl = await toPng(vueFlowElement, {
      backgroundColor: '#f3f4f6',
      cacheBust: true,
    })
    
    const link = document.createElement('a')
    link.download = `vpc-diagram-${Date.now()}.png`
    link.href = dataUrl
    link.click()
  } catch (error) {
    console.error('Failed to export:', error)
  }
}

// Start resize
const startResize = (payload) => {
  console.log('Start resize:', payload)
  resizing.value = payload
  document.body.style.cursor = getCursor(payload.edge)
}

// Get cursor style for edge
const getCursor = (edge) => {
  const cursorMap = {
    'n': 'ns-resize',
    's': 'ns-resize',
    'e': 'ew-resize',
    'w': 'ew-resize',
    'ne': 'nesw-resize',
    'nw': 'nwse-resize',
    'se': 'nwse-resize',
    'sw': 'nesw-resize',
  }
  return cursorMap[edge] || 'default'
}

// Handle resize during mouse move
let resizeAnimationFrame = null
const handleResize = (event) => {
  if (!resizing.value) return

  // Cancel previous frame if exists
  if (resizeAnimationFrame) {
    cancelAnimationFrame(resizeAnimationFrame)
  }

  // Throttle using requestAnimationFrame
  resizeAnimationFrame = requestAnimationFrame(() => {
    if (!resizing.value) return

    const deltaX = event.clientX - resizing.value.startX
    const deltaY = event.clientY - resizing.value.startY

    let newWidth = resizing.value.startWidth
    let newHeight = resizing.value.startHeight

    const edge = resizing.value.edge

    if (edge.includes('e')) {
      newWidth = Math.max(100, resizing.value.startWidth + deltaX)
    }
    if (edge.includes('w')) {
      newWidth = Math.max(100, resizing.value.startWidth - deltaX)
    }
    if (edge.includes('s')) {
      newHeight = Math.max(80, resizing.value.startHeight + deltaY)
    }
    if (edge.includes('n')) {
      newHeight = Math.max(80, resizing.value.startHeight - deltaY)
    }

    emit('node-resize', {
      id: resizing.value.id,
      width: Math.round(newWidth),
      height: Math.round(newHeight),
    })
    
    resizeAnimationFrame = null
  })
}

// Stop resize
const stopResize = () => {
  if (resizeAnimationFrame) {
    cancelAnimationFrame(resizeAnimationFrame)
    resizeAnimationFrame = null
  }
  document.body.style.cursor = 'default'
  resizing.value = null
}
</script>
