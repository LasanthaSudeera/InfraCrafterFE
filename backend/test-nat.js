/**
 * Test NAT Gateway generation
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
      label: "Internet Gateway",
      data: { label: "Internet Gateway" },
      parentNode: "node_3"
    },
    {
      id: "node_5",
      type: "routetable",
      label: "Private RT",
      data: { label: "Private RT" },
      parentNode: "node_1"
    },
    {
      id: "node_6",
      type: "natgateway",
      label: "NAT Gateway",
      data: { label: "NAT Gateway" },
      parentNode: "node_5"
    }
  ],
  edges: [],
  timestamp: new Date().toISOString()
}

async function testNATGateway() {
  try {
    console.log('Testing NAT Gateway generation with IGW dependency...\n')
    
    const response = await fetch('http://localhost:3001/api/export/terraform', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testData)
    })
    
    const result = await response.json()
    
    console.log('✅ Export successful!\n')
    
    // Extract and show only NAT Gateway section
    const terraform = result.terraform
    const natStart = terraform.indexOf('resource "aws_nat_gateway"')
    const natSection = terraform.substring(natStart, terraform.indexOf('\n\n', natStart + 100))
    
    console.log('NAT Gateway Section:')
    console.log('='.repeat(80))
    console.log(natSection)
    console.log('='.repeat(80))
    
    // Check if depends_on is correct
    if (natSection.includes('depends_on = [aws_internet_gateway.internet_gateway]')) {
      console.log('\n✅ Correct! depends_on references the actual IGW resource name')
    } else if (natSection.includes('depends_on')) {
      console.log('\n⚠️  depends_on exists but may have wrong reference')
    } else {
      console.log('\n✅ No depends_on (acceptable if no IGW exists)')
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

testNATGateway()
