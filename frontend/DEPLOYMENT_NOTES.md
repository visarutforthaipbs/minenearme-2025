# Deployment Notes

## KokWatch API Issue Fix

### Problem

The KokWatch monitoring points (จุดที่ได้รับการตรวจน้ำ) were showing up in the local development version but not in the Vercel deployment.

### Root Cause

- **Local Development**: The Vite dev server proxy configuration in `vite.config.ts` redirects `/api/kokwatch` to the external API at `https://api.redesign.csitereport.com/publicdata/get_kokwatch`
- **Production (Vercel)**: The proxy configuration only works in development. When deployed to Vercel, there's no proxy server running, so the `/api/kokwatch` endpoint doesn't exist.

### Solution

Created a Vercel serverless function to act as a proxy:

1. **Added `frontend/api/kokwatch.js`**: A serverless function that proxies requests to the external KokWatch API
2. **Added `frontend/vercel.json`**: Configuration to ensure the API function is properly deployed
3. **CORS Handling**: The serverless function includes proper CORS headers to allow frontend access

### Files Changed

- `frontend/api/kokwatch.js` - New serverless function
- `frontend/vercel.json` - Vercel deployment configuration

### Testing

After deployment, the KokWatch monitoring points should appear on the map in case-6. You can verify by:

1. Opening case-6 on the deployed site
2. Checking that the "จุดที่ได้รับการตรวจน้ำ" layer shows green markers on the map
3. Clicking on markers to see water quality data popups

### API Endpoint

- **Local**: `http://localhost:5173/api/kokwatch?token=0265026b95a4a0618f9a300776c823e3`
- **Production**: `https://your-vercel-domain.com/api/kokwatch?token=0265026b95a4a0618f9a300776c823e3`

### Future Considerations

- Monitor API usage and performance
- Consider caching responses if the external API has rate limits
- Add error boundaries in the UI for better user experience when API fails
