# InfraCrafter - AWS VPC Diagram Builder

A visual AWS VPC diagram builder with Terraform/OpenTofu code generation, built with Vue 3, Vite, and TailwindCSS.

## Features

- 🎨 **Visual Canvas**: Drag and drop AWS components onto a zoomable/pannable canvas
- 🏗️ **AWS Components**: VPC, Subnet, EC2, Route Table, Internet Gateway, NAT Gateway
- 📦 **Containment Logic**: Drop Subnets in VPCs, EC2 in Subnets, IGW/NAT in Route Tables
- 🔗 **Route Table Associations**: Associate subnets with route tables using color-coded visual indicators
- ↔️ **Windows-Style Resize**: Resize nodes with 8-direction handles (zoom-invariant)
- ✏️ **Live Editing**: Select and edit node properties (labels, CIDR blocks, instance types)
- � **Auto CIDR**: Automatically generate subnet CIDR blocks based on VPC
- 💾 **Persistence**: Auto-save to localStorage - your work is never lost!
- �📸 **Export PNG**: Download your diagram as a high-quality PNG image
- 🚀 **Terraform Export**: Generate production-ready Terraform/OpenTofu code
- 🎯 **Full Stack**: Node.js backend for infrastructure code generation

## Quick Start

### Frontend

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

The frontend will be available at `http://localhost:5173`

### Backend

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Start the server
npm start
```

The backend API will be running on `http://localhost:3001`

### Running Both

Open two terminal windows:

**Terminal 1 (Frontend):**
```bash
npm run dev
```

**Terminal 2 (Backend):**
```bash
cd backend
npm start
```

## Usage

1. **Drag** components from the left toolbox
2. **Drop** them on the canvas (components will auto-nest based on drop position)
3. **Resize** nodes by dragging the corner/edge handles
4. **Click** a node to edit its properties in the right panel
5. **Associate** subnets with route tables via the dropdown (color-coded)
6. **Export PNG** - Download your diagram as an image
7. **Export Terraform** - Generate and download `.tf` infrastructure code
8. **Clear Canvas** - Reset everything (with confirmation)

## Containment Rules

- **VPC** → Can contain Subnets and Route Tables
- **Subnet** → Must be inside a VPC, can contain EC2 instances
- **Route Table** → Must be inside a VPC, can contain Internet Gateway and NAT Gateway
- **EC2** → Must be inside a Subnet
- **Internet Gateway** → Must be inside a Route Table
- **NAT Gateway** → Must be inside a Route Table

## Tech Stack

### Frontend
- Vue 3 (Composition API)
- Vite
- TailwindCSS
- @vue-flow/core (canvas/diagramming)
- html-to-image (PNG export)

### Backend
- Node.js
- Express
- CORS

## Project Structure

```
InfraCrafter/
├── src/                             # Frontend source code
│   ├── App.vue                      # Main app component
│   ├── main.js                      # Entry point
│   ├── style.css                    # Global styles + Tailwind
│   └── components/
│       ├── Canvas.vue               # VueFlow canvas wrapper
│       ├── Toolbox.vue              # Draggable component toolbox
│       ├── Inspector.vue            # Property editor panel
│       ├── ResizeHandle.vue         # 8-direction resize handles
│       └── nodes/                   # Custom node components
│           ├── VpcNode.vue
│           ├── SubnetNode.vue
│           ├── Ec2Node.vue
│           ├── RouteTableNode.vue
│           ├── InternetGatewayNode.vue
│           └── NatGatewayNode.vue
├── backend/                         # Backend API
│   ├── server.js                    # Express server
│   ├── terraformGenerator.js       # Terraform code generator
│   ├── package.json
│   └── README.md
├── package.json
└── README.md
│   ├── Canvas.vue                   # Vue Flow canvas wrapper
│   ├── Toolbox.vue                  # Draggable component palette
│   ├── Inspector.vue                # Properties panel
│   └── nodes/
│       ├── VpcNode.vue              # VPC node component
│       ├── SubnetNode.vue           # Subnet node component
│       ├── Ec2Node.vue              # EC2 node component
│       ├── RouteTableNode.vue       # Route Table node component
│       ├── InternetGatewayNode.vue  # IGW node component
│       └── NatGatewayNode.vue       # NAT Gateway node component
```

## License

MIT
