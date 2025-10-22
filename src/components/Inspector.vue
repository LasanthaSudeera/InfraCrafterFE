<template>
  <div class="w-80 bg-white border-l border-gray-300 shadow-lg p-4 overflow-y-auto">
    <h2 class="text-xl font-bold mb-4 text-gray-800">Properties</h2>

    <div v-if="!selectedNode" class="text-gray-500 text-sm">
      Select a node to edit its properties
    </div>

    <div v-else class="space-y-4">
      <!-- Node Type Badge -->
      <div class="p-2 bg-gray-100 rounded text-center font-semibold text-gray-700">
        {{ selectedNode.data.label }}
      </div>

      <!-- Label -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Label</label>
        <input
          type="text"
          :value="selectedNode.data.label"
          @input="updateField('label', $event.target.value)"
          class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <!-- CIDR (for VPC/Subnet) -->
      <div v-if="selectedNode.data.cidr !== undefined">
        <label class="block text-sm font-medium text-gray-700 mb-1">CIDR Block</label>
        <input
          type="text"
          :value="selectedNode.data.cidr"
          @input="updateField('cidr', $event.target.value)"
          class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="10.0.0.0/16"
        />
      </div>

      <!-- Instance Type (for EC2) -->
      <div v-if="selectedNode.data.instanceType !== undefined">
        <label class="block text-sm font-medium text-gray-700 mb-1">Instance Type</label>
        <select
          :value="selectedNode.data.instanceType"
          @change="updateField('instanceType', $event.target.value)"
          class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="t2.micro">t2.micro</option>
          <option value="t2.small">t2.small</option>
          <option value="t2.medium">t2.medium</option>
          <option value="t3.micro">t3.micro</option>
          <option value="t3.small">t3.small</option>
          <option value="t3.medium">t3.medium</option>
          <option value="m5.large">m5.large</option>
          <option value="m5.xlarge">m5.xlarge</option>
        </select>
      </div>

      <!-- Node ID (read-only) -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Node ID</label>
        <input
          type="text"
          :value="selectedNode.id"
          disabled
          class="w-full px-3 py-2 border border-gray-300 rounded bg-gray-50 text-gray-500"
        />
      </div>

      <!-- Parent (if any) -->
      <div v-if="selectedNode.parentNode">
        <label class="block text-sm font-medium text-gray-700 mb-1">Parent Node</label>
        <input
          type="text"
          :value="selectedNode.parentNode"
          disabled
          class="w-full px-3 py-2 border border-gray-300 rounded bg-gray-50 text-gray-500"
        />
      </div>

      <!-- Size Display -->
      <div class="border-t pt-4 mt-4">
        <h3 class="text-sm font-semibold text-gray-700 mb-2">Size</h3>
        <div class="text-sm text-gray-600">
          <div>Width: {{ currentWidth }}px</div>
          <div>Height: {{ currentHeight }}px</div>
          <div class="text-xs text-gray-500 mt-2">💡 Drag edges to resize</div>
        </div>
      </div>

      <!-- Delete Button -->
      <button
        @click="$emit('delete')"
        class="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded transition"
      >
        Delete Node
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  selectedNode: Object,
})

const emit = defineEmits(['update', 'delete'])

const updateField = (field, value) => {
  emit('update', { [field]: value })
}

// Get current dimensions
const currentWidth = computed(() => {
  if (!props.selectedNode?.style?.width) return 150
  const width = props.selectedNode.style.width
  return typeof width === 'number' ? width : parseInt(width)
})

const currentHeight = computed(() => {
  if (!props.selectedNode?.style?.height) return 80
  const height = props.selectedNode.style.height
  return typeof height === 'number' ? height : parseInt(height)
})
</script>
