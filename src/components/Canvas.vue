<template>
  <div class="flex-1 relative">
    <!-- Export buttons -->
    <div class="absolute top-4 right-4 z-10 flex gap-2">
      <button
        @click="handleClearCanvas"
        class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded shadow-lg"
        title="Clear all nodes and edges"
      >
        Clear Canvas
      </button>
      <button
        @click="handleExportTerraform"
        class="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded shadow-lg"
      >
        Export Open Tofu/Terraform
      </button>
      <button
        @click="handleExport"
        class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow-lg"
      >
        Export PNG
      </button>
    </div>

    <!-- Vue Flow Canvas -->
    <div
      ref="canvasRef"
      class="w-full h-full"
      @drop="handleDrop"
      @dragover.prevent
    >
      <VueFlow
        ref="vueFlowRef"
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
        :edges-updatable="false"
        :elevate-edges-on-select="false"
        :elevate-nodes-on-select="false"
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

const emit = defineEmits(['drop', 'node-click', 'pane-click', 'nodes-change', 'edges-change', 'node-resize', 'export', 'clear-canvas'])

const canvasRef = ref(null)
const resizing = ref(null) // { id, edge, startX, startY, startWidth, startHeight, zoom }
const vueFlowRef = ref(null)

// Handle drop event
const handleDrop = (event) => {
  event.preventDefault()
  
  // Get VueFlow viewport (zoom and pan)
  const viewport = vueFlowRef.value?.viewport || { x: 0, y: 0, zoom: 1 }
  
  const rect = canvasRef.value.getBoundingClientRect()
  
  // Calculate position in canvas coordinates accounting for zoom and pan
  const x = (event.clientX - rect.left - viewport.x) / viewport.zoom - 75
  const y = (event.clientY - rect.top - viewport.y) / viewport.zoom - 40
  
  const position = { x, y }
  
  console.log('Drop position:', position, 'Viewport:', viewport)
  
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

// Export as Terraform/Tofu JSON
const handleExportTerraform = async () => {
  // Prepare the data to send to the server
  const exportData = {
    nodes: props.nodes.map(node => ({
      id: node.id,
      type: node.type,
      label: node.data.label,
      position: node.position,
      data: node.data,
      parentNode: node.parentNode,
      style: node.style
    })),
    edges: props.edges.map(edge => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      label: edge.label
    })),
    timestamp: new Date().toISOString()
  }

  try {
    console.log('Sending export request to backend...')
    
    // Send to backend server
    const response = await fetch('http://localhost:3001/api/export/terraform', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(exportData)
    })

    if (!response.ok) {
      throw new Error(`Server responded with ${response.status}`)
    }

    const result = await response.json()
    
    console.log('Terraform export successful:', result)
    
    // Download the generated Terraform file
    if (result.terraform) {
      const blob = new Blob([result.terraform], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.download = `infrastructure-${Date.now()}.tf`
      link.href = url
      link.click()
      URL.revokeObjectURL(url)
      
      alert(`✅ Terraform code generated successfully!\n\nStats:\n- Nodes: ${result.stats.nodes}\n- Edges: ${result.stats.edges}\n- Lines: ${result.stats.lines}`)
    }
  } catch (error) {
    console.error('Failed to export Terraform:', error)
    alert('❌ Failed to export Terraform.\n\nPlease ensure the backend server is running:\n\ncd backend\nnpm start\n\nServer should be running on http://localhost:3001')
  }
}

// Clear canvas
const handleClearCanvas = () => {
  if (confirm('Are you sure you want to clear the entire canvas? This will delete all nodes and edges.')) {
    emit('clear-canvas')
  }
}

// Start resize
const startResize = (payload) => {
  // Get current zoom level from VueFlow instance
  const zoom = vueFlowRef.value?.viewport?.zoom || 1
  resizing.value = { ...payload, zoom }
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

    // Get zoom level from when resize started
    const zoom = resizing.value.zoom || 1
    const deltaX = (event.clientX - resizing.value.startX) / zoom
    const deltaY = (event.clientY - resizing.value.startY) / zoom

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
