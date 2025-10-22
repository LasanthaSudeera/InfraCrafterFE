# InfraCrafter - AWS VPC Diagram Builder

A visual AWS VPC diagram builder built with Vue 3, Vite, and TailwindCSS.

## Features

- 🎨 **Visual Canvas**: Drag and drop AWS components onto a zoomable/pannable canvas
- 🏗️ **AWS Components**: VPC, Subnet, EC2, Route Table, Internet Gateway, NAT Gateway
- 📦 **Containment Logic**: Drop Subnets in VPCs, EC2 in Subnets, IGW/NAT in Route Tables
- ✏️ **Live Editing**: Select and edit node properties (labels, CIDR blocks, instance types)
- 📸 **Export**: Download your diagram as PNG
- 🎯 **Client-Side Only**: No backend required

## Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## Usage

1. **Drag** components from the left toolbox
2. **Drop** them on the canvas
3. **Nest** components (Subnet in VPC, EC2 in Subnet)
4. **Click** a node to edit its properties in the right panel
5. **Export** your diagram using the "Export PNG" button

## Tech Stack

- Vue 3 (Composition API)
- Vite
- TailwindCSS
- @vue-flow/core (canvas/diagramming)
- html-to-image (PNG export)

## Project Structure

```
src/
├── App.vue                          # Main app component
├── main.js                          # Entry point
├── style.css                        # Global styles + Tailwind
├── components/
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
