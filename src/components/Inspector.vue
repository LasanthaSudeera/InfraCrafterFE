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

      <!-- Route Table Association (for Subnets) -->
      <div v-if="selectedNode.type === 'subnet'">
        <label class="block text-sm font-medium text-gray-700 mb-1">Route Table</label>
        <select
          :value="selectedNode.data.routeTableId || ''"
          @change="handleRouteTableChange($event.target.value)"
          class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">No Route Table</option>
          <option 
            v-for="rt in routeTables" 
            :key="rt.id" 
            :value="rt.id"
          >
            {{ rt.data.label }}
          </option>
        </select>
        <div v-if="selectedNode.data.routeTableId" class="mt-1 text-xs text-green-600">
          ✓ Associated with Route Table
        </div>
      </div>

      <!-- Associated Subnets (for Route Tables) -->
      <div v-if="selectedNode.type === 'routetable' && associatedSubnets.length > 0">
        <label class="block text-sm font-medium text-gray-700 mb-1">Associated Subnets</label>
        <div class="text-sm space-y-1">
          <div 
            v-for="subnet in associatedSubnets" 
            :key="subnet.id"
            class="px-2 py-1 bg-green-50 text-green-700 rounded border border-green-200"
          >
            {{ subnet.data.label }}
          </div>
        </div>
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
  allNodes: Array,
})

const emit = defineEmits(['update', 'delete', 'associate-route-table', 'disassociate-route-table'])

const updateField = (field, value) => {
  emit('update', { [field]: value })
}

// Get all route tables in the same VPC
const routeTables = computed(() => {
  if (!props.selectedNode || props.selectedNode.type !== 'subnet') return []
  if (!props.allNodes) return []
  
  const parentVpcId = props.selectedNode.parentNode
  if (!parentVpcId) return []
  
  return props.allNodes.filter(node => 
    node.type === 'routetable' && node.parentNode === parentVpcId
  )
})

// Get subnets associated with this route table
const associatedSubnets = computed(() => {
  if (!props.selectedNode || props.selectedNode.type !== 'routetable') return []
  if (!props.allNodes) return []
  
  const associatedIds = props.selectedNode.data.associatedSubnets || []
  return props.allNodes.filter(node => associatedIds.includes(node.id))
})

// Handle route table association change
const handleRouteTableChange = (routeTableId) => {
  if (routeTableId) {
    emit('associate-route-table', props.selectedNode.id, routeTableId)
  } else {
    emit('disassociate-route-table', props.selectedNode.id)
  }
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
