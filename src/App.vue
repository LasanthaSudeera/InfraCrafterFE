<template>
  <div class="flex h-screen w-screen bg-gray-100">
    <!-- Toolbox -->
    <Toolbox @dragstart="onDragStart" />

    <!-- Canvas -->
    <Canvas
      :nodes="nodes"
      :edges="edges"
      @drop="onDrop"
      @node-click="onNodeClick"
      @pane-click="onPaneClick"
      @nodes-change="onNodesChange"
      @edges-change="onEdgesChange"
      @node-resize="onNodeResize"
      @export="exportCanvas"
    />

    <!-- Inspector -->
    <Inspector
      :selected-node="selectedNode"
      :all-nodes="nodes"
      @update="updateNode"
      @delete="deleteNode"
      @associate-route-table="associateSubnetWithRouteTable"
      @disassociate-route-table="disassociateSubnetFromRouteTable"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Canvas from './components/Canvas.vue'
import Toolbox from './components/Toolbox.vue'
import Inspector from './components/Inspector.vue'

const nodes = ref([])
const edges = ref([])
const selectedNode = ref(null)
const draggedType = ref(null)
let nodeIdCounter = 0
let routeTableColorIndex = 0

// Color palette for route tables and their associated subnets
const routeTableColors = [
  { border: 'border-green-500', bg: 'bg-green-50', text: 'text-green-800', badge: 'bg-green-200 text-green-700', edge: '#10b981' },
  { border: 'border-blue-500', bg: 'bg-blue-50', text: 'text-blue-800', badge: 'bg-blue-200 text-blue-700', edge: '#3b82f6' },
  { border: 'border-purple-500', bg: 'bg-purple-50', text: 'text-purple-800', badge: 'bg-purple-200 text-purple-700', edge: '#a855f7' },
  { border: 'border-pink-500', bg: 'bg-pink-50', text: 'text-pink-800', badge: 'bg-pink-200 text-pink-700', edge: '#ec4899' },
  { border: 'border-orange-500', bg: 'bg-orange-50', text: 'text-orange-800', badge: 'bg-orange-200 text-orange-700', edge: '#f97316' },
  { border: 'border-cyan-500', bg: 'bg-cyan-50', text: 'text-cyan-800', badge: 'bg-cyan-200 text-cyan-700', edge: '#06b6d4' },
]

// Generate unique ID
const generateId = () => `node_${++nodeIdCounter}`

// Handle drag start from toolbox
const onDragStart = (type) => {
  draggedType.value = type
}

// Handle drop on canvas
const onDrop = (position) => {
  if (!draggedType.value) return

  const newNode = {
    id: generateId(),
    type: draggedType.value.toLowerCase(),
    position,
    data: {
      label: draggedType.value,
      ...getDefaultData(draggedType.value)
    },
    style: {
      width: `${getDefaultWidth(draggedType.value)}px`,
      height: `${getDefaultHeight(draggedType.value)}px`,
    },
    class: 'custom-node',
  }

  // Assign color to route table
  if (draggedType.value === 'RouteTable') {
    const colorIndex = routeTableColorIndex % routeTableColors.length
    newNode.data.colorScheme = routeTableColors[colorIndex]
    routeTableColorIndex++
  }

  // Check for parent containment
  const parent = findParentNode(position, draggedType.value)
  console.log('Looking for parent for', draggedType.value, 'at position', position, 'found:', parent)
  if (parent) {
    newNode.parentNode = parent.id
    newNode.extent = 'parent'
    
    // Helper function to get absolute position recursively
    const getAbsolutePosition = (node) => {
      let x = node.position.x
      let y = node.position.y
      
      if (node.parentNode) {
        const parentNode = nodes.value.find(n => n.id === node.parentNode)
        if (parentNode) {
          const parentPos = getAbsolutePosition(parentNode)
          x += parentPos.x
          y += parentPos.y
        }
      }
      
      return { x, y }
    }
    
    // Get parent's absolute position
    const parentAbsPos = getAbsolutePosition(parent)
    
    // Adjust position to be relative to parent's absolute position
    newNode.position = {
      x: position.x - parentAbsPos.x,
      y: position.y - parentAbsPos.y
    }
    
    console.log('Parent absolute pos:', parentAbsPos, 'New node relative pos:', newNode.position)
  }

  nodes.value.push(newNode)
  draggedType.value = null
}

// Get default data for node type
const getDefaultData = (type) => {
  switch (type) {
    case 'VPC':
      return { cidr: '10.0.0.0/16' }
    case 'Subnet':
      return { cidr: '10.0.1.0/24' }
    case 'EC2':
      return { instanceType: 't2.micro' }
    case 'InternetGateway':
      return {}
    case 'NatGateway':
      return {}
    case 'RouteTable':
      return { routes: [] }
    default:
      return {}
  }
}

// Get default width for node type
const getDefaultWidth = (type) => {
  switch (type) {
    case 'VPC': return 600
    case 'Subnet': return 400
    case 'RouteTable': return 300
    default: return 150
  }
}

// Get default height for node type
const getDefaultHeight = (type) => {
  switch (type) {
    case 'VPC': return 400
    case 'Subnet': return 250
    case 'RouteTable': return 200
    default: return 80
  }
}

// Find parent node based on position and type rules
const findParentNode = (position, type) => {
  console.log('=== findParentNode called ===')
  console.log('Looking for parent for type:', type)
  console.log('Drop position:', position)
  console.log('Total nodes:', nodes.value.length)
  console.log('All nodes:', nodes.value.map(n => ({ id: n.id, type: n.type, label: n.data.label, pos: n.position, parent: n.parentNode })))
  
  // Define containment rules - match draggedType values (before lowercasing)
  const rules = {
    'VPC': null,  // VPC has no parent
    'Subnet': ['vpc'],
    'RouteTable': ['vpc'],
    'EC2': ['subnet'],
    'InternetGateway': ['routetable'],
    'NatGateway': ['routetable'],
  }

  const allowedParents = rules[type]
  console.log('Allowed parent types for', type, ':', allowedParents)
  if (!allowedParents) {
    console.log('No parent needed for', type)
    return null
  }

  // Helper function to get absolute position recursively
  const getAbsolutePosition = (node) => {
    let x = node.position.x
    let y = node.position.y
    
    if (node.parentNode) {
      const parent = nodes.value.find(n => n.id === node.parentNode)
      if (parent) {
        const parentPos = getAbsolutePosition(parent)
        x += parentPos.x
        y += parentPos.y
      }
    }
    
    return { x, y }
  }

  // Check nodes in reverse order (most recently added first)
  for (let i = nodes.value.length - 1; i >= 0; i--) {
    const node = nodes.value[i]
    // Use node.type instead of node.data.label for comparison
    if (!allowedParents.includes(node.type)) {
      console.log('Skipping node', node.type, node.data.label, '(not in allowed parents)')
      continue
    }

    // Get actual node dimensions (may have been resized)
    const nodeWidth = node.style?.width ? parseInt(node.style.width) : getDefaultWidth(node.data.label)
    const nodeHeight = node.style?.height ? parseInt(node.style.height) : getDefaultHeight(node.data.label)
    
    // Get absolute position (nodes with parents have relative positions)
    const absolutePos = getAbsolutePosition(node)
    
    console.log('Checking node:', node.type, node.data.label, {
      relativePos: node.position,
      absolutePos,
      nodeWidth,
      nodeHeight,
      dropPos: position,
      hasParent: !!node.parentNode
    })
    
    if (
      position.x >= absolutePos.x &&
      position.x <= absolutePos.x + nodeWidth &&
      position.y >= absolutePos.y &&
      position.y <= absolutePos.y + nodeHeight
    ) {
      console.log('✓ Found parent:', node.type, node.data.label)
      return node
    }
  }

  console.log('✗ No parent found')
  return null
}

// Get node dimensions for containment check (kept for backwards compatibility, but use getDefaultWidth/Height instead)
const getNodeWidth = (type) => {
  switch (type) {
    case 'vpc': return 600
    case 'subnet': return 400
    case 'routetable': return 300
    default: return 150
  }
}

const getNodeHeight = (type) => {
  switch (type) {
    case 'vpc': return 400
    case 'subnet': return 250
    case 'routetable': return 200
    default: return 80
  }
}

// Handle node click
const onNodeClick = (event) => {
  selectedNode.value = nodes.value.find(n => n.id === event.node.id)
}

// Handle pane click (deselect)
const onPaneClick = () => {
  selectedNode.value = null
}

// Update node data
const updateNode = (updates) => {
  const node = nodes.value.find(n => n.id === selectedNode.value.id)
  if (node) {
    node.data = { ...node.data, ...updates }
    selectedNode.value = { ...selectedNode.value, data: node.data }
  }
}

// Handle node resize from canvas
const onNodeResize = ({ id, width, height }) => {
  const node = nodes.value.find(n => n.id === id)
  if (node) {
    // Update style directly without replacing the entire node
    if (!node.style) {
      node.style = {}
    }
    node.style.width = `${width}px`
    node.style.height = `${height}px`
    
    // Update selected node if it's the one being resized
    if (selectedNode.value?.id === id) {
      selectedNode.value = { ...selectedNode.value, style: { ...node.style } }
    }
  }
}

// Delete node
const deleteNode = () => {
  if (!selectedNode.value) return
  
  // Remove node and its children
  const toRemove = [selectedNode.value.id]
  const findChildren = (parentId) => {
    nodes.value.forEach(n => {
      if (n.parentNode === parentId) {
        toRemove.push(n.id)
        findChildren(n.id)
      }
    })
  }
  findChildren(selectedNode.value.id)
  
  nodes.value = nodes.value.filter(n => !toRemove.includes(n.id))
  edges.value = edges.value.filter(e => !toRemove.includes(e.source) && !toRemove.includes(e.target))
  selectedNode.value = null
}

// Handle nodes change (from vue-flow)
const onNodesChange = (changes) => {
  changes.forEach(change => {
    if (change.type === 'position' && change.position) {
      const node = nodes.value.find(n => n.id === change.id)
      if (node) {
        node.position = change.position
      }
    }
    if (change.type === 'dimensions' && change.dimensions) {
      const node = nodes.value.find(n => n.id === change.id)
      if (node) {
        if (!node.style) node.style = {}
        node.style.width = `${change.dimensions.width}px`
        node.style.height = `${change.dimensions.height}px`
      }
    }
    if (change.type === 'remove') {
      nodes.value = nodes.value.filter(n => n.id !== change.id)
    }
  })
}

// Handle edges change (from vue-flow)
const onEdgesChange = (changes) => {
  changes.forEach(change => {
    if (change.type === 'remove') {
      edges.value = edges.value.filter(e => e.id !== change.id)
    }
  })
}

// Associate subnet with route table
const associateSubnetWithRouteTable = (subnetId, routeTableId) => {
  // Update subnet
  const subnet = nodes.value.find(n => n.id === subnetId)
  const routeTable = nodes.value.find(n => n.id === routeTableId)
  
  if (subnet && routeTable) {
    subnet.data.routeTableId = routeTableId
    // Copy the route table's color scheme to the subnet
    if (routeTable.data.colorScheme) {
      subnet.data.colorScheme = routeTable.data.colorScheme
    }
  }
  
  // Update route table
  if (routeTable) {
    if (!routeTable.data.associatedSubnets) {
      routeTable.data.associatedSubnets = []
    }
    if (!routeTable.data.associatedSubnets.includes(subnetId)) {
      routeTable.data.associatedSubnets.push(subnetId)
    }
  }
  
  // Create or update edge with matching color
  const edgeId = `${subnetId}-${routeTableId}`
  const existingEdge = edges.value.find(e => e.id === edgeId)
  if (!existingEdge) {
    const edgeColor = routeTable?.data?.colorScheme?.edge || '#10b981'
    edges.value.push({
      id: edgeId,
      source: subnetId,
      target: routeTableId,
      animated: true,
      style: { stroke: edgeColor, strokeWidth: 2 },
      label: 'associated',
      labelStyle: { fill: edgeColor, fontWeight: 600, fontSize: '10px' },
      labelBgStyle: { fill: '#ffffff', fillOpacity: 0.8 },
    })
  }
  
  // Update selected node
  if (selectedNode.value?.id === subnetId) {
    selectedNode.value = { ...subnet }
  }
}

// Disassociate subnet from route table
const disassociateSubnetFromRouteTable = (subnetId) => {
  const subnet = nodes.value.find(n => n.id === subnetId)
  if (!subnet || !subnet.data.routeTableId) return
  
  const routeTableId = subnet.data.routeTableId
  
  // Update subnet - remove route table ID and color scheme
  subnet.data.routeTableId = null
  subnet.data.colorScheme = null
  
  // Update route table
  const routeTable = nodes.value.find(n => n.id === routeTableId)
  if (routeTable && routeTable.data.associatedSubnets) {
    routeTable.data.associatedSubnets = routeTable.data.associatedSubnets.filter(id => id !== subnetId)
  }
  
  // Remove edge
  const edgeId = `${subnetId}-${routeTableId}`
  edges.value = edges.value.filter(e => e.id !== edgeId)
  
  // Update selected node
  if (selectedNode.value?.id === subnetId) {
    selectedNode.value = { ...subnet }
  }
}

// Export canvas as PNG
const exportCanvas = () => {
  // This will be handled by Canvas component
}
</script>
