# 🎯 TraceToEnd

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
- 🔗 **URL Resolution Stats** URL Resolutions stat page to track failed and success url in respect of regions
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

## 🧑‍💻 User Agent Support
- **Desktop**: Emulates a desktop browser user agent.
- **Mobile**: Emulates a mobile browser user agent.
- **Random (Rotating)**: Randomly selects a desktop or mobile user agent for each request. This is the default option and helps simulate diverse real-world traffic.

You can select the user agent type from the frontend dropdown. The selected type is sent to the backend and used for all URL resolutions and analytics.

### 💫 Additional Features
- 📋 **Clipboard Support**: One-click URL copying
- ✏️ **Inline Editing**: Edit campaign URLs and tags directly
- 🗑️ **Data Management**: Delete individual or all campaigns
- 📱 **Responsive Design**: Works on desktop and mobile
- 🔔 **Notifications**: Beautiful toast notifications for all actions
- 🖥 **User Agent Selection**: Choose between Desktop, Mobile, or Random (rotating) user agents for each request. The Random option will select a new user agent for every request, simulating real-world browsing patterns.
- ⏱️ **Timing Statistics Dashboard**: Dedicated dashboard to track and analyze the time taken to resolve URLs, with filtering, sorting, and CSV export capabilities.

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

3. **DotENV Config**
```.env
Configure your dotenv file in your local server and add all variable values in dotenv

For Instance:

BRIGHTDATA_API_KEY=<YOUR_BRIGHTDATA_API_KEY>
BRIGHTDATA_US_PROXY=brd-customer-<CUSTOMER_ID>-zone-<YOUR_ZONE_ID>-country-<COUNTRY>

Add all variables and their value just like above

Make sure you use 2-letter country code like for united states use only - US
```

5. **Start the server**
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

- `GET /resolve?url=<URL>&region=<REGION_CODE>&uaType=desktop|mobile`
  Resolve a single URL for a specified region with a specific user agent type.

- `GET /resolve-multiple?url=<URL>&regions=us,ca,ae`  
  Resolve a URL across multiple regions simultaneously.

- `GET /resolve-multiple?url=<URL>&regions=us,ca,ae&uaTyp=desktop|mobile`
  Resolve a URL across multiple regions simultaneously with a specific user agent type.

- `GET /zone-usage?from=YYYY-MM-DD&to=YYYY-MM-DD`  
  Retrieve BrightData API usage statistics for the configured zone.

- `GET /regions`  
  List all supported proxy regions.

- `GET /system-info`  
  Get system health and resource usage information.

- `GET /ip`  
  Returns the client IP address.

## Campaign link generator
- **Dashboard:** Access the dashboard at `https://your-campaign-url.com/` (replace with your actual campaign URL).
- **Add Campaigns:** Enter campaign URL, tags/notes, and select country, then click "Add Campaign".
- **Refresh URLs:** Refresh individual or all campaign URLs to get updated final resolved URLs.
- **Import/Export:** Import campaigns from CSV or XLSX files; export current campaigns to CSV.
- **Filtering and Sorting:** Search campaigns, filter by date range, and sort by newest, oldest, or import order.
- **Delete Campaigns:** Delete individual or all campaigns.
- **Edit Campaigns:** Edit campaign details, including URL, tags, and notes.
- **User Agent Selection:** Select user agent type (desktop or mobile) for each campaign.

## API Request Analytics
- Access the dashboard at `/analytics/stats.html`
- View campaign statistics, including date, total requests and bandwidth etc.
- Filter by date range & search requests by date.
- Export data to CSV.

## URL Resolution Stats
- Access the dashboard at `/resolution-stats/resolutions.html`
- View URL resolution statistics, including total requests, successful and failed requests, and bandwidth etc.
- Filter by date range & search requests by date.
- Export data to CSV.
- View the stats in a table format.
- View stats by regional performance 

## ⏱️ Timing Statistics Dashboard
- Access the dashboard at `/timing-stat/timing-stat.html`.
- View daily statistics for total time, average time per URL, and request counts.
- Filter by date range, sort results, and export timing data as CSV.
- The dashboard is fully responsive and mobile-friendly.

### Sample Response
```json
{
  "originalUrl": "https://your-campaign-url.com",
  "finalUrl": "https://final-destination.com?clickid=123&utm_source=campaign",
  "method": "browser-api",
  "hasClickId": true,
  "hasUtmSource": true,
  "hasClickRef": false
  //more paramenters
}
```

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
