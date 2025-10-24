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
      @clear-canvas="clearCanvas"
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
import { ref, watch, onMounted } from 'vue'
import Swal from 'sweetalert2'
import Canvas from './components/Canvas.vue'
import Toolbox from './components/Toolbox.vue'
import Inspector from './components/Inspector.vue'

const nodes = ref([])
const edges = ref([])
const selectedNode = ref(null)
const draggedType = ref(null)
let nodeIdCounter = 0
let routeTableColorIndex = 0

const STORAGE_KEY = 'infracrafter-canvas-state'

// Color palette for route tables and their associated subnets
const routeTableColors = [
  { border: 'border-green-500', bg: 'bg-green-50', text: 'text-green-800', badge: 'bg-green-200 text-green-700', edge: '#10b981' },
  { border: 'border-blue-500', bg: 'bg-blue-50', text: 'text-blue-800', badge: 'bg-blue-200 text-blue-700', edge: '#3b82f6' },
  { border: 'border-purple-500', bg: 'bg-purple-50', text: 'text-purple-800', badge: 'bg-purple-200 text-purple-700', edge: '#a855f7' },
  { border: 'border-pink-500', bg: 'bg-pink-50', text: 'text-pink-800', badge: 'bg-pink-200 text-pink-700', edge: '#ec4899' },
  { border: 'border-orange-500', bg: 'bg-orange-50', text: 'text-orange-800', badge: 'bg-orange-200 text-orange-700', edge: '#f97316' },
  { border: 'border-cyan-500', bg: 'bg-cyan-50', text: 'text-cyan-800', badge: 'bg-cyan-200 text-cyan-700', edge: '#06b6d4' },
]

// Load state from localStorage
const loadState = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const state = JSON.parse(saved)
      nodes.value = state.nodes || []
      edges.value = state.edges || []
      nodeIdCounter = state.nodeIdCounter || 0
      routeTableColorIndex = state.routeTableColorIndex || 0
      console.log('Loaded state from localStorage:', state)
    }
  } catch (error) {
    console.error('Failed to load state from localStorage:', error)
  }
}

// Save state to localStorage
const saveState = () => {
  try {
    const state = {
      nodes: nodes.value,
      edges: edges.value,
      nodeIdCounter,
      routeTableColorIndex,
      timestamp: new Date().toISOString()
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch (error) {
    console.error('Failed to save state to localStorage:', error)
  }
}

// Watch for changes and save to localStorage
watch([nodes, edges], () => {
  saveState()
}, { deep: true })

// Show welcome message
const showWelcomeMessage = async () => {
  const hasSeenWelcome = localStorage.getItem('infracrafter-welcome-seen')
  
  if (!hasSeenWelcome) {
    await Swal.fire({
      imageUrl: '/logo.png',
      imageWidth: 200,
      imageHeight: 200,
      imageAlt: 'InfraCrafter Logo',
      title: 'Welcome to InfraCrafter! 🎉',
      html: `
        <div style="text-align: left; padding: 0 20px;">
          <p style="font-size: 16px; margin-bottom: 16px; text-align: center;">
            We're excited to have you here! 🚀
          </p>
          
          <div style="background-color: #fff3cd; padding: 12px; border-radius: 8px; margin-bottom: 16px; border-left: 4px solid #ffc107; text-align: center;">
            <p style="margin: 0; color: #856404; font-size: 14px; font-weight: 600;">
              ⚠️ Currently in <strong>Alpha Stage</strong> - Expect updates and improvements!
            </p>
          </div>
          
          <div style="background-color: #f0f9ff; padding: 16px; border-radius: 8px; margin-bottom: 16px; border-left: 4px solid #3b82f6;">
            <p style="margin: 8px 0; color: #1e40af; font-size: 15px;">
              ✨ <strong>Free Forever</strong> - No hidden costs, no subscriptions
            </p>
            <p style="margin: 8px 0; color: #1e40af; font-size: 15px;">
              🌟 <strong>Soon Open Source</strong> - Join our community on GitHub
            </p>
            <p style="margin: 8px 0; color: #1e40af; font-size: 15px;">
              🚀 <strong>More Modules Coming</strong> - Security Groups, Load Balancers, RDS, and more!
            </p>
          </div>
          
          <p style="font-size: 14px; color: #6b7280; text-align: center; margin-top: 16px;">
            Start building your AWS infrastructure visually and export production-ready Open Tofu | Terraform code instantly!
          </p>
        </div>
      `,
      confirmButtonText: 'Let\'s Get Started! 🎨',
      confirmButtonColor: '#10b981',
      width: '600px',
      backdrop: true,
      allowOutsideClick: true
    })
    
    localStorage.setItem('infracrafter-welcome-seen', 'true')
  }
}

// Load state on mount
onMounted(() => {
  loadState()
  showWelcomeMessage()
})

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
  
  // Auto-generate subnet CIDR if dropping into VPC
  if (draggedType.value === 'Subnet' && parent && parent.type === 'vpc') {
    const nextCidr = getNextSubnetCidr(parent)
    if (nextCidr) {
      newNode.data.cidr = nextCidr
    }
  }
  
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
  }

  nodes.value = [...nodes.value, newNode]
  
  // Don't create automatic edges - only show association edges
  
  draggedType.value = null
}

// Get next available subnet CIDR for a VPC
const getNextSubnetCidr = (vpcNode) => {
  try {
    // Parse VPC CIDR (e.g., "10.0.0.0/16")
    const vpcCidr = vpcNode.data.cidr
    const [vpcIp, vpcPrefix] = vpcCidr.split('/')
    const vpcPrefixNum = parseInt(vpcPrefix)
    
    // Get all existing subnets in this VPC
    const existingSubnets = nodes.value.filter(n => 
      n.type === 'subnet' && n.parentNode === vpcNode.id
    )
    
    // Parse VPC base IP (e.g., "10.0" from "10.0.0.0/16")
    const vpcParts = vpcIp.split('.')
    const vpcBase = `${vpcParts[0]}.${vpcParts[1]}`
    
    // Subnet will be /24, so we increment the third octet
    // Start from the next available third octet
    let thirdOctet = 0
    
    // Find the highest third octet used
    existingSubnets.forEach(subnet => {
      const subnetCidr = subnet.data.cidr
      if (subnetCidr) {
        const [subnetIp] = subnetCidr.split('/')
        const subnetParts = subnetIp.split('.')
        const subnetThirdOctet = parseInt(subnetParts[2])
        if (subnetThirdOctet >= thirdOctet) {
          thirdOctet = subnetThirdOctet + 1
        }
      }
    })
    
    // Generate next CIDR (e.g., "10.0.1.0/24", "10.0.2.0/24", etc.)
    return `${vpcBase}.${thirdOctet}.0/24`
  } catch (error) {
    console.error('Error generating subnet CIDR:', error)
    return '10.0.1.0/24' // fallback
  }
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
  console.log('=== Finding parent for', type, 'at position', position)
  
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
  console.log('Allowed parent types:', allowedParents)
  
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
      continue
    }

    // Get actual node dimensions (may have been resized)
    const nodeWidth = node.style?.width ? parseInt(node.style.width) : getDefaultWidth(node.data.label)
    const nodeHeight = node.style?.height ? parseInt(node.style.height) : getDefaultHeight(node.data.label)
    
    // Get absolute position (nodes with parents have relative positions)
    const absolutePos = getAbsolutePosition(node)
    
    console.log('Checking node:', node.data.label, {
      type: node.type,
      absolutePos,
      width: nodeWidth,
      height: nodeHeight,
      dropPos: position,
      inBounds: {
        x: position.x >= absolutePos.x && position.x <= absolutePos.x + nodeWidth,
        y: position.y >= absolutePos.y && position.y <= absolutePos.y + nodeHeight
      }
    })
    
    if (
      position.x >= absolutePos.x &&
      position.x <= absolutePos.x + nodeWidth &&
      position.y >= absolutePos.y &&
      position.y <= absolutePos.y + nodeHeight
    ) {
      console.log('✓ Found parent:', node.data.label)
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
  const nodeIndex = nodes.value.findIndex(n => n.id === selectedNode.value.id)
  if (nodeIndex !== -1) {
    const node = nodes.value[nodeIndex]
    // Create new node object with updated data
    const updatedNode = {
      ...node,
      data: { ...node.data, ...updates }
    }
    
    // Create new array with updated node to trigger reactivity
    nodes.value = [
      ...nodes.value.slice(0, nodeIndex),
      updatedNode,
      ...nodes.value.slice(nodeIndex + 1)
    ]
    
    // Update selected node to reflect changes in inspector
    selectedNode.value = { ...updatedNode }
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

// Clear entire canvas
const clearCanvas = () => {
  nodes.value = []
  edges.value = []
  selectedNode.value = null
  nodeIdCounter = 0
  routeTableColorIndex = 0
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
    const newEdge = {
      id: edgeId,
      source: subnetId,
      target: routeTableId,
      type: 'smoothstep',
      animated: true,
      style: { stroke: edgeColor, strokeWidth: 4, strokeOpacity: 1 },
      label: 'associated',
      labelStyle: { fill: edgeColor, fontWeight: 700, fontSize: 14 },
      labelBgStyle: { fill: '#ffffff', fillOpacity: 1, padding: 6 },
      markerEnd: {
        type: 'arrowclosed',
        width: 25,
        height: 25,
        color: edgeColor,
      },
      zIndex: 1000,
    }
    console.log('Creating edge:', newEdge)
    edges.value.push(newEdge)
    console.log('Total edges after creation:', edges.value.length)
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
