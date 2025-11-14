# Nginx Multi-Site Configuration Guide

## 🎯 Scenario
You have **one server** running **two separate websites**:
1. **Existing Site** (already running)
2. **CodeShare** (new site to add)

---

## 📋 **Option 1: Subdomain-Based** ⭐ **RECOMMENDED**

### **Best for:**
- ✅ Clean URLs (no path prefixes)
- ✅ Independent deployments
- ✅ Better SEO
- ✅ Simpler frontend routing
- ✅ Professional appearance

### **URL Structure:**
```
https://existing-site.com          → Existing site
https://codeshare.existing-site.com → CodeShare site
```

### **Nginx Configuration:**

**File: `/etc/nginx/sites-available/existing-site.com`**
```nginx
# Existing site (no changes needed if already configured)
server {
    listen 80;
    listen [::]:80;
    server_name existing-site.com www.existing-site.com;
    
    # Your existing site configuration
    root /var/www/existing-site;
    index index.html index.htm;
    
    location / {
        try_files $uri $uri/ =404;
    }
}
```

**File: `/etc/nginx/sites-available/codeshare.existing-site.com`**
```nginx
# CodeShare site (NEW)
server {
    listen 80;
    listen [::]:80;
    server_name codeshare.existing-site.com;
    
    # Frontend - React app
    location / {
        root /var/www/codeshare/frontend/build;
        index index.html;
        try_files $uri $uri/ /index.html;
        
        # Enable gzip compression (in addition to Express compression)
        gzip on;
        gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript;
        gzip_min_length 1000;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
    
    # Backend API
    location /api/ {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Increase timeout for long requests
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }
    
    # Socket.IO (if using separate socket server on 8081)
    location /socket.io/ {
        proxy_pass http://localhost:8081;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

**Enable the site:**
```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/codeshare.existing-site.com /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx
```

**DNS Configuration:**
```
A     codeshare.existing-site.com    → Your-Server-IP
```

---

## 📋 **Option 2: Path-Based Routing** 

### **Best for:**
- ✅ Single domain
- ✅ No DNS changes needed
- ✅ Shared SSL certificate
- ❌ More complex frontend routing
- ❌ Longer URLs

### **URL Structure:**
```
https://existing-site.com/          → Existing site
https://existing-site.com/share/    → CodeShare site
```

### **Nginx Configuration:**

**File: `/etc/nginx/sites-available/existing-site.com`**
```nginx
server {
    listen 80;
    listen [::]:80;
    server_name existing-site.com www.existing-site.com;
    
    # Existing site (root path)
    location / {
        root /var/www/existing-site;
        index index.html index.htm;
        try_files $uri $uri/ =404;
    }
    
    # CodeShare site (under /share/ path)
    location /share/ {
        alias /var/www/codeshare/frontend/build/;
        index index.html;
        try_files $uri $uri/ /share/index.html;
        
        # Enable gzip
        gzip on;
        gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
    
    # CodeShare API (under /share/api/)
    location /share/api/ {
        # Rewrite to remove /share prefix before proxying
        rewrite ^/share/api/(.*)$ /api/$1 break;
        
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### **⚠️ Frontend Changes Required for Path-Based:**

**1. Update `package.json`:**
```json
{
  "homepage": "/share",
  "scripts": {
    "build": "react-scripts build"
  }
}
```

**2. Update `BrowserRouter` in `App.js`:**
```javascript
import { BrowserRouter } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter basename="/share">
      {/* Your routes */}
    </BrowserRouter>
  );
}
```

**3. Update `config.json`:**
```json
{
    "backend_url": "https://existing-site.com/share/api",
    "backend_socket_url": "https://existing-site.com/share/socket.io",
    "auction_url": "https://codeshare.auctionng.org"
}
```

**4. Rebuild frontend:**
```bash
cd frontend
npm run build
```

---

## 📋 **Option 3: Different Domain Names**

### **Best for:**
- ✅ Completely independent sites
- ✅ Best SEO
- ✅ Simplest configuration
- ❌ Need separate domains

### **URL Structure:**
```
https://existing-site.com    → Existing site
https://codeshare.io         → CodeShare site
```

### **Nginx Configuration:**

**File: `/etc/nginx/sites-available/codeshare.io`**
```nginx
server {
    listen 80;
    listen [::]:80;
    server_name codeshare.io www.codeshare.io;
    
    # Same configuration as Option 1 (subdomain)
    # ...
}
```

---

## 🔒 **SSL/HTTPS Configuration (All Options)**

### **Using Let's Encrypt (Free):**

```bash
# Install Certbot
sudo apt update
sudo apt install certbot python3-certbot-nginx

# For Subdomain approach:
sudo certbot --nginx -d codeshare.existing-site.com

# For Path-based approach (single cert):
sudo certbot --nginx -d existing-site.com -d www.existing-site.com

# For Different domain approach:
sudo certbot --nginx -d codeshare.io -d www.codeshare.io

# Auto-renewal (already set up by default)
sudo certbot renew --dry-run
```

### **After SSL, Nginx config auto-updates to:**
```nginx
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name codeshare.existing-site.com;
    
    ssl_certificate /etc/letsencrypt/live/codeshare.existing-site.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/codeshare.existing-site.com/privkey.pem;
    
    # ... rest of configuration
}

# HTTP to HTTPS redirect
server {
    listen 80;
    listen [::]:80;
    server_name codeshare.existing-site.com;
    return 301 https://$host$request_uri;
}
```

---

## 📊 **Comparison Table**

| Feature | Subdomain ⭐ | Path-Based | Different Domain |
|---|---|---|---|
| **URL** | codeshare.site.com | site.com/share/ | codeshare.io |
| **DNS Setup** | Add A record | No change | New domain |
| **Frontend Changes** | None | `basename="/share"` | None |
| **Config Changes** | Update URLs | Update URLs + paths | Update URLs |
| **SEO** | Excellent | Good | Excellent |
| **Complexity** | Low | Medium | Low |
| **Isolation** | High | Medium | High |
| **Cost** | Free | Free | Domain cost |

---

## ⭐ **Recommended Approach: Subdomain**

### **Why?**
1. ✅ **Clean URLs** - No `/share/` prefix in every URL
2. ✅ **No frontend changes** - React Router works as-is
3. ✅ **Better SEO** - Search engines prefer subdomains
4. ✅ **Independent caching** - Different cache policies per site
5. ✅ **Easy SSL** - Separate certificates or wildcard cert
6. ✅ **Professional** - Looks more polished

### **Setup Steps:**

**1. DNS Configuration:**
```
A     codeshare.yourdomain.com    →  Your-Server-IP
```

**2. Create Nginx config:**
```bash
sudo nano /etc/nginx/sites-available/codeshare.yourdomain.com
# Paste configuration from Option 1
```

**3. Enable site:**
```bash
sudo ln -s /etc/nginx/sites-available/codeshare.yourdomain.com /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

**4. Get SSL certificate:**
```bash
sudo certbot --nginx -d codeshare.yourdomain.com
```

**5. Update frontend config:**
```json
// frontend/public/config.json
{
    "backend_url": "https://codeshare.yourdomain.com/api",
    "backend_socket_url": "https://codeshare.yourdomain.com",
    "auction_url": "https://codeshare.auctionng.org"
}
```

**6. Deploy:**
```bash
# Build frontend
cd frontend && npm run build

# Copy to server
scp -r build/* user@server:/var/www/codeshare/frontend/build/
```

---

## 🎯 **Complete Nginx Config Example (Production-Ready)**

### **For Subdomain Approach:**

```nginx
# HTTP to HTTPS redirect
server {
    listen 80;
    listen [::]:80;
    server_name codeshare.yourdomain.com;
    return 301 https://$host$request_uri;
}

# HTTPS server
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name codeshare.yourdomain.com;
    
    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/codeshare.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/codeshare.yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    
    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # Frontend - React app
    location / {
        root /var/www/codeshare/frontend/build;
        index index.html;
        try_files $uri $uri/ /index.html;
        
        # Gzip compression
        gzip on;
        gzip_vary on;
        gzip_min_length 1000;
        gzip_proxied any;
        gzip_types text/plain text/css text/xml text/javascript 
                   application/json application/javascript application/xml+rss 
                   application/atom+xml image/svg+xml;
        gzip_disable "msie6";
        
        # Cache static assets aggressively
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
            access_log off;
        }
        
        # Cache HTML with shorter duration
        location ~* \.(html)$ {
            expires 1h;
            add_header Cache-Control "public, must-revalidate";
        }
    }
    
    # Backend API
    location /api/ {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        
        # WebSocket support
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        
        # Standard headers
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Disable caching for API
        proxy_cache_bypass $http_upgrade;
        proxy_no_cache 1;
        
        # Timeouts
        proxy_connect_timeout 75s;
        proxy_read_timeout 300s;
        proxy_send_timeout 300s;
        
        # Buffer settings
        proxy_buffering on;
        proxy_buffer_size 4k;
        proxy_buffers 8 4k;
        proxy_busy_buffers_size 8k;
    }
    
    # Socket.IO (if separate server)
    location /socket.io/ {
        proxy_pass http://localhost:8081;
        proxy_http_version 1.1;
        
        # WebSocket upgrade
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        
        # Standard headers
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        
        # Long timeout for persistent connections
        proxy_read_timeout 3600s;
        proxy_send_timeout 3600s;
    }
    
    # Rate limiting for API
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
    limit_req zone=api_limit burst=20 nodelay;
    
    # Access logs
    access_log /var/log/nginx/codeshare_access.log;
    error_log /var/log/nginx/codeshare_error.log;
}
```

---

## 🚀 **Quick Start Commands**

### **For Subdomain Approach (Recommended):**

```bash
# 1. Create nginx config
sudo nano /etc/nginx/sites-available/codeshare.yourdomain.com

# 2. Enable site
sudo ln -s /etc/nginx/sites-available/codeshare.yourdomain.com /etc/nginx/sites-enabled/

# 3. Test config
sudo nginx -t

# 4. Reload nginx
sudo systemctl reload nginx

# 5. Get SSL certificate
sudo certbot --nginx -d codeshare.yourdomain.com

# 6. Deploy frontend
cd /var/www/codeshare/frontend
npm run build

# Done! Visit https://codeshare.yourdomain.com
```

---

## 🔍 **Troubleshooting**

### **Issue: 502 Bad Gateway**
```bash
# Check if backend is running
curl http://localhost:8080/api/

# Check nginx error logs
sudo tail -f /var/log/nginx/error.log

# Check backend logs
pm2 logs codeshare-backend
```

### **Issue: Static files not loading**
```bash
# Check file permissions
ls -la /var/www/codeshare/frontend/build/

# Should be readable by nginx user
sudo chown -R www-data:www-data /var/www/codeshare/frontend/build/
```

### **Issue: API CORS errors**
- Ensure `ALLOWED_ORIGIN` in backend `.env` includes the subdomain:
```env
ALLOWED_ORIGIN=https://codeshare.yourdomain.com
```

---

## 📚 **Resources**

- [Nginx Server Blocks](https://nginx.org/en/docs/http/request_processing.html)
- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)
- [React Router Basename](https://reactrouter.com/web/api/BrowserRouter/basename-string)

---

## 🎯 **My Recommendation**

**Use Subdomain approach** (`codeshare.yourdomain.com`) because:
1. ✅ Zero frontend code changes
2. ✅ Clean, professional URLs
3. ✅ Better SEO
4. ✅ Easier to maintain
5. ✅ Independent caching policies
6. ✅ Simple Nginx config

**Avoid path-based** (`yourdomain.com/share/`) unless:
- You cannot create DNS records
- You must use a single domain
- Willing to modify frontend `basename`

---

**Ready to proceed?** Let me know which approach you prefer and I can help with the specific configuration! 🚀

