const testData = {
  nodes: [
    { id: "vpc1", type: "vpc", label: "VPC", data: { label: "VPC", cidr: "10.0.0.0/16" }, parentNode: null },
    { id: "subnet1", type: "subnet", label: "Subnet", data: { label: "Subnet", cidr: "10.0.1.0/24" }, parentNode: "vpc1" },
    { id: "rt1", type: "routetable", label: "RT", data: { label: "RT" }, parentNode: "vpc1" },
    { id: "igw1", type: "internetgateway", label: "IGW", data: { label: "IGW" }, parentNode: "rt1" },
    { id: "nat1", type: "natgateway", label: "NAT", data: { label: "NAT" }, parentNode: "rt1" }
  ],
  edges: []
}

fetch('http://localhost:3001/api/export/terraform', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(testData)
})
.then(r => r.json())
.then(result => {
  const tf = result.terraform
  const natIndex = tf.indexOf('resource "aws_nat_gateway"')
  const natEnd = tf.indexOf('\n}', natIndex) + 2
  console.log(tf.substring(natIndex, natEnd))
})
.catch(e => console.error(e))
