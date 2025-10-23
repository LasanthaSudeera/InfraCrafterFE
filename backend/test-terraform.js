/**
 * Test script for Terraform generation
 * Run with: node test-terraform.js
 */

const testData = {
  nodes: [
    {
      id: "node_1",
      type: "vpc",
      label: "Main VPC",
      data: { label: "Main VPC", cidr: "10.0.0.0/16" },
      parentNode: null
    },
    {
      id: "node_2",
      type: "subnet",
      label: "Public Subnet",
      data: { label: "Public Subnet", cidr: "10.0.1.0/24" },
      parentNode: "node_1"
    },
    {
      id: "node_3",
      type: "routetable",
      label: "Public RT",
      data: { label: "Public RT" },
      parentNode: "node_1"
    },
    {
      id: "node_4",
      type: "internetgateway",
      label: "IGW",
      data: { label: "IGW" },
      parentNode: "node_3"
    },
    {
      id: "node_5",
      type: "ec2",
      label: "Web Server",
      data: { label: "Web Server", instanceType: "t2.micro" },
      parentNode: "node_2"
    }
  ],
  edges: [],
  timestamp: new Date().toISOString()
}

async function testExport() {
  try {
    console.log('Testing Terraform export...\n')
    
    const response = await fetch('http://localhost:3001/api/export/terraform', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testData)
    })
    
    const result = await response.json()
    
    console.log('✅ Export successful!')
    console.log('\nStats:', result.stats)
    console.log('\n' + '='.repeat(80))
    console.log('GENERATED TERRAFORM CODE:')
    console.log('='.repeat(80) + '\n')
    console.log(result.terraform)
    console.log('\n' + '='.repeat(80))
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
    console.log('\nMake sure the backend server is running:')
    console.log('  cd backend && npm start')
  }
}

testExport()
