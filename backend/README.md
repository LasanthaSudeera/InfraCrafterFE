# InfraCrafter Backend

Backend API for InfraCrafter - Generates Terraform/OpenTofu code from VPC diagrams.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

## API Endpoints

### POST /api/export/terraform

Generates Terraform code from the diagram data.

**Request Body:**
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
  "terraform": "terraform { ... }",
  "timestamp": "2025-10-23T...",
  "stats": {
    "nodes": 5,
    "edges": 3,
    "lines": 120
  }
}
```

## Supported Resources

- VPC
- Subnet
- Route Table
- Route Table Association
- Internet Gateway
- NAT Gateway
- EC2 Instance

## Port

Default: `3001`

Set custom port: `PORT=3002 npm start`
