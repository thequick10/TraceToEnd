# 🎯 Affiliate URL Resolver

<div align="center">

![Node.js Version](https://img.shields.io/badge/node-%3E%3D%2014.0.0-green.svg)
![Express Version](https://img.shields.io/badge/express-%5E4.18.2-lightgrey)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)

A powerful and efficient URL resolution service that tracks campaign parameters, handles complex redirects, and validates marketing URLs.

[Key Features](#-key-features) •
[Installation](#%EF%B8%8F-installation) •
[API Endpoints Usage](#-api-endpoints-usage) •
[Deployment](#-deployment) •
[Dependencies](#dependencies) •
[Frontend Usage](#frontend-usage) •
[Sample JSON Response](#sample-response) •
[Import/Export Capabilities](#-importexport-capabilities)

</div>

## 🚀 Key Features

- 🌐 **Browser Emulation**: Uses Puppeteer for JavaScript-heavy redirects
- 🌏 **Region Based URL Resolutions**: Region-based URL resolution with proxy support for multiple geographic zones
- 🖇 **Multiple Endpoint Support**: Single and multiple region URL resolution endpoints
- 📊 **Data Management**: Campaign management frontend with URL tracking, tagging, and status display
- 📥 **File Import/Export Support**: Import and export campaigns via CSV and XLSX file formats
- 📍 **Location Detection**: Auto-detection of user location and manual country selection
- 🔐 **Security**: Rate limiting, security headers, and basic authentication for enhanced security
- 📊 **API Usage Analytics**: Analytics page for usage tracking and monitoring
- ✅ **Health Check Support**: System health and region listing API endpoints

### 📁 Import/Export Capabilities
- 📥 **Import Support**:
  - CSV file import
  - XLSX file import
  - Drag & drop file support
  - Smart column detection
  - Batch processing
- 📤 **Export Options**:
  - Export to CSV
  - Complete campaign history
  - Formatted date and time

### 🌍 Location Detection
- 🔍 **Auto-Detection**: Automatic country detection
- 🔄 **Multiple Services**: Fallback to multiple geolocation services
- 🚥 **Status Indicators**: Visual feedback for detection process
- 🔄 **Manual Refresh**: Option to refresh location detection

### 🔍 Search & Filter
- 🔎 **Real-time Search**: Instant search across all fields
- 📅 **Date Range Filter**: 
  - Built-in date range picker
  - Clear filter option
  - Support for custom date formats
- 📊 **Sorting Options**:
  - Sort by newest/oldest
  - Persistent sorting preferences
  - Sort by File Import Order

### 🔄 URL Refresh Features
- 🔄 **Individual Refresh**: Refresh single URLs
- 📊 **Batch Refresh**: Refresh all URLs with progress tracking
- ⚠️ **Error Handling**: 
  - Automatic retry mechanism
  - Error status indicators
  - Restore previous URL on failure
- 📈 **Progress Tracking**: Visual progress indicators

### 💫 Additional Features
- 📋 **Clipboard Support**: One-click URL copying
- ✏️ **Inline Editing**: Edit campaign URLs and tags directly
- 🗑️ **Data Management**: Delete individual or all campaigns
- 📱 **Responsive Design**: Works on desktop and mobile
- 🔔 **Notifications**: Beautiful toast notifications for all actions

## 🛠️ Installation

1. **Clone the repository**
```bash
git clone https://github.com/thequick10/TraceToEnd.git
cd TraceToEnd
```

2. **Install dependencies**
```bash
npm install
```

3. **Start the server**
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## 💻 API Endpoints Usage

The server provides multiple endpoints for URL resolution with different levels of depth and speed:

- `GET /resolve?url=<URL>&region=<REGION_CODE>`  
  Resolve a single URL for a specified region.

- `GET /resolve-multiple?url=<URL>&regions=us,ca,ae`  
  Resolve a URL across multiple regions simultaneously.

- `GET /zone-usage?from=YYYY-MM-DD&to=YYYY-MM-DD`  
  Retrieve BrightData API usage statistics for the configured zone.

- `GET /regions`  
  List all supported proxy regions.

- `GET /system-info`  
  Get system health and resource usage information.

- `GET /analytics/usage.html`  
  Access the analytics usage page (requires authentication).

- `GET /ip`  
  Returns the client IP address.

### Sample Response
```json
{
  "originalUrl": "https://your-campaign-url.com",
  "finalUrl": "https://final-destination.com?clickid=123&utm_source=campaign",
  "method": "puppeteer-standard",
  "hasClickId": true,
  "hasUtmSource": true,
  "hasClickRef": false
  //more paramenters
}
```

## Frontend Usage

- **Add Campaigns:** Enter campaign URL, tags/notes, and select country, then click "Add Campaign".
- **Refresh URLs:** Refresh individual or all campaign URLs to get updated final resolved URLs.
- **Import/Export:** Import campaigns from CSV or XLSX files; export current campaigns to CSV.
- **Filtering and Sorting:** Search campaigns, filter by date range, and sort by newest, oldest, or import order.

## 🚀 Deployment

### Prerequisites
- Node.js >= 14.0.0
- NPM or Yarn
- 512MB RAM minimum

### Environment Variables
```env
PORT=8080  # Server port (optional)
```

### Deployment Platforms
- 🌐 Any Node.js compatible hosting

## Dependencies
Key npm packages used:

- express
- cors
- dotenv
- helmet
- express-basic-auth
- express-rate-limit
- puppeteer-core
- https
- os
- path
- url

## License and Author

Author: Rupesh Shah  
License: MIT (or specify your license)
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Puppeteer](https://pptr.dev/) for headless browser automation
- [Express.js](https://expressjs.com/) for the web framework
- [node-fetch](https://github.com/node-fetch/node-fetch) for HTTP requests

---
