# Debugging Citizen Reports Integration

## Step 1: Fix Server Issues

### Kill processes on port 3000:

```bash
# Find what's running on port 3000
lsof -i :3000

# Kill the process (replace PID with actual process ID)
kill -9 <PID>

# Or kill all processes on port 3000
lsof -t -i tcp:3000 | xargs kill -9
```

### Start Backend Server:

```bash
cd backend
npm run dev
```

### Start Frontend Server:

```bash
cd frontend
npm run dev  # This should work - the script exists in package.json
```

## Step 2: Check API Integration

### Test C-Site API Direct Call:

Open terminal and test the C-Site API directly:

```bash
curl -X POST https://api.redesign.csitereport.com/externaltopic/get_topic_list \
  -F "token=d73343fba45875c2eec41e7bbf0559d3" \
  -F "limit=10"
```

### Test Our Backend API:

```bash
# Test general endpoint
curl http://localhost:3000/api/citizen-reports?limit=5

# Test nearby endpoint with sample mine data
curl -X POST http://localhost:3000/api/citizen-reports/nearby?limit=5 \
  -H "Content-Type: application/json" \
  -d '{
    "mineFeature": {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [100.5, 13.7]
      },
      "properties": {
        "name": "Test Mine"
      }
    }
  }'
```

## Step 3: Browser Debugging

### Open Browser Developer Tools:

1. Open your webapp at http://localhost:5173
2. Press F12 to open DevTools
3. Go to Network tab
4. Click on a mine to trigger citizen reports
5. Look for:
   - Requests to `/api/citizen-reports/nearby`
   - Check if they return 200 status
   - Check response data

### Check Console for Errors:

1. Go to Console tab in DevTools
2. Look for any JavaScript errors related to:
   - CitizenReports component
   - API calls
   - Network issues

### Check Component State:

Add console.log debugging to the CitizenReports component to see:

- Is the component receiving mineFeature?
- Is the API call being made?
- What data is returned?

## Step 4: Possible Issues & Solutions

### Issue 1: C-Site API Token Invalid

- **Symptom**: API returns 401/403 errors
- **Solution**: Verify token with C-Site team

### Issue 2: No Location Data in C-Site Response

- **Symptom**: API returns data but no reports show up
- **Solution**: The C-Site API might not include location coordinates in their response

### Issue 3: CORS Issues

- **Symptom**: Frontend can't call backend API
- **Solution**: Check CORS settings in backend/src/server.js

### Issue 4: Mine Coordinates Extraction

- **Symptom**: "Could not extract coordinates" error
- **Solution**: Debug the coordinate extraction in csiteService.js

### Issue 5: No Reports in Test Area

- **Symptom**: API works but returns empty array
- **Solution**: The selected mine might not have any citizen reports within 30km

## Step 5: Quick Test with Mock Data

If the C-Site API is not working, you can test the UI with mock data by temporarily modifying the CitizenReports component:

```typescript
// In CitizenReports.tsx, replace the API call with mock data:
const nearbyReports = [
  {
    id: "1",
    title: "Test Report 1",
    date: "2024-06-01",
    distance: 5.2,
    content: "This is a test citizen report",
    url: "https://example.com",
  },
  {
    id: "2",
    title: "Test Report 2",
    date: "2024-05-15",
    distance: 12.8,
    content: "Another test report",
    url: "https://example.com",
  },
];
setReports(nearbyReports);
```

## Expected Behavior

When working correctly:

1. Click on any mine marker
2. Detail sidebar opens with mine information
3. "รายงานประชาชนในพื้นที่ใกล้เคียง" section appears
4. Click to expand - should show loading spinner
5. After loading, should show list of citizen reports or "ไม่มีรายงานประชาชนในรัศมี 30 กิโลเมตร"

## Debugging Commands Summary

```bash
# 1. Kill port conflicts
lsof -t -i tcp:3000 | xargs kill -9

# 2. Start servers
cd backend && npm run dev &
cd frontend && npm run dev &

# 3. Test APIs
curl -X POST https://api.redesign.csitereport.com/externaltopic/get_topic_list -F "token=d73343fba45875c2eec41e7bbf0559d3" -F "limit=5"

curl http://localhost:3000/api/citizen-reports?limit=5

# 4. Check browser console for errors
# 5. Add console.log statements to debug component state
```
