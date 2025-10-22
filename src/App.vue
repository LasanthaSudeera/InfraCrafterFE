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

  // Check for parent containment
  const parent = findParentNode(position, draggedType.value)
  if (parent) {
    newNode.parentNode = parent.id
    newNode.extent = 'parent'
    // Adjust position to be relative to parent
    newNode.position = {
      x: position.x - parent.position.x,
      y: position.y - parent.position.y
    }
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
  // Define containment rules
  const rules = {
    'Subnet': ['VPC'],
    'RouteTable': ['VPC'],
    'EC2': ['Subnet'],
    'InternetGateway': ['RouteTable'],
    'NatGateway': ['RouteTable'],
  }

  const allowedParents = rules[type]
  if (!allowedParents) return null

  // Check nodes in reverse order (top nodes first)
  for (let i = nodes.value.length - 1; i >= 0; i--) {
    const node = nodes.value[i]
    if (!allowedParents.includes(node.data.label)) continue

    // Get actual node dimensions (may have been resized)
    const nodeWidth = node.style?.width ? parseInt(node.style.width) : getDefaultWidth(node.data.label)
    const nodeHeight = node.style?.height ? parseInt(node.style.height) : getDefaultHeight(node.data.label)
    
    if (
      position.x >= node.position.x &&
      position.x <= node.position.x + nodeWidth &&
      position.y >= node.position.y &&
      position.y <= node.position.y + nodeHeight
    ) {
      return node
    }
  }

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
  console.log('onNodeResize called:', { id, width, height })
  const nodeIndex = nodes.value.findIndex(n => n.id === id)
  if (nodeIndex !== -1) {
    const node = nodes.value[nodeIndex]
    console.log('Found node at index', nodeIndex, 'current style:', node.style)
    
    // Create new node object with updated style
    const updatedNode = {
      ...node,
      style: {
        width: `${width}px`,
        height: `${height}px`,
      },
      // Force Vue Flow to re-render by changing a property
      data: { ...node.data }
    }
    
    console.log('Updated node style:', updatedNode.style)
    
    // Replace the node in the array to trigger reactivity
    nodes.value[nodeIndex] = updatedNode
    
    // Force a full array update
    nodes.value = [...nodes.value]
    
    // Update selected node if it's the one being resized
    if (selectedNode.value?.id === id) {
      selectedNode.value = updatedNode
    }
  } else {
    console.error('Node not found:', id)
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
  if (subnet) {
    subnet.data.routeTableId = routeTableId
  }
  
  // Update route table
  const routeTable = nodes.value.find(n => n.id === routeTableId)
  if (routeTable) {
    if (!routeTable.data.associatedSubnets) {
      routeTable.data.associatedSubnets = []
    }
    if (!routeTable.data.associatedSubnets.includes(subnetId)) {
      routeTable.data.associatedSubnets.push(subnetId)
    }
  }
  
  // Create or update edge
  const edgeId = `${subnetId}-${routeTableId}`
  const existingEdge = edges.value.find(e => e.id === edgeId)
  if (!existingEdge) {
    edges.value.push({
      id: edgeId,
      source: subnetId,
      target: routeTableId,
      animated: true,
      style: { stroke: '#10b981', strokeWidth: 2 },
      label: 'associated',
      labelStyle: { fill: '#10b981', fontWeight: 600, fontSize: '10px' },
      labelBgStyle: { fill: '#ecfdf5' },
    })
  }
  
  // Trigger reactivity
  nodes.value = [...nodes.value]
  edges.value = [...edges.value]
  
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
  
  // Update subnet
  subnet.data.routeTableId = null
  
  // Update route table
  const routeTable = nodes.value.find(n => n.id === routeTableId)
  if (routeTable && routeTable.data.associatedSubnets) {
    routeTable.data.associatedSubnets = routeTable.data.associatedSubnets.filter(id => id !== subnetId)
  }
  
  // Remove edge
  const edgeId = `${subnetId}-${routeTableId}`
  edges.value = edges.value.filter(e => e.id !== edgeId)
  
  // Trigger reactivity
  nodes.value = [...nodes.value]
  
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
