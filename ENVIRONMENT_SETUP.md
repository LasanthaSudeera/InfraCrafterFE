# Environment Configuration Guide

## Overview
InfraCrafter uses environment variables to configure the backend API URL, allowing it to work in both development and production environments.

## Environment Files

### `.env` (Development - Git ignored)
Used for local development:
```env
VITE_API_URL=http://localhost:3001
```

### `.env.production` (Production - Git ignored)
Used for production builds:
```env
VITE_API_URL=https://api.infracrafter.com
```

### `.env.example` (Template - Committed to Git)
Template file showing required variables:
```env
VITE_API_URL=http://localhost:3001
```

## Setup Instructions

### For Development

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. The default values should work for local development

3. Start the backend server:
   ```bash
   cd backend
   npm start
   ```

4. Start the frontend:
   ```bash
   npm run dev
   ```

### For Production

1. Create `.env.production` file:
   ```bash
   cp .env.example .env.production
   ```

2. Update the API URL to your production backend:
   ```env
   VITE_API_URL=https://api.infracrafter.com
   ```

3. Build for production:
   ```bash
   npm run build
   ```

4. The built files in `dist/` will use the production API URL

## How It Works

### In the Code
The frontend uses Vite's environment variable system:

```javascript
const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'
const response = await fetch(`${apiUrl}/api/export/terraform`, { ... })
```

### Vite Environment Variables
- All environment variables must be prefixed with `VITE_` to be exposed to the client
- `import.meta.env.VITE_API_URL` accesses the variable
- Fallback to localhost:3001 if not defined

## Deployment Checklist

### Frontend Deployment
- [ ] Set `VITE_API_URL` to your production backend URL
- [ ] Run `npm run build`
- [ ] Deploy `dist/` folder to your hosting service (Vercel, Netlify, etc.)

### Backend Deployment Options

#### Option 1: Same Domain (Recommended)
Deploy backend to a subdomain or path:
- Backend: `https://api.infracrafter.com`
- Frontend: `https://infracrafter.com`
- Set: `VITE_API_URL=https://api.infracrafter.com`

#### Option 2: Different Domain
Deploy backend separately:
- Backend: `https://infracrafter-api.herokuapp.com`
- Frontend: `https://infracrafter.com`
- Set: `VITE_API_URL=https://infracrafter-api.herokuapp.com`
- **Important:** Configure CORS in backend to allow your frontend domain

## Backend CORS Configuration

If frontend and backend are on different domains, update `backend/server.js`:

```javascript
app.use(cors({
  origin: ['https://infracrafter.com', 'http://localhost:5173'],
  credentials: true
}))
```

## Testing

### Test Development Build
```bash
npm run dev
# Should connect to http://localhost:3001
```

### Test Production Build Locally
```bash
# Build with production env
npm run build

# Preview the production build
npm run preview
# Check Network tab - should use production API URL
```

## Troubleshooting

### "Connection Issue" Error
**Cause:** Frontend can't reach the backend API

**Solutions:**
1. Check if backend is running:
   ```bash
   cd backend
   npm start
   ```

2. Verify API URL is correct:
   ```bash
   # Development
   echo $VITE_API_URL
   
   # Or check in browser console
   console.log(import.meta.env.VITE_API_URL)
   ```

3. Check CORS if using different domains

### Environment Variables Not Working
**Cause:** Vite requires restart after .env changes

**Solution:**
1. Stop the dev server (Ctrl+C)
2. Start again: `npm run dev`

### Production Build Uses Wrong URL
**Cause:** `.env.production` not found or incorrect

**Solution:**
1. Ensure `.env.production` exists
2. Verify `VITE_API_URL` is set correctly
3. Rebuild: `npm run build`

## Security Notes

- ✅ `.env` and `.env.production` are in `.gitignore` (not committed)
- ✅ `.env.example` is committed (safe, no secrets)
- ⚠️ Never commit API keys or secrets to `.env` files
- ✅ `VITE_API_URL` is safe to expose (it's a public endpoint)

## Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `VITE_API_URL` | Yes | `http://localhost:3001` | Backend API base URL |

## Future Environment Variables

As the app grows, you might add:

```env
# Analytics
VITE_GA_TRACKING_ID=UA-XXXXXXXXX-X

# Feature Flags
VITE_ENABLE_BETA_FEATURES=false

# API Keys (public)
VITE_MAPBOX_API_KEY=pk.xxxxx

# Environment
VITE_ENVIRONMENT=production
```

Remember: Never put secrets in `VITE_` variables - they're exposed to the browser!
