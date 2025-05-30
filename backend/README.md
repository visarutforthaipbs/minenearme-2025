# MineNearMe Backend API

Backend API for the MineNearMe mining impact reporting system.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- Cloudinary account

### Setup

1. **Install dependencies:**

   ```bash
   cd backend
   npm install
   ```

2. **Environment Configuration:**

   ```bash
   cp env.example .env
   ```

   Fill in your actual values in `.env`:

   ```env
   MONGODB_URI=your_mongodb_connection_string
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   ```

3. **Start the server:**

   ```bash
   # Development mode with auto-reload
   npm run dev

   # Production mode
   npm start
   ```

4. **Test the API:**
   ```bash
   curl http://localhost:3000/health
   ```

## 📋 API Endpoints

### Reports

| Method | Endpoint                        | Description                     |
| ------ | ------------------------------- | ------------------------------- |
| GET    | `/api/reports`                  | Get all reports (paginated)     |
| GET    | `/api/reports/:id`              | Get specific report             |
| POST   | `/api/reports`                  | Create new report               |
| GET    | `/api/reports/nearby/:lat/:lng` | Get reports near coordinates    |
| GET    | `/api/reports/:id/actions`      | Get response actions for report |

### Query Parameters for GET /api/reports

- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10, max: 100)
- `status` - Filter by status: `pending`, `verified`, `rejected`
- `impactType` - Filter by impact type: `environment`, `health`, `economic`, `other`
- `responseStatus` - Filter by response status: `investigating`, `addressed`, `no_action`

### Example Requests

**Create a new report:**

```bash
curl -X POST http://localhost:3000/api/reports \
  -F 'position={"lat":13.736717,"lng":100.523186}' \
  -F 'impactTypes=["environment","health"]' \
  -F 'details=น้ำในลำห้วยมีสีแดงผิดปกติ' \
  -F 'contact=example@email.com' \
  -F 'files=@image1.jpg' \
  -F 'files=@image2.jpg'
```

**Get reports with filtering:**

```bash
curl "http://localhost:3000/api/reports?status=verified&impactType=environment&page=1&limit=5"
```

## 🗂️ Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   │   ├── database.js  # MongoDB connection
│   │   └── cloudinary.js # Cloudinary setup
│   ├── models/          # Database models
│   │   ├── ImpactReport.js
│   │   └── ResponseAction.js
│   ├── routes/          # API routes
│   │   └── reports.js
│   ├── middleware/      # Custom middleware
│   │   └── errorHandler.js
│   └── server.js        # Main server file
├── uploads/             # Temporary upload folder
├── package.json
├── env.example
└── README.md
```

## 🛡️ Security Features

- **Rate Limiting:** 100 requests per 15 minutes per IP
- **Helmet:** Security headers
- **CORS:** Configured for frontend origin
- **File Validation:** Type and size limits
- **Input Validation:** Express-validator for all inputs

## 📊 Database Schema

### ImpactReport Collection

```javascript
{
  _id: ObjectId,
  title: String,
  location: { lat: Number, lng: Number },
  impactTypes: [String], // ['environment', 'health', 'economic', 'other']
  description: String,
  reporter: {
    name: String,
    contact: String,
    verified: Boolean
  },
  evidence: [{
    url: String,
    publicId: String,
    type: String, // 'image' or 'video'
    originalName: String,
    size: Number,
    mimeType: String
  }],
  status: String, // 'pending', 'verified', 'rejected'
  responseStatus: String, // 'investigating', 'addressed', 'no_action'
  views: Number,
  priority: String, // 'low', 'medium', 'high', 'critical'
  createdAt: Date,
  updatedAt: Date
}
```

### ResponseAction Collection

```javascript
{
  _id: ObjectId,
  reportId: ObjectId,
  actions: [{
    date: Date,
    actor: String,
    action: String,
    status: String, // 'completed', 'in_progress', 'planned', 'cancelled'
    notes: String
  }],
  assignedTo: String,
  priority: String,
  deadline: Date,
  createdAt: Date,
  updatedAt: Date
}
```

## 🔧 Environment Variables

| Variable                | Description                 | Required |
| ----------------------- | --------------------------- | -------- |
| `MONGODB_URI`           | MongoDB connection string   | Yes      |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name       | Yes      |
| `CLOUDINARY_API_KEY`    | Cloudinary API key          | Yes      |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret       | Yes      |
| `PORT`                  | Server port (default: 3000) | No       |
| `NODE_ENV`              | Environment mode            | No       |
| `CORS_ORIGIN`           | Frontend URL for CORS       | No       |

## 🚦 Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `404` - Not Found
- `429` - Too Many Requests (rate limit)
- `500` - Internal Server Error

## 📈 Monitoring

Health check endpoint: `GET /health`

Returns:

```json
{
  "status": "OK",
  "message": "MineNearMe API is running",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```
