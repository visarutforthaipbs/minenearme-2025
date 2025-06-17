# Deployment Guide for Mine Near Me

## Environment Variables

### Required Environment Variables for Vercel Deployment:

1. **VITE_GA_MEASUREMENT_ID**: `G-YCK7HQQW61`

   - Google Analytics tracking ID
   - Used for page view and event tracking

2. **VITE_API_BASE_URL**: `https://minenearme-backend.onrender.com/api`
   - Backend API base URL
   - Used for all API requests

### How to Set Environment Variables in Vercel:

1. Go to your Vercel dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add the following variables:
   - Name: `VITE_GA_MEASUREMENT_ID`, Value: `G-YCK7HQQW61`
   - Name: `VITE_API_BASE_URL`, Value: `https://minenearme-backend.onrender.com/api`

## Common Issues and Fixes

### 1. Google Analytics Warning

**Issue**: Console warning about measurement ID not set
**Fix**: Ensure `VITE_GA_MEASUREMENT_ID` is set in Vercel environment variables

### 2. CORS Errors

**Issue**: Failed to fetch from external APIs
**Fix**: All external API calls should go through the backend to avoid CORS issues

### 3. Citizen Reports API Failures

**Issue**: TypeError from failed fetch to citizen reports endpoint
**Fix**:

- Check backend deployment status on Render
- Verify API endpoints are working
- Error handling returns empty arrays instead of throwing errors

### 4. 404 Errors on Direct URL Access

**Issue**: Direct access to `/case-6` returns 404
**Fix**: Already fixed with `_redirects` file for SPA routing

## Backend Status Check

To verify backend is running:

```bash
curl https://minenearme-backend.onrender.com/api/health
```

## Deployment Steps

1. Commit all changes to git
2. Push to GitHub main branch
3. Vercel auto-deploys from GitHub
4. Set environment variables in Vercel dashboard
5. Redeploy if needed

## Error Monitoring

Check browser console for:

- Google Analytics initialization
- API request failures
- CORS errors
- Network connectivity issues
