<template>
  <div class="w-64 bg-white border-r border-gray-300 shadow-lg p-4 overflow-y-auto">
    <h2 class="text-xl font-bold mb-4 text-gray-800">AWS Components</h2>
    
    <div class="space-y-3">
      <!-- VPC -->
      <div
        draggable="true"
        @dragstart="onDragStart('VPC')"
        class="p-3 bg-purple-100 border-2 border-purple-400 rounded cursor-move hover:bg-purple-200 transition"
      >
        <div class="font-semibold text-purple-800">🏢 VPC</div>
        <div class="text-xs text-purple-600">Virtual Private Cloud</div>
      </div>

      <!-- Subnet -->
      <div
        draggable="true"
        @dragstart="onDragStart('Subnet')"
        class="p-3 bg-blue-100 border-2 border-blue-400 rounded cursor-move hover:bg-blue-200 transition"
      >
        <div class="font-semibold text-blue-800">🌐 Subnet</div>
        <div class="text-xs text-blue-600">Network Subnet</div>
      </div>

      <!-- EC2 -->
      <div
        draggable="true"
        @dragstart="onDragStart('EC2')"
        class="p-3 bg-orange-100 border-2 border-orange-400 rounded cursor-move hover:bg-orange-200 transition"
      >
        <div class="font-semibold text-orange-800">💻 EC2</div>
        <div class="text-xs text-orange-600">EC2 Instance</div>
      </div>

      <!-- Route Table -->
      <div
        draggable="true"
        @dragstart="onDragStart('RouteTable')"
        class="p-3 bg-green-100 border-2 border-green-400 rounded cursor-move hover:bg-green-200 transition"
      >
        <div class="font-semibold text-green-800">🗺️ Route Table</div>
        <div class="text-xs text-green-600">Routing Table</div>
      </div>

      <!-- Internet Gateway -->
      <div
        draggable="true"
        @dragstart="onDragStart('InternetGateway')"
        class="p-3 bg-cyan-100 border-2 border-cyan-400 rounded cursor-move hover:bg-cyan-200 transition"
      >
        <div class="font-semibold text-cyan-800">🌍 Internet Gateway</div>
        <div class="text-xs text-cyan-600">IGW</div>
      </div>

      <!-- NAT Gateway -->
      <div
        draggable="true"
        @dragstart="onDragStart('NatGateway')"
        class="p-3 bg-teal-100 border-2 border-teal-400 rounded cursor-move hover:bg-teal-200 transition"
      >
        <div class="font-semibold text-teal-800">🔒 NAT Gateway</div>
        <div class="text-xs text-teal-600">NAT GW</div>
      </div>
    </div>

    <!-- Instructions -->
    <div class="mt-6 p-3 bg-gray-50 border border-gray-300 rounded text-xs text-gray-600">
      <p class="font-semibold mb-2">💡 How to use:</p>
      <ul class="list-disc list-inside space-y-1">
        <li>Drag components to canvas</li>
        <li>Drop Subnet inside VPC</li>
        <li>Drop EC2 inside Subnet</li>
        <li>Drop IGW/NAT in Route Table</li>
        <li>Click to select & edit</li>
      </ul>
    </div>
  </div>
</template>

<script setup>
const emit = defineEmits(['dragstart'])

const onDragStart = (type) => {
  emit('dragstart', type)
}
</script>
