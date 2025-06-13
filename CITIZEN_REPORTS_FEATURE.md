# Citizen Reports Integration

This document describes the new citizen reports feature that integrates with the C-Site platform to display nearby citizen reports for each mining area.

## Overview

The citizen reports feature enhances mine detail pages by displaying relevant citizen reports from the C-Site platform within a 30km radius of each mining area. This helps users better understand local concerns and events near mining sites.

## Implementation

### Backend Components

#### 1. C-Site Service (`backend/src/services/csiteService.js`)

- Integrates with C-Site API using the provided endpoint and token
- Implements 30km geospatial filtering using Haversine formula
- Extracts coordinates from various GeoJSON geometry types
- Transforms and normalizes C-Site API responses

#### 2. Citizen Reports API (`backend/src/routes/citizenReports.js`)

- `GET /api/citizen-reports` - Fetch all citizen reports with optional filtering
- `POST /api/citizen-reports/nearby` - Get reports within 30km of a specific mine
- Includes proper validation and error handling

### Frontend Components

#### 1. C-Site API Service (`frontend/src/services/csiteApi.ts`)

- TypeScript service for API communication
- Handles date formatting and relative time calculations
- Provides type-safe interfaces for C-Site topics

#### 2. Citizen Reports Component (`frontend/src/components/Map/CitizenReports.tsx`)

- Collapsible section in mine detail sidebar
- Shows report titles, dates, distances, and content previews
- Links to full reports on C-Site platform
- Responsive design with loading and error states

#### 3. Enhanced Detail Sidebar (`frontend/src/components/Map/DetailSidebar.tsx`)

- Integrated citizen reports section
- Positioned between mine info and villages at risk

## API Configuration

### C-Site API Details

- **Endpoint**: https://api.redesign.csitereport.com/externaltopic/get_topic_list
- **Method**: POST
- **Token**: d73343fba45875c2eec41e7bbf0559d3
- **Parameters**:
  - `token` (required): API authentication token
  - `datefrom` (optional): Start date in YYYY-MM-DD format
  - `dateto` (optional): End date in YYYY-MM-DD format
  - `limit` (optional): Result limit, default is 50

### Geospatial Filtering

- 30km radius buffer around each mining area
- Supports Point, Polygon, and MultiPolygon geometries
- Distance calculation using Haversine formula
- Results sorted by distance from mine

## Features

1. **Automatic Fetching**: Reports are fetched automatically when a mine is selected
2. **Date Filtering**: Default to last 6 months of reports
3. **Distance Display**: Shows approximate distance from mine to each report
4. **Expandable UI**: Collapsible section to save space
5. **External Links**: Direct links to full reports on C-Site
6. **Error Handling**: Graceful handling of API failures
7. **Loading States**: Visual feedback during data fetching

## Usage

1. Navigate to any mine detail page
2. Click on a mine marker or select from nearby mines list
3. Look for "รายงานประชาชนในพื้นที่ใกล้เคียง" section
4. Click to expand and view nearby citizen reports
5. Click "ดูรายละเอียดเพิ่มเติม" to view full reports on C-Site

## Development Notes

- Backend requires `node-fetch` dependency for API calls
- Frontend uses TypeScript for type safety
- Responsive design works on mobile and desktop
- Error boundaries prevent crashes if C-Site API is unavailable
- Configurable distance radius (currently 30km)

## Security Considerations

- API token is stored securely on backend only
- Frontend communicates through backend API
- Input validation on all API endpoints
- Rate limiting applied to prevent abuse

## Future Enhancements

- Cache frequently accessed reports
- Add filter options (date range, topic type)
- Implement pagination for large result sets
- Add map visualization of report locations
- Include sentiment analysis of reports
