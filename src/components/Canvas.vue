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
import Swal from 'sweetalert2'
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
      
      await Swal.fire({
        icon: 'success',
        title: '🎉 Success!',
        html: `
          <p style="font-size: 16px; margin-bottom: 12px;">
            Your infrastructure code has been generated and downloaded successfully!
          </p>
          <div style="background-color: #f0f9ff; padding: 12px; border-radius: 8px; border-left: 4px solid #3b82f6;">
            <p style="margin: 4px 0; color: #1e40af;"><strong>📊 Total Nodes:</strong> ${result.stats.nodes}</p>
          </div>
        `,
        confirmButtonText: 'Awesome!',
        confirmButtonColor: '#10b981',
        width: '500px'
      })
    }
  } catch (error) {
    console.error('Failed to export Terraform:', error)
    await Swal.fire({
      icon: 'error',
      title: 'Oops! Connection Issue',
      html: `
        <p style="font-size: 16px; margin-bottom: 12px;">
          We couldn't connect to the backend server. Don't worry, it's an easy fix! 😊
        </p>
        <div style="background-color: #fef2f2; padding: 12px; border-radius: 8px; border-left: 4px solid #ef4444; text-align: left;">
          <p style="margin: 4px 0; color: #991b1b;"><strong>Quick fix:</strong></p>
          <p style="margin: 4px 0; color: #991b1b; font-family: monospace; font-size: 14px;">cd backend</p>
          <p style="margin: 4px 0; color: #991b1b; font-family: monospace; font-size: 14px;">npm start</p>
          <p style="margin: 8px 0 4px 0; color: #991b1b; font-size: 14px;">The server should run on <strong>http://localhost:3001</strong></p>
        </div>
      `,
      confirmButtonText: 'Got it!',
      confirmButtonColor: '#3b82f6',
      width: '550px'
    })
  }
}

// Clear canvas
const handleClearCanvas = async () => {
  const result = await Swal.fire({
    icon: 'warning',
    title: 'Clear Canvas?',
    html: `
      <p style="font-size: 16px;">
        Are you sure you want to clear everything? All your nodes and connections will be removed. 🗑️
      </p>
      <p style="font-size: 14px; color: #6b7280; margin-top: 8px;">
        This action cannot be undone!
      </p>
    `,
    showCancelButton: true,
    confirmButtonText: 'Yes, clear it!',
    cancelButtonText: 'No, keep it',
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#6b7280',
    width: '450px'
  })
  
  if (result.isConfirmed) {
    emit('clear-canvas')
    await Swal.fire({
      icon: 'success',
      title: 'Cleared!',
      text: 'Your canvas is now fresh and clean! ✨',
      timer: 2000,
      showConfirmButton: false,
      width: '400px'
    })
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
