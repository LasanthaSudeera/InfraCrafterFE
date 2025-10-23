import express from 'express'
import cors from 'cors'
import { TerraformGenerator } from './terraformGenerator.js'

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors())
app.use(express.json())

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'InfraCrafter Backend is running' })
})

// Export Terraform endpoint
app.post('/api/export/terraform', (req, res) => {
  try {
    const data = req.body
    
    console.log('Received export request')
    console.log('Nodes:', data.nodes?.length || 0)
    console.log('Edges:', data.edges?.length || 0)
    
    // Validate input
    if (!data.nodes || !Array.isArray(data.nodes)) {
      return res.status(400).json({ 
        error: 'Invalid input: nodes array is required' 
      })
    }
    
    // Generate Terraform code
    const generator = new TerraformGenerator(data)
    const terraformCode = generator.generate()
    
    console.log('Terraform code generated successfully')
    
    // Return the generated code
    res.json({
      success: true,
      terraform: terraformCode,
      timestamp: new Date().toISOString(),
      stats: {
        nodes: data.nodes.length,
        edges: data.edges?.length || 0,
        lines: terraformCode.split('\n').length
      }
    })
  } catch (error) {
    console.error('Error generating Terraform code:', error)
    res.status(500).json({ 
      error: 'Failed to generate Terraform code',
      message: error.message 
    })
  }
})

// Start server
app.listen(PORT, () => {
  console.log(`🚀 InfraCrafter Backend running on http://localhost:${PORT}`)
  console.log(`📡 Terraform export endpoint: http://localhost:${PORT}/api/export/terraform`)
})
