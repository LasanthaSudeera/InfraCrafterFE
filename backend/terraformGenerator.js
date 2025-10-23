/**
 * Terraform Code Generator
 * Converts InfraCrafter diagram nodes to Terraform/OpenTofu code
 */

export class TerraformGenerator {
  constructor(data) {
    this.nodes = data.nodes || []
    this.edges = data.edges || []
    this.resources = []
  }

  /**
   * Generate complete Terraform configuration
   */
  generate() {
    const terraform = []
    
    // Add provider configuration
    terraform.push(this.generateProvider())
    terraform.push('')
    
    // Process nodes by type
    const vpcs = this.nodes.filter(n => n.type === 'vpc')
    const subnets = this.nodes.filter(n => n.type === 'subnet')
    const routeTables = this.nodes.filter(n => n.type === 'routetable')
    const igws = this.nodes.filter(n => n.type === 'internetgateway')
    const natgws = this.nodes.filter(n => n.type === 'natgateway')
    const ec2s = this.nodes.filter(n => n.type === 'ec2')
    
    // Generate resources in dependency order
    vpcs.forEach(vpc => {
      terraform.push(this.generateVPC(vpc))
      terraform.push('')
    })
    
    subnets.forEach(subnet => {
      terraform.push(this.generateSubnet(subnet))
      terraform.push('')
    })
    
    routeTables.forEach(rt => {
      terraform.push(this.generateRouteTable(rt))
      terraform.push('')
    })
    
    // Generate route table associations
    subnets.forEach(subnet => {
      if (subnet.data.routeTableId) {
        terraform.push(this.generateRouteTableAssociation(subnet))
        terraform.push('')
      }
    })
    
    igws.forEach(igw => {
      terraform.push(this.generateInternetGateway(igw))
      terraform.push('')
    })
    
    natgws.forEach(nat => {
      terraform.push(this.generateNATGateway(nat))
      terraform.push('')
    })
    
    ec2s.forEach(ec2 => {
      terraform.push(this.generateEC2(ec2))
      terraform.push('')
    })
    
    return terraform.join('\n')
  }

  /**
   * Generate provider configuration
   */
  generateProvider() {
    return `terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "us-east-1"  # Change to your preferred region
}`
  }

  /**
   * Generate VPC resource
   */
  generateVPC(vpc) {
    const resourceName = this.sanitizeName(vpc.data.label || vpc.id)
    const cidr = vpc.data.cidr || '10.0.0.0/16'
    
    return `resource "aws_vpc" "${resourceName}" {
  cidr_block           = "${cidr}"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
${this.generateTags(vpc.data.label)}
  }
}`
  }

  /**
   * Generate Subnet resource
   */
  generateSubnet(subnet) {
    const resourceName = this.sanitizeName(subnet.data.label || subnet.id)
    const cidr = subnet.data.cidr || '10.0.1.0/24'
    const vpcNode = this.nodes.find(n => n.id === subnet.parentNode)
    const vpcResourceName = vpcNode ? this.sanitizeName(vpcNode.data.label || vpcNode.id) : 'vpc'
    
    return `resource "aws_subnet" "${resourceName}" {
  vpc_id            = aws_vpc.${vpcResourceName}.id
  cidr_block        = "${cidr}"
  availability_zone = "us-east-1a"  # Change as needed

  tags = {
${this.generateTags(subnet.data.label)}
  }
}`
  }

  /**
   * Generate Route Table resource
   */
  generateRouteTable(rt) {
    const resourceName = this.sanitizeName(rt.data.label || rt.id)
    const vpcNode = this.nodes.find(n => n.id === rt.parentNode)
    const vpcResourceName = vpcNode ? this.sanitizeName(vpcNode.data.label || vpcNode.id) : 'vpc'
    
    // Find associated IGW or NAT Gateway
    const igw = this.nodes.find(n => n.type === 'internetgateway' && n.parentNode === rt.id)
    const nat = this.nodes.find(n => n.type === 'natgateway' && n.parentNode === rt.id)
    
    let routes = ''
    if (igw) {
      const igwResourceName = this.sanitizeName(igw.data.label || igw.id)
      routes = `
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.${igwResourceName}.id
  }`
    } else if (nat) {
      const natResourceName = this.sanitizeName(nat.data.label || nat.id)
      routes = `
  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.${natResourceName}.id
  }`
    }
    
    return `resource "aws_route_table" "${resourceName}" {
  vpc_id = aws_vpc.${vpcResourceName}.id${routes}

  tags = {
${this.generateTags(rt.data.label)}
  }
}`
  }

  /**
   * Generate Route Table Association
   */
  generateRouteTableAssociation(subnet) {
    const subnetResourceName = this.sanitizeName(subnet.data.label || subnet.id)
    const rtNode = this.nodes.find(n => n.id === subnet.data.routeTableId)
    const rtResourceName = rtNode ? this.sanitizeName(rtNode.data.label || rtNode.id) : 'route_table'
    
    return `resource "aws_route_table_association" "${subnetResourceName}_association" {
  subnet_id      = aws_subnet.${subnetResourceName}.id
  route_table_id = aws_route_table.${rtResourceName}.id
}`
  }

  /**
   * Generate Internet Gateway resource
   */
  generateInternetGateway(igw) {
    const resourceName = this.sanitizeName(igw.data.label || igw.id)
    // Find VPC through route table parent
    const rtNode = this.nodes.find(n => n.id === igw.parentNode)
    const vpcNode = rtNode ? this.nodes.find(n => n.id === rtNode.parentNode) : null
    const vpcResourceName = vpcNode ? this.sanitizeName(vpcNode.data.label || vpcNode.id) : 'vpc'
    
    return `resource "aws_internet_gateway" "${resourceName}" {
  vpc_id = aws_vpc.${vpcResourceName}.id

  tags = {
${this.generateTags(igw.data.label)}
  }
}`
  }

  /**
   * Generate NAT Gateway resource
   */
  generateNATGateway(nat) {
    const resourceName = this.sanitizeName(nat.data.label || nat.id)
    // NAT Gateway needs an EIP and should be in a public subnet
    const eipResourceName = `${resourceName}_eip`
    
    // Find a subnet (preferably public) - for now, use first available subnet
    const subnet = this.nodes.find(n => n.type === 'subnet')
    const subnetResourceName = subnet ? this.sanitizeName(subnet.data.label || subnet.id) : 'subnet'
    
    // Find the IGW for depends_on (if it exists)
    const igw = this.nodes.find(n => n.type === 'internetgateway')
    const dependsOn = igw ? `\n\n  depends_on = [aws_internet_gateway.${this.sanitizeName(igw.data.label || igw.id)}]` : ''
    
    return `resource "aws_eip" "${eipResourceName}" {
  domain = "vpc"

  tags = {
${this.generateTags(`${nat.data.label}_eip`)}
  }
}

resource "aws_nat_gateway" "${resourceName}" {
  allocation_id = aws_eip.${eipResourceName}.id
  subnet_id     = aws_subnet.${subnetResourceName}.id

  tags = {
${this.generateTags(nat.data.label)}
  }${dependsOn}
}`
  }

  /**
   * Generate EC2 Instance resource
   */
  generateEC2(ec2) {
    const resourceName = this.sanitizeName(ec2.data.label || ec2.id)
    const instanceType = ec2.data.instanceType || 't2.micro'
    const subnetNode = this.nodes.find(n => n.id === ec2.parentNode)
    const subnetResourceName = subnetNode ? this.sanitizeName(subnetNode.data.label || subnetNode.id) : 'subnet'
    
    return `resource "aws_instance" "${resourceName}" {
  ami           = "ami-0c55b159cbfafe1f0"  # Amazon Linux 2 (update for your region)
  instance_type = "${instanceType}"
  subnet_id     = aws_subnet.${subnetResourceName}.id

  tags = {
${this.generateTags(ec2.data.label)}
  }
}`
  }

  /**
   * Sanitize name for Terraform resource naming
   */
  sanitizeName(name) {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, '_')
      .replace(/^[0-9]/, 'n_$&')  // Prefix numbers with 'n_'
      .replace(/_+/g, '_')        // Replace multiple underscores with single
      .replace(/^_|_$/g, '')      // Remove leading/trailing underscores
  }

  /**
   * Generate tags with default InfraCrafter tag
   */
  generateTags(name, additionalTags = {}) {
    const tags = {
      Name: name,
      GeneratedBy: 'InfraCrafter.com',
      ...additionalTags
    }
    
    return Object.entries(tags)
      .map(([key, value]) => `    ${key} = "${value}"`)
      .join('\n')
  }
}
