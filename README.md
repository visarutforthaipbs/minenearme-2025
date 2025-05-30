# MineNearMe 2025 🌍

A comprehensive mining impact monitoring platform featuring interactive maps, case studies, timeline visualization, and real-time water quality monitoring. Built with React, TypeScript, Node.js, and MongoDB.

## ✨ New Features

### 🎯 SEO & Analytics (Latest Update)

- **Dynamic SEO Meta Tags**: Page-specific titles, descriptions, and OpenGraph tags
- **Google Analytics Integration**: Track user interactions, page views, and conversions
- **Social Media Optimization**: Twitter Cards and Facebook OpenGraph support
- **Structured Data**: JSON-LD for better search engine understanding
- **Mobile-Responsive Legend**: Collapsible map legend for mobile devices

### 🗺️ Interactive Features

- **Real-time Water Quality Monitoring**: KokWatch integration for live data
- **Case Study Deep Dives**: Detailed analysis with timeline visualizations
- **Community Engagement**: Comments, reports, and social sharing
- **Multi-layer Maps**: Mining areas, villages, rivers, and monitoring points

## 🏗️ Project Structure

```
minenearme_2025/
├── frontend/          # React + TypeScript + Vite
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Route pages
│   │   ├── services/      # API services & analytics
│   │   ├── config/        # Environment configuration
│   │   └── types/         # TypeScript definitions
│   ├── public/assets/     # Static assets & data files
│   └── index.html         # HTML with SEO meta tags
├── backend/           # Node.js + Express + MongoDB
│   ├── src/
│   │   ├── controllers/   # Request handlers
│   │   ├── models/        # MongoDB schemas
│   │   ├── routes/        # API routes
│   │   └── middleware/    # Custom middleware
│   └── uploads/           # File upload directory
└── README.md
```

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd minenearme_2025

# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

### 2. Environment Configuration

Create environment files with your credentials:

#### Frontend (.env in frontend/ directory)

```env
# Google Analytics
VITE_GA_MEASUREMENT_ID=GA_MEASUREMENT_ID

# API Configuration
VITE_API_BASE_URL=http://localhost:5001

# SEO Configuration
VITE_SITE_URL=https://minenearme2025.vercel.app
VITE_SITE_NAME=MineNearMe 2025
VITE_DEFAULT_SHARE_IMAGE=/assets/case-1-hero.jpg

# Features
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_SEO_TRACKING=true
```

#### Backend (.env in backend/ directory)

```env
# Database
MONGODB_URI=your_mongodb_connection_string
PORT=5001

# File Upload
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Security
JWT_SECRET=your_jwt_secret_key
```

### 3. Start Development Servers

```bash
# Start backend (Terminal 1)
cd backend
npm run dev

# Start frontend (Terminal 2)
cd frontend
npm run dev
```

- Frontend: `http://localhost:5174`
- Backend API: `http://localhost:5001`

## 🚀 Deployment

### Vercel (Frontend) - Recommended

1. **Connect your GitHub repository to Vercel:**

   ```bash
   npm install -g vercel
   vercel login
   vercel
   ```

2. **Configure environment variables in Vercel dashboard:**

   - `VITE_GA_MEASUREMENT_ID`: Your Google Analytics ID
   - `VITE_API_BASE_URL`: Your backend API URL
   - `VITE_SITE_URL`: Your Vercel domain
   - `VITE_ENABLE_ANALYTICS`: true

3. **Build settings:**
   - Build Command: `cd frontend && npm run build`
   - Output Directory: `frontend/dist`

### Render (Backend) - Recommended

1. **Create new Web Service on Render:**

   - Connect your GitHub repository
   - Set Build Command: `cd backend && npm install`
   - Set Start Command: `cd backend && npm start`

2. **Configure environment variables:**
   - `MONGODB_URI`: MongoDB Atlas connection string
   - `CLOUDINARY_*`: Cloudinary credentials
   - `PORT`: 10000 (default for Render)

### Alternative: Railway, Netlify, Heroku

The application is compatible with all major deployment platforms. See individual platform documentation for specific setup instructions.

## 📊 Analytics Setup

### Google Analytics 4

1. **Create GA4 Property:**

   - Go to [Google Analytics](https://analytics.google.com/)
   - Create new GA4 property
   - Copy your Measurement ID (G-XXXXXXXXXX)

2. **Configure Tracking:**
   - Set `VITE_GA_MEASUREMENT_ID` in your environment
   - Events automatically tracked:
     - Page views
     - Case study visits
     - Map interactions
     - Timeline interactions
     - Downloads and shares
     - Comment submissions

### Tracked Events

The analytics system automatically tracks:

- **Content Engagement**: Case study views, timeline interactions
- **Map Usage**: Layer toggles, popup views, zoom levels
- **User Actions**: Comments, reports, downloads, shares
- **Performance**: Page load times, error rates
- **User Flow**: Navigation patterns, session duration

## 🔧 SEO Configuration

### Dynamic Meta Tags

Each page automatically generates:

- **Title**: Page-specific with brand suffix
- **Description**: Contextual descriptions based on content
- **Keywords**: Dynamic tags based on case study data
- **OpenGraph**: Facebook/LinkedIn sharing optimization
- **Twitter Cards**: Twitter sharing optimization
- **Structured Data**: JSON-LD for search engines

### SEO Best Practices Implemented

- ✅ Semantic HTML structure
- ✅ Proper heading hierarchy (H1-H6)
- ✅ Alt text for all images
- ✅ Canonical URLs
- ✅ Mobile-first responsive design
- ✅ Fast loading times with Vite
- ✅ Proper meta robots tags

## 📋 Features Overview

### 🗺️ Interactive Maps

- **Multi-layer GIS Data**: Mining areas, rivers, villages, monitoring points
- **Real-time Monitoring**: KokWatch water quality integration
- **Responsive Legend**: Collapsible on mobile devices
- **Custom Markers**: Risk-based village indicators

### 📚 Case Studies

- **Timeline Visualization**: Interactive event sequences
- **Community Voices**: Stakeholder interviews and testimonials
- **Impact Assessment**: Population and environmental data
- **Resource Downloads**: PDF reports, data files, GeoJSON

### 💬 Community Engagement

- **Comments System**: MongoDB-powered discussions
- **Impact Reporting**: User-generated impact reports
- **Social Sharing**: Optimized for all platforms
- **Analytics Tracking**: User engagement metrics

### 🎨 Design System

- **Chakra UI Components**: Consistent, accessible interface
- **Custom Color Palette**: Mining-themed with accessibility compliance
- **Responsive Design**: Mobile-first approach
- **Pattern Library**: Reusable design elements

## 🛠️ Technology Stack

### Frontend

- **React 18** + **TypeScript** - Modern UI framework
- **Vite** - Fast build tooling
- **Chakra UI** - Component library
- **React Leaflet** - Interactive maps
- **React Helmet Async** - SEO meta tag management
- **React Router** - Client-side routing

### Backend

- **Node.js** + **Express** - Server framework
- **MongoDB** + **Mongoose** - Database
- **Cloudinary** - File storage and optimization
- **Express Validator** - Input validation
- **Helmet** - Security headers

### DevOps & Analytics

- **Google Analytics 4** - User behavior tracking
- **Vercel** - Frontend deployment
- **Render** - Backend deployment
- **MongoDB Atlas** - Database hosting

## 📱 Production Checklist

Before deploying to production:

- [ ] Set up Google Analytics property
- [ ] Configure MongoDB Atlas database
- [ ] Set up Cloudinary account
- [ ] Set all environment variables
- [ ] Test analytics tracking
- [ ] Verify SEO meta tags
- [ ] Test mobile responsiveness
- [ ] Check map functionality
- [ ] Validate form submissions
- [ ] Test file uploads

## 🔐 Security Features

- **HTTPS Enforced**: Secure data transmission
- **CORS Protection**: Cross-origin request filtering
- **Rate Limiting**: API abuse prevention
- **Input Validation**: XSS and injection protection
- **Helmet Security**: HTTP security headers
- **Environment Isolation**: Sensitive data protection

## 📖 API Documentation

### Comments API

```
GET    /api/comments/:caseId     # Get comments for case
POST   /api/comments/:caseId     # Create new comment
PUT    /api/comments/:id/like    # Like/unlike comment
GET    /api/comments/:caseId/stats # Get comment statistics
```

### Reports API

```
GET    /api/reports             # Get all reports
POST   /api/reports             # Create new report
GET    /api/reports/:id         # Get specific report
PUT    /api/reports/:id         # Update report
DELETE /api/reports/:id         # Delete report
```

### Analytics Events

- `view_case_study` - Case study page visits
- `map_interaction` - Map layer toggles, popup views
- `timeline_interaction` - Timeline event clicks
- `submit_comment` - Comment submissions
- `submit_report` - Impact report submissions
- `download` - File downloads
- `share` - Social media shares

## 🤝 Contributing

1. **Fork the repository**
2. **Create feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit changes**: `git commit -m 'Add amazing feature'`
4. **Push to branch**: `git push origin feature/amazing-feature`
5. **Open Pull Request**

### Development Guidelines

- Follow TypeScript strict mode
- Use Chakra UI components when possible
- Implement proper error handling
- Add analytics tracking for new features
- Update SEO meta tags for new pages
- Write unit tests for critical functions

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check component comments and README files
- **Issues**: Use GitHub Issues for bug reports
- **Discussions**: Use GitHub Discussions for questions

---

**🇹🇭 Ready to monitor mining impacts in Thailand with advanced SEO and analytics!**

_Last updated: January 2025_
