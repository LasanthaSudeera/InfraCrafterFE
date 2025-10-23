# AI CONTEXT FILE - InfraCrafter Project
**Purpose:** This file provides complete project context for AI assistants to understand the codebase, history, and continue development seamlessly.

## CRITICAL INFORMATION FOR AI

### Project State
- **Type:** Visual AWS VPC diagram builder → Terraform/OpenTofu code generator
- **Status:** Fully functional, in active development
- **Tech:** Vue 3 + VueFlow + Node.js/Express
- **Ports:** Frontend: 5174, Backend: 3001
- **Branch:** Implementation

### Tech Stack (What you're working with)
**Frontend:**
- Vue 3 Composition API (ref, watch, computed)
- VueFlow (node-based canvas library)
- Vite (build tool)
- TailwindCSS (styling)
- SweetAlert2 (dialogs)
- html-to-image (PNG export)
- localStorage (persistence)

**Backend:**
- Node.js + Express
- Custom Terraform generator
- CORS enabled for localhost:5174

### File Map (Where to make changes)
```
/src/App.vue                    # State management, node logic, containment rules, localStorage
/src/components/Canvas.vue      # VueFlow wrapper, drop handling, export, resize
/src/components/Inspector.vue   # Property editor (right sidebar)
/src/components/ResizeHandle.vue # 8-direction resize handles
/src/components/nodes/*.vue     # Individual node components (VPC, Subnet, EC2, etc.)
/src/style.css                  # Global CSS, VueFlow z-index overrides
/backend/server.js              # Express API
/backend/terraformGenerator.js  # Terraform code generation
```

---

## DEVELOPMENT HISTORY (What's been built & fixed)

### Phase 1: Core Canvas
- Drag-drop from toolbox → canvas
- 6 component types: VPC, Subnet, EC2, RouteTable, IGW, NAT
- Parent-child containment (EC2→Subnet→VPC, IGW/NAT→RouteTable→VPC)

### Phase 2: Resizing Bug Fix
**Problem:** Resizing broken at zoom levels != 100%
**Cause:** Didn't account for viewport.zoom in calculations
**Fix:** Divide mouse deltas by zoom
```javascript
// Canvas.vue handleResize
const zoom = resizing.value.zoom
const dx = (event.clientX - resizing.value.startX) / zoom
const dy = (event.clientY - resizing.value.startY) / zoom
```

### Phase 3: Reactivity Bug Fix
**Problem:** Label changes didn't update canvas immediately
**Cause:** Array mutation doesn't trigger Vue reactivity with VueFlow
**Fix:** Always replace array, never mutate
```javascript
// WRONG: nodes.value[index].data.label = newLabel
// RIGHT: nodes.value = [...nodes.value.map(n => n.id === id ? updated : n)]
```

### Phase 4: Persistence
- Auto-save to localStorage on every change
- Auto-load on app mount
- Key: `infracrafter-canvas-state`
- Stores: nodes, edges, viewport

### Phase 5: Backend + Terraform Export
- Created /backend folder with Express server
- POST /api/export/terraform endpoint
- Generates valid Terraform code for all node types
- Frontend fetches and downloads .tf file

### Phase 6: NAT Gateway Terraform Bug Fix
**Problem:** tofu validate error - hardcoded IGW reference
**Cause:** depends_on referenced non-existent resource
**Fix:** Dynamically find IGW, conditionally add depends_on
```javascript
const igw = this.nodes.find(n => n.type === 'internetgateway')
const dependsOn = igw ? `\n\n  depends_on = [aws_internet_gateway.${sanitize(igw.label)}]` : ''
```

### Phase 7: Visual Edges (Connectors)
- Added edge system to show subnet→route table associations
- Initially auto-created edges for all parent-child relationships
- Simplified to ONLY show route table associations
- Styling: smoothstep, arrowclosed marker, color-coded

### Phase 8: Drop Position Bug Fix
**Problem:** Dropped nodes failed to detect parent (containment broken)
**Cause:** Drop position didn't account for viewport zoom/pan
**Fix:** Transform drop coordinates by viewport
```javascript
// Canvas.vue handleDrop
const viewport = vueFlowRef.value?.viewport || { x: 0, y: 0, zoom: 1 }
const x = (event.clientX - rect.left - viewport.x) / viewport.zoom - 75
const y = (event.clientY - rect.top - viewport.y) / viewport.zoom - 40
```

### Phase 9: Immediate Update Bug Fix
**Problem:** Dropped node didn't appear until next drop
**Cause:** Using push() instead of array replacement
**Fix:**
```javascript
// BEFORE: nodes.value.push(newNode)
// AFTER: nodes.value = [...nodes.value, newNode]
```

### Phase 10: Z-Index Issues (CRITICAL)
**Problem 1:** Nodes hidden behind other nodes until clicked
**Problem 2:** Edges disappeared when clicking VPC
**Cause:** Hard-coded z-index values interfered with VueFlow's natural stacking + auto-elevation
**Fix:** Use z-index: auto for nodes, z-index: 10000 for edges, disable elevation
```css
/* style.css */
.vue-flow__node { z-index: auto !important; }
.vue-flow__node.selected { z-index: auto !important; }
.vue-flow__edge { z-index: 10000 !important; pointer-events: all !important; }
```
```vue
<!-- Canvas.vue -->
:elevate-edges-on-select="false"
:elevate-nodes-on-select="false"
```

### Phase 11: SweetAlert2 Integration
- Replaced all alert() and confirm() with SweetAlert2
- Export success: Shows node count, friendly message
- Export error: Shows backend setup instructions
- Clear canvas: Warning dialog with confirmation
- All dialogs have friendly tone, emojis, color-coded

### Phase 12: Terraform Tags
- Added default tag to ALL AWS resources: `GeneratedBy: "InfraCrafter.com"`
- Created generateTags() helper method in terraformGenerator.js
- Updated all resource generators (VPC, Subnet, RouteTable, IGW, NAT, EIP, EC2)

---

## CRITICAL CODE PATTERNS (Use these!)

### 1. Viewport Transformation (Required for drop/resize)
```javascript
const viewport = vueFlowRef.value?.viewport || { x: 0, y: 0, zoom: 1 }
const screenX = (canvasX - viewport.x) / viewport.zoom
const screenY = (canvasY - viewport.y) / viewport.zoom
```

### 2. Reactive Array Updates (NEVER mutate)
```javascript
// Adding: nodes.value = [...nodes.value, newNode]
// Updating: nodes.value = nodes.value.map(n => n.id === id ? updated : n)
// Removing: nodes.value = nodes.value.filter(n => n.id !== id)
```

### 3. Parent Detection (Recursive position)
```javascript
const getAbsolutePosition = (node) => {
  let { x, y } = node.position
  if (node.parentNode) {
    const parent = nodes.value.find(n => n.id === node.parentNode)
    if (parent) {
      const parentPos = getAbsolutePosition(parent)
      x += parentPos.x
      y += parentPos.y
    }
  }
  return { x, y }
}
```

### 4. Edge Creation (Route table associations only)
```javascript
const edge = {
  id: `edge_${source}_${target}`,
  source: routeTableId,
  target: subnetId,
  type: 'smoothstep',
  animated: false,
  style: { stroke: colorScheme },
  markerEnd: { type: MarkerType.ArrowClosed }
}
edges.value = [...edges.value, edge]
```

---

## DATA STRUCTURES

### Node Structure
```javascript
{
  id: 'node_123',                // Unique ID
  type: 'vpc|subnet|ec2|routetable|internetgateway|natgateway',
  position: { x: 100, y: 100 },  // Relative to parent (or canvas if no parent)
  parentNode: 'node_456',        // Parent ID (optional)
  extent: 'parent',              // Constrain to parent bounds
  data: {
    label: 'My VPC',             // Display name
    cidr: '10.0.0.0/16',         // VPC/Subnet only
    instanceType: 't2.micro',    // EC2 only
    colorScheme: '#3b82f6',      // RouteTable only
    routeTableId: 'node_789'     // Subnet association (optional)
  },
  style: {
    width: '400px',
    height: '300px'
  },
  class: 'custom-node'
}
```

### Edge Structure
```javascript
{
  id: 'edge_subnet_rt',
  source: 'routeTableId',        // Route table
  target: 'subnetId',            // Subnet
  type: 'smoothstep',
  animated: false,
  style: { stroke: '#3b82f6' },
  markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6' }
}
```

---

## CONTAINMENT RULES (Parent-child relationships)

| Child Type        | Allowed Parents    | Notes                          |
|-------------------|--------------------|--------------------------------|
| VPC               | None (top-level)   | Cannot be nested               |
| Subnet            | VPC                | Auto-generates CIDR            |
| RouteTable        | VPC                | Gets random color scheme       |
| InternetGateway   | RouteTable         | Adds 0.0.0.0/0 route in TF     |
| NATGateway        | RouteTable         | Creates EIP, depends on IGW    |
| EC2               | Subnet             | References subnet in TF        |

**Implementation:** See `findParentNode()` in App.vue (~line 280)

---

## TERRAFORM GENERATION

### Resource Order (Dependencies)
1. VPC
2. Subnets (reference VPC)
3. Route Tables (reference VPC)
4. Route Table Associations (reference subnet + RT)
5. Internet Gateways (reference VPC via RT parent)
6. NAT Gateways (reference subnet, create EIP, depend on IGW)
7. EC2 Instances (reference subnet)

### Default Tags (All resources)
```hcl
tags = {
  Name        = "resource-name"
  GeneratedBy = "InfraCrafter.com"
}
```

### Helper Methods
- `sanitizeName(name)`: Converts labels to valid Terraform identifiers
- `generateTags(name, additionalTags)`: Creates tags block with defaults

---

## COMMON BUGS & SOLUTIONS

### Bug: Resizing doesn't work at zoom
→ Divide mouse deltas by viewport.zoom

### Bug: Changes don't update canvas
→ Replace array instead of mutating: `arr.value = [...arr.value, item]`

### Bug: Drop position wrong when zoomed/panned
→ Transform: `(clientX - rect.left - viewport.x) / viewport.zoom`

### Bug: Edges disappear on click
→ Set `.vue-flow__edge { z-index: 10000 !important }`
→ Disable elevate-edges-on-select and elevate-nodes-on-select

### Bug: Terraform validation fails
→ Check dependencies (IGW before NAT)
→ Verify resource references match sanitized names
→ Update AMI IDs for region

---

## API ENDPOINTS

### POST /api/export/terraform
**Request:**
```json
{
  "nodes": [{ id, type, data, position, parentNode, style }],
  "edges": [{ id, source, target, label }],
  "timestamp": "2025-10-23T..."
}
```

**Response (Success):**
```json
{
  "success": true,
  "terraform": "terraform {\n  required_providers...",
  "stats": {
    "nodes": 5,
    "edges": 2,
    "lines": 120
  }
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "Error message"
}
```

---

## NEXT STEPS (Future work - NOT implemented)

### Potential Features
- Security Groups
- Network ACLs  
- Load Balancers
- RDS Databases
- S3 Buckets
- Auto Scaling Groups
- Multi-region support
- Custom AMI selection
- Import existing infrastructure
- Undo/redo
- Keyboard shortcuts
- Template library

### Technical Debt
- Remove debug console.log statements (App.vue findParentNode)
- Add unit tests
- Add E2E tests
- Input validation
- Error boundaries
- Optimize re-renders

---

## DEBUGGING COMMANDS

### Check viewport state
```javascript
console.log(vueFlowRef.value?.viewport)
// { x: 0, y: 0, zoom: 1 }
```

### Check localStorage
```javascript
JSON.parse(localStorage.getItem('infracrafter-canvas-state'))
```

### Trace parent detection
Debug logs in App.vue ~line 280:
```
Finding parent for [type] at position {x, y}
Allowed parent types: [...]
Checking node: [id] at {x, y}
Drop position within bounds: true/false
```

### VueFlow instance
```javascript
vueFlowRef.value.getNodes()
vueFlowRef.value.getEdges()
vueFlowRef.value.fitView()
```

---

## RUNNING THE PROJECT

### Start Frontend
```bash
npm install
npm run dev
# → http://localhost:5174
```

### Start Backend
```bash
cd backend
npm install
npm start
# → http://localhost:3001
```

### Validate Terraform
```bash
# After exporting .tf file
terraform init
terraform validate
terraform plan
```

---

## KEY FILES TO MODIFY

### Adding new component type:
1. Create `/src/components/nodes/NewNode.vue`
2. Add to Canvas.vue template section
3. Update `getDefaultData()`, `getDefaultWidth()`, `getDefaultHeight()` in App.vue
4. Update `findParentNode()` containment rules in App.vue
5. Add Terraform generator method in backend/terraformGenerator.js
6. Add to resource processing in `generate()` method

### Changing containment rules:
→ Edit `findParentNode()` in App.vue (~line 280)

### Changing Terraform output:
→ Edit methods in backend/terraformGenerator.js

### Changing canvas behavior:
→ Edit Canvas.vue (drop handling, resize, export)

### Changing node appearance:
→ Edit individual node components in /src/components/nodes/

---

## IMPORTANT NOTES FOR AI

1. **ALWAYS use array replacement, never mutation** for nodes/edges
2. **ALWAYS account for viewport zoom/pan** in position calculations
3. **Check file contents before editing** - user may have made changes
4. **Use 3-5 lines context** when using replace_string_in_file
5. **Don't create markdown summaries** unless user requests
6. **Debug logs exist** in App.vue findParentNode (~line 280) - can be removed
7. **Z-index is critical** - edges must be 10000, nodes must be auto
8. **VueFlow options matter** - elevation disabled for z-index control
9. **Terraform tags** - all resources include GeneratedBy: InfraCrafter.com
10. **SweetAlert2** - use for all user dialogs (success, error, confirm)

---

## CONVERSATION CONTEXT (Last session)

**What was built:**
- Complete diagram builder with 6 component types
- Full parent-child containment system
- 8-direction resizing with zoom support
- localStorage persistence
- Backend Terraform generator
- Visual edges for route table associations
- SweetAlert2 integration
- Default tags on all Terraform resources

**What was debugged:**
- Resizing at zoom levels (viewport compensation)
- Reactive updates (array replacement)
- Parent detection on drop (viewport transformation)
- Immediate canvas updates (array replacement)
- Z-index issues (CSS overrides + disable elevation)
- NAT Gateway dependencies (dynamic IGW reference)
- Edge visibility (z-index 10000)

**Current state:**
- All features working
- No known critical bugs
- Debug logs still present (can be removed)
- Ready for new features or refinements

**User's next request will likely involve:**
- New component types (Security Groups, Load Balancers, etc.)
- UI/UX improvements
- Terraform output enhancements
- Bug fixes discovered during use
- Feature refinements

---

Last Updated: October 23, 2025
