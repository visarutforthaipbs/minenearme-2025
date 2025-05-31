# Deployment Notes

## KokWatch API Issue Fix

### Problem

The KokWatch monitoring points (จุดที่ได้รับการตรวจน้ำ) were showing up in the local development version but not in the Vercel deployment.

### Root Cause

- **Local Development**: The Vite dev server proxy configuration in `vite.config.ts` redirects `/api/kokwatch` to the external API at `https://api.redesign.csitereport.com/publicdata/get_kokwatch`
- **Production (Vercel)**: The proxy configuration only works in development. When deployed to Vercel, there's no proxy server running, so the `/api/kokwatch` endpoint doesn't exist.

### Solution

Created a Vercel serverless function to act as a proxy:

1. **Added `api/kokwatch.js`** (at root level): A serverless function that proxies requests to the external KokWatch API
2. **Added `vercel.json`** (at root level): Configuration for proper deployment of the monorepo structure
3. **CORS Handling**: The serverless function includes proper CORS headers to allow frontend access

### Files Changed

- `api/kokwatch.js` - New serverless function (at repository root)
- `vercel.json` - Vercel deployment configuration (at repository root)

### Deployment Structure

Since this is a monorepo with both frontend and backend:

```
/
├── vercel.json          # Deployment configuration
├── api/
│   └── kokwatch.js      # Serverless function
├── frontend/            # Frontend React app
└── backend/             # Backend API (separate deployment)
```

### How it Works

- Vercel deploys from the repository root
- The `vercel.json` configures the build to use the frontend directory
- API routes in the root `/api` directory are automatically deployed as serverless functions
- The frontend build output is served from `frontend/dist`

### Testing

After deployment, the KokWatch monitoring points should appear on the map in case-6. You can verify by:

1. Opening case-6 on the deployed site
2. Checking that the "จุดที่ได้รับการตรวจน้ำ" layer shows green markers on the map
3. Clicking on markers to see water quality data popups

### API Endpoint

- **Local**: `http://localhost:5173/api/kokwatch?token=0265026b95a4a0618f9a300776c823e3`
- **Production**: `https://your-vercel-domain.com/api/kokwatch?token=0265026b95a4a0618f9a300776c823e3`

### Deployment Notes

- Vercel detects `/api/*.js` files as serverless functions when deploying from repository root
- The `vercel.json` configuration is needed for monorepo setups to specify build and output directories
- Frontend and backend are deployed separately (frontend on Vercel, backend elsewhere)

### Future Considerations

- Monitor API usage and performance
- Consider caching responses if the external API has rate limits
- Add error boundaries in the UI for better user experience when API fails
