# InfraCrafter - Complete Setup Guide

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd InfraCrafter
```

2. **Install Frontend Dependencies**
```bash
npm install
```

3. **Install Backend Dependencies**
```bash
cd backend
npm install
cd ..
```

## 🏃 Running the Application

You need to run both the frontend and backend simultaneously.

### Option 1: Two Terminals (Recommended)

**Terminal 1 - Frontend:**
```bash
npm run dev
```
Frontend will run on: `http://localhost:5173`

**Terminal 2 - Backend:**
```bash
cd backend
npm start
```
Backend API will run on: `http://localhost:3001`

### Option 2: Single Terminal (Background)

```bash
# Start backend in background
cd backend && npm start &

# Start frontend
cd .. && npm run dev
```

## 📖 User Guide

### Creating Your Infrastructure Diagram

1. **Add a VPC**
   - Drag the VPC component from the toolbox
   - Drop it anywhere on the canvas
   - Edit CIDR block in the right panel (default: 10.0.0.0/16)

2. **Add Subnets**
   - Drag Subnet components
   - Drop them **inside the VPC** (auto-containment)
   - CIDR blocks are auto-generated (10.0.0.0/24, 10.0.1.0/24, etc.)
   - Edit properties in the right panel

3. **Add Route Tables**
   - Drag Route Table components
   - Drop them **inside the VPC**
   - Associate subnets with route tables using the dropdown

4. **Add Internet Gateway**
   - Drag Internet Gateway component
   - Drop it **inside a Route Table**
   - Automatically creates a route to 0.0.0.0/0

5. **Add NAT Gateway**
   - Drag NAT Gateway component
   - Drop it **inside a Route Table**
   - Automatically provisions an Elastic IP

6. **Add EC2 Instances**
   - Drag EC2 components
   - Drop them **inside Subnets**
   - Select instance type from dropdown (t2.micro, t3.small, etc.)

### Editing Nodes

1. **Click** any node to select it
2. **Right panel** shows editable properties:
   - Label
   - CIDR Block (VPC/Subnet)
   - Instance Type (EC2)
   - Route Table Association (Subnet)
3. Changes are **immediately** reflected on the canvas
4. All changes are **auto-saved** to localStorage

### Resizing Nodes

1. **Click and drag** the corner/edge handles
2. Resize in **8 directions**: N, S, E, W, NE, NW, SE, SW
3. Works at **any zoom level**
4. Dimensions shown in the right panel

### Color-Coded Route Tables

- When you associate a subnet with a route table, both get a **matching color**
- 6 unique color schemes available
- Easy visual identification of routing relationships

## 📤 Exporting

### Export as PNG

1. Click **"Export PNG"** button (top-right, blue)
2. High-quality diagram image is downloaded
3. Filename: `vpc-diagram-{timestamp}.png`

### Export as Terraform

1. Click **"Export Open Tofu/Terraform"** button (top-right, purple)
2. Backend generates production-ready `.tf` code
3. Downloads as: `infrastructure-{timestamp}.tf`
4. Ready to use with `terraform apply`

**Generated Terraform includes:**
- VPC with DNS support
- Subnets with availability zones
- Route Tables with routes
- Route Table Associations
- Internet Gateways
- NAT Gateways with Elastic IPs
- EC2 Instances with AMIs

## 💾 Persistence

- Your work is **automatically saved** to browser localStorage
- Survives page refreshes and browser restarts
- Click **"Clear Canvas"** to reset (with confirmation)

## 🔧 Troubleshooting

### "Failed to export Terraform" error

**Problem:** Frontend can't connect to backend

**Solution:**
```bash
# Make sure backend is running
cd backend
npm start

# Should see:
# 🚀 InfraCrafter Backend running on http://localhost:3001
```

### Nodes not nesting properly

**Problem:** Components not auto-contained

**Solution:** 
- Make sure to drop components **inside** their parents
- VPC → Subnet/Route Table
- Subnet → EC2
- Route Table → IGW/NAT

### Port already in use

**Backend (3001):**
```bash
# Find and kill process using port 3001
lsof -ti:3001 | xargs kill -9

# Or change port
PORT=3002 npm start
```

**Frontend (5173):**
```bash
# Vite will auto-increment to 5174, 5175, etc.
# Or specify in vite.config.js
```

## 🧪 Testing

### Test Backend API

```bash
cd backend
node test-terraform.js
```

This sends a sample diagram and prints the generated Terraform code.

### Test Frontend

```bash
npm run dev
```

Open browser, create a simple VPC → Subnet → EC2 diagram, and export.

## 📝 Example Workflow

1. Start both frontend and backend
2. Create a VPC (10.0.0.0/16)
3. Add two subnets:
   - Public Subnet (10.0.1.0/24)
   - Private Subnet (10.0.2.0/24)
4. Add Public Route Table
5. Add Internet Gateway to Public RT
6. Associate Public Subnet with Public RT
7. Add EC2 instance to Public Subnet
8. Export as Terraform
9. Review generated `.tf` file
10. Run `terraform init && terraform apply`

## 🛠️ Development

### Frontend Hot Reload

Changes to Vue components are automatically reloaded.

### Backend Hot Reload

```bash
cd backend
npm run dev  # Uses --watch flag
```

Changes to server code automatically restart the server.

## 🌐 API Documentation

### POST /api/export/terraform

**Endpoint:** `http://localhost:3001/api/export/terraform`

**Request:**
```json
{
  "nodes": [...],
  "edges": [...],
  "timestamp": "2025-10-23T..."
}
```

**Response:**
```json
{
  "success": true,
  "terraform": "terraform {\n  ...",
  "timestamp": "2025-10-23T...",
  "stats": {
    "nodes": 5,
    "edges": 2,
    "lines": 87
  }
}
```

## 📦 Build for Production

### Frontend

```bash
npm run build
```

Output in `dist/` directory. Deploy to any static hosting (Netlify, Vercel, S3, etc.).

### Backend

```bash
cd backend
npm start
```

Deploy to any Node.js hosting (Railway, Render, AWS EC2, etc.).

## 🔐 Security Notes

- Backend has CORS enabled for development
- For production, configure CORS to only allow your frontend domain
- Validate and sanitize all inputs
- Add rate limiting for the export endpoint
- Consider adding authentication if needed

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - See LICENSE file for details
