import express from "express";
import puppeteer from "puppeteer-core";
import { config as dotenv } from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import helmet, { referrerPolicy } from "helmet";
import rateLimit from "express-rate-limit";
import os from 'os';
import basicAuth from 'express-basic-auth';
import https from 'https';

dotenv();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const PORT = process.env.PORT || 8080;

// Define authentication configuration
const authConfig = {
  users: { 'admin': 'Admin@$%6677' },
  challenge: true,
  realm: 'Private Area',
  unauthorizedResponse: req => '🚫 Unauthorized Access',
};

// Apply Basic Authentication to multiple routes
//app.use('/', basicAuth(authConfig));
//app.use('/resolve', basicAuth(authConfig));
//app.use('/analytics', basicAuth(authConfig));
//app.use('/resolve-multiple', basicAuth(authConfig));

// Serve static frontend
app.use(express.static(path.join(__dirname, "public")));

// Enhanced middleware stack
app.use(helmet({
  contentSecurityPolicy: false, // Enable and customize as needed
  referrerPolicy : {
    policy: "no-referrer",
  },
})); // Security headers

// Enable CORS
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
  : null;

if (!allowedOrigins) {
  console.error('[CORS] ERROR: ALLOWED_ORIGINS environment variable is not set.');
  process.exit(1); // Or handle it another way, like disabling CORS
}
console.log('[CORS] Allowed origins:', allowedOrigins);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
// End CORS setup

app.use(express.json({ limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: process.env.RATE_LIMIT || 100, // limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/resolve', limiter);

app.set('trust proxy', 1);

// BRIGHTDATA_API_USAGE_CONFIG
const API_KEY = process.env.BRIGHTDATA_API_KEY;
const ZONE = process.env.BRIGHTDATA_ZONE;

// Region to proxy zone mapping
const regionZoneMap = {
  US: process.env.BRIGHTDATA_US_PROXY,
  CA: process.env.BRIGHTDATA_CA_PROXY,
  GB: process.env.BRIGHTDATA_GB_PROXY,
  IN: process.env.BRIGHTDATA_IN_PROXY,
  AU: process.env.BRIGHTDATA_AU_PROXY,
  DE: process.env.BRIGHTDATA_DE_PROXY,
  FR: process.env.BRIGHTDATA_FR_PROXY,
  JP: process.env.BRIGHTDATA_JP_PROXY,
  SG: process.env.BRIGHTDATA_SG_PROXY,
  BR: process.env.BRIGHTDATA_BR_PROXY,
  TW: process.env.BRIGHTDATA_TW_PROXY,
  CZ: process.env.BRIGHTDATA_CZ_PROXY,
  UA: process.env.BRIGHTDATA_UA_PROXY,
  AE: process.env.BRIGHTDATA_AE_PROXY,
  PL: process.env.BRIGHTDATA_PL_PROXY,
  ES: process.env.BRIGHTDATA_ES_PROXY,
  ID: process.env.BRIGHTDATA_ID_PROXY,
  ZA: process.env.BRIGHTDATA_ZA_PROXY,
  MX: process.env.BRIGHTDATA_MX_PROXY,
  MY: process.env.BRIGHTDATA_MY_PROXY,
  IT: process.env.BRIGHTDATA_IT_PROXY
};

//Make sure all proxy values exist at runtime or fail fast on startup.
Object.entries(regionZoneMap).forEach(([region, zone]) => {
    if (!zone) {
      console.warn(`⚠️ Missing proxy config for region: ${region}`);
    }
});

//Load regions
console.log("Loaded all available proxy regions:", Object.keys(regionZoneMap).filter(r => regionZoneMap[r]));

// Helper to get browser WebSocket endpoint
function getBrowserWss(regionCode) {
  const zone = regionZoneMap[regionCode?.toUpperCase()];
  const password = process.env.BRIGHTDATA_PASSWORD;

  if (!zone || !password) {
    throw new Error(`Missing proxy configuration for region: ${regionCode}`);
  }

  return `wss://${zone}:${password}@brd.superproxy.io:9222`;
}

// Random User-Agents
const userAgents = {
  desktop: [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 13_3) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:124.0) Gecko/20100101 Firefox/124.0",
  ],
  mobile: [
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
    "Mozilla/5.0 (Linux; Android 14; SM-S926B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 16_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) FxiOS/123.0 Mobile/15E148 Safari/605.1.15",
    "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36",
  ]
};

// Helper: Randomly pick desktop or mobile UA and related settings
function getRandomUserAgent() {
  const type = Math.random() < 0.5 ? 'desktop' : 'mobile';
  const uaList = userAgents[type];
  const userAgent = uaList[Math.floor(Math.random() * uaList.length)];
  return { userAgent, isMobile: type === 'mobile' };
}

// Main Puppeteer logic
async function resolveWithBrowserAPI(inputUrl, region = "US") {
  const browserWSEndpoint = getBrowserWss(region);
  const browser = await puppeteer.connect({ browserWSEndpoint });

  try {
    const page = await browser.newPage();

    // ✅ Set custom User-Agent before navigating
    const { userAgent, isMobile } = getRandomUserAgent();
    console.log(`[INFO] Using ${isMobile ? 'Mobile' : 'Desktop'} User-Agent:\n${userAgent}`);
    await page.setUserAgent(userAgent);

    // Set realistic viewport based on UA type
    if (isMobile) {
      await page.setViewport({
        width: 375 + Math.floor(Math.random() * 20) - 10,
        height: 812 + Math.floor(Math.random() * 20) - 10,
        isMobile: true,
        hasTouch: true,
        deviceScaleFactor: 2,
      });
    } else {
      await page.setViewport({
        width: 1366 + Math.floor(Math.random() * 20) - 10,
        height: 768 + Math.floor(Math.random() * 20) - 10,
        isMobile: false,
      });
    }

    page.setDefaultNavigationTimeout(30000);

    // Determine navigation timeout (use env variable or fallback to 60 seconds)
    const timeout = Number(process.env.NAVIGATION_TIMEOUT) || 60000;

    if (!process.env.NAVIGATION_TIMEOUT) {
        console.log("[INFO] Using default timeout of 60000 ms");
    } else {
        console.log(`[INFO] Using navigation timeout: ${timeout} ms`);
    }

    // Validate the input URL
    if (!inputUrl || typeof inputUrl !== 'string' || !inputUrl.startsWith('http')) {
        console.error('[ERROR] Invalid or missing input URL:', inputUrl);
        process.exit(1);
    }

    // Attempt to navigate to the URL with the specified timeout and handle errors gracefully
    try {
      await page.goto(inputUrl, { waitUntil: "networkidle0", timeout: timeout });
    } catch (err) {
      console.error(`[ERROR] Failed to navigate to ${inputUrl}:`, err.message);
    }

    // Optional wait
    await page.waitForSelector("body", {timeout: 120000});

    // Get resolved final URL
    const finalUrl = page.url();

    // Detect IP info from inside the browser
    const ipData = await page.evaluate(async () => {
      try {
        const res = await fetch("https://get.geojs.io/v1/ip/geo.json");
        return await res.json(); // { ip, country_name, region, city, etc. }
      } catch (e) {
        return { error: "IP lookup failed" };
      }
    });
    return { finalUrl, ipData };
  } catch(err){
    console.log(`[ERROR] ${err.message}`);
    return {error: err.message};
  } finally {
    await browser.disconnect();
  }
}

// API route: /resolve?url=https://domain.com&region=ua
app.get("/resolve", async (req, res) => {
  const { url: inputUrl, region = "US" } = req.query;

  if (!inputUrl) {
    return res.status(400).json({ error: "Missing URL parameter" });
  }

  try {
    new URL(inputUrl);
  } catch {
    return res.status(400).json({ error: "Invalid URL format" });
  }

  console.log(`⌛ Requested new URL: ${inputUrl}`);
  console.log(`🌐 Resolving URL for region [${region}]:`, inputUrl);

  try {
    const { finalUrl, ipData } = await resolveWithBrowserAPI(inputUrl, region);
    console.log(`URL Resolution Completed For: ${inputUrl}`);
    console.log(`→ Original URL: ${inputUrl}`);
    
    if(finalUrl){
      console.log(`→ Final URL   : ${finalUrl}`);
    } else {
      console.log(`⚠️ Final URL could not be resolved.`);
    }

    console.log(`→ URLs Resolved with [${region}] Check IP Data ⤵`);
    if (ipData?.ip) {
        console.log(`🌍 IP Info : ${ipData.ip} (${ipData.country || "Unknown Country"} - ${ipData.region || "Unknown Region"} - ${ipData.country_code || "Unknown country_code"})`);
        console.log(`🔍 Region Match: ${ipData.country_code?.toUpperCase() === region.toUpperCase() ? '✅ YES' : '❌ NO'}`);
    }

    const hasClickId = finalUrl ? finalUrl.includes("clickid=") || finalUrl.includes("clickId=") : false;

    return res.json({
      originalUrl: inputUrl,
      finalUrl,
      region,
      requestedRegion: region,
      actualRegion: ipData?.country_code?.toUpperCase() || 'Unknown',
      regionMatch: ipData?.country_code?.toUpperCase() === region.toUpperCase(),
      method: "browser-api",
      hasClickId,
      hasClickRef: finalUrl?.includes("clickref="),
      hasUtmSource: finalUrl?.includes("utm_source="),
      hasImRef: finalUrl?.includes("im_ref="),
      hasMtkSource: finalUrl?.includes("mkt_source="),
      hasTduId: finalUrl?.includes("tduid="),
      hasPublisherId: finalUrl?.includes("publisherId="),
      ipData // Region detection info
    });
  } catch (err) {
    console.error(`❌ Resolution failed:`, err.stack || err.message);
    return res.status(500).json({ error: "❌ Resolution failed", details: err.message });
  }
});

//Allow users to request resolution across multiple regions at once, getting all the resolved URLs at the same time.
// Endpoint to access this - /resolve-multiple?url=https://domain.com&regions=us,ca,ae
app.get('/resolve-multiple', async (req, res) => {
  const { url: inputUrl, regions } = req.query;

  if (!inputUrl || !regions) {
    return res.status(400).json({ error: "Missing parameters" });
  }

  const regionList = regions.split(',');
  const promises = regionList.map(region => resolveWithBrowserAPI(inputUrl, region));
  const results = await Promise.all(promises);

  res.json({
    originalUrl: inputUrl,
    results: results.map((result, index) => ({
      region: regionList[index],
      finalUrl: result.finalUrl,
      ipData: result.ipData,
    })),
  });
});

// Track BrightData API Usage Using Endpoint /zone-usage - /zone-usage?from=YYYY-MM-DD&to=YYYY-MM-DD
app.get('/zone-usage', (req, res) => {
  const { from, to } = req.query;

  if (!from || !to) {
    return res.status(400).json({
      error: 'Please provide both "from" and "to" query parameters in YYYY-MM-DD format.',
    });
  }

  const options = {
    hostname: 'api.brightdata.com',
    path: `/zone/bw?zone=${ZONE}&from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      Accept: 'application/json',
    },
    rejectUnauthorized: false, // ignore SSL certificate issues
  };

  const apiReq = https.request(options, (apiRes) => {
    let data = '';

    apiRes.on('data', (chunk) => {
      data += chunk;
    });

    apiRes.on('end', () => {
      try {
        const json = JSON.parse(data);
        console.log('Raw API response:', json); // Log the raw response to verify

        const result = {};
        
        // Access the zone data
        const zoneData = json.c_a4a3b5b0.data?.[ZONE]; // Access the zone data
        const { reqs_browser_api } = zoneData || {};

        console.log('Zone data:', zoneData); // Log zone data for clarity

        if (reqs_browser_api) {
          // Create a list of dates between 'from' and 'to'
          const dates = getDatesBetween(from, to);

          // Match dates to request data
          dates.forEach((date, index) => {
            if (reqs_browser_api[index]) {
              result[date] = reqs_browser_api[index]; // Map request count to date
            }
          });
        }

        res.json(result); // Return the result object
      } catch (e) {
        console.error('Error parsing response:', e); // Log the error
        res.status(500).json({
          error: 'Failed to parse Bright Data API response.',
          details: e.message,
        });
      }
    });
  });

  apiReq.on('error', (e) => {
    console.error('Request error:', e.message); // Log the request error
    res.status(500).json({
      error: 'Request to Bright Data API failed.',
      details: e.message,
    });
  });

  apiReq.end();
});

// Helper function to get all dates between 'from' and 'to'
function getDatesBetween(startDate, endDate) {
  const dates = [];
  const currentDate = new Date(startDate);
  const end = new Date(endDate);

  while (currentDate <= end) {
    dates.push(currentDate.toISOString().split('T')[0]); // Format as YYYY-MM-DD
    currentDate.setDate(currentDate.getDate() + 1); // Move to the next day
  }

  return dates;
}

// Regions check
app.get("/regions", (req, res) => {
  res.json(Object.keys(regionZoneMap));
});

app.get("/system-info", (req, res) => {
  const memoryUsage = process.memoryUsage();
  const uptime = process.uptime();
  const loadAverage = os.loadavg();
  const totalMemory = os.totalmem();
  const freeMemory = os.freemem();

  const healthCheck = {
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(uptime)} seconds`,
    memory: {
      rss: `${(memoryUsage.rss / 1024 / 1024).toFixed(2)} MB`,
      heapTotal: `${(memoryUsage.heapTotal / 1024 / 1024).toFixed(2)} MB`,
      heapUsed: `${(memoryUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`,
      external: `${(memoryUsage.external / 1024 / 1024).toFixed(2)} MB`,
    },
    loadAverage: {
      "1m": loadAverage[0].toFixed(2),
      "5m": loadAverage[1].toFixed(2),
      "15m": loadAverage[2].toFixed(2),
    },
    memoryStats: {
      total: `${(totalMemory / 1024 / 1024).toFixed(2)} MB`,
      free: `${(freeMemory / 1024 / 1024).toFixed(2)} MB`,
    },
    cpu: {
      cores: os.cpus().length,
      model: os.cpus()[0].model,
    },
    healthy: freeMemory / totalMemory > 0.1 && loadAverage[0] < os.cpus().length,
  };

  res.status(200).json(healthCheck);
});

// Fallback for homepage
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Get the usage.html file from analytics folder and making an endpoint
app.get('/analytics/usage.html', basicAuth(authConfig), (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'analytics', 'usage.html'));
});

// IP endpoint
app.get('/ip', (req, res) => {
  const rawIp =
    req.headers['x-forwarded-for']?.split(',')[0] ||
    req.socket?.remoteAddress ||
    req.ip;

  // Remove IPv6 prefix if present
  const clientIp = rawIp?.replace(/^::ffff:/, '');

  console.log(`Client IP: ${clientIp}`);
  res.send({ ip : clientIp });
});

//Keep Render service awake by pinging itself every 14 minutes
setInterval(() => {
  const url = 'https://tracetoend.onrender.com/'; // Replace with your actual Render URL

  https.get(url, (res) => {
    console.log(`[KEEP-AWAKE] Pinged self. Status code: ${res.statusCode}`);
  }).on('error', (err) => {
    console.error('[KEEP-AWAKE] Self-ping error:', err.message);
  });
}, 14 * 60 * 1000); // every 10 minutes

app.listen(PORT, () => {
  console.log(`🚀 Region-aware resolver running at http://localhost:${PORT}`);
});