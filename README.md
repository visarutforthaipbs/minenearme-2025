# MineNearMe 2025

A comprehensive mining impact reporting and monitoring system for Thailand.

## 🏗️ Project Structure

This project is organized as a full-stack application with separate frontend and backend:

```
minenearme_2025/
├── frontend/          # React + Vite frontend application
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.ts
├── backend/           # Node.js + Express API server
│   ├── src/
│   ├── package.json
│   └── README.md
├── COLOR_SYSTEM.md
├── debug-case-data.js
└── README.md
```

## 🚀 Quick Start

### Frontend (React + Vite)

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at: `http://localhost:5174`

### Backend (Node.js + Express)

```bash
cd backend
npm install

# Copy and configure environment variables
cp env.example .env
# Edit .env with your MongoDB and Cloudinary credentials

npm run dev
```

The backend API will be available at: `http://localhost:3000`

## 🔧 Configuration

### Backend Environment Setup

Create `backend/.env` with your credentials:

```env
MONGODB_URI=your_mongodb_connection_string
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### Frontend API Configuration

Update `frontend/src/services/reportApi.ts` with your backend URL:

```typescript
const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:3000/api";
```

## 📋 Features

### ReportImpact Component ✅

- **Form with Map Selection**: Interactive Leaflet map for location selection
- **File Upload**: Support for images and videos via Cloudinary
- **Form Validation**: Comprehensive client-side validation
- **Multi-tab Interface**: New Report, Reports List, Reports Map
- **Status Management**: Different status badges for reports and responses
- **Responsive Design**: Mobile-friendly interface

### Backend API ✅

- **RESTful API**: Complete CRUD operations for reports
- **File Upload**: Cloudinary integration for images/videos
- **MongoDB Integration**: Robust data storage with proper schemas
- **Validation**: Input validation and error handling
- **Security**: Rate limiting, CORS, helmet protection
- **Geospatial Queries**: Find reports by location radius

## 🛠️ Technology Stack

### Frontend

- React 18 + TypeScript
- Vite for build tooling
- Chakra UI for components
- React Leaflet for maps
- React Router for navigation

### Backend

- Node.js + Express
- MongoDB with Mongoose
- Cloudinary for file storage
- Express Validator for input validation
- Helmet for security headers

## 📱 Ready for Production

The ReportImpact component and backend API are **production-ready** with:

- ✅ Complete form functionality
- ✅ File upload handling
- ✅ Database integration
- ✅ Error handling
- ✅ Security features
- ✅ Input validation
- ✅ Responsive design

## 📝 Next Steps

1. **Get your credentials:**

   - [Sign up for Cloudinary](https://cloudinary.com/users/register/free) (free tier: 25GB)
   - [Set up MongoDB Atlas](https://www.mongodb.com/atlas/database) (free tier: 512MB)

2. **Configure the backend** with your credentials

3. **Test the integration** by submitting a report through the frontend

4. **Deploy** to your preferred hosting platform

## 📚 Documentation

- [Backend API Documentation](backend/README.md) - Complete API reference
- [Frontend Components](frontend/src/components/) - Component documentation
- [Color System](COLOR_SYSTEM.md) - Design system guidelines

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

---

**Ready to report mining impacts in Thailand! 🇹🇭**
