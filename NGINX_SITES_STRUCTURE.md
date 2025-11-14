# Nginx Sites Directory Structure Explained

## 📁 Directory Structure

```
/etc/nginx/
├── nginx.conf                    # Main Nginx configuration
├── sites-available/              # All available site configs (inactive)
│   ├── default                   # Default site config (comes with Nginx)
│   ├── example.com               # Your site 1 config (you create)
│   └── codeshare.example.com     # Your site 2 config (you create)
└── sites-enabled/                # Active site configs (symbolic links)
    ├── default -> ../sites-available/default
    ├── example.com -> ../sites-available/example.com
    └── codeshare.example.com -> ../sites-available/codeshare.example.com
```

---

## 🎯 **What is `sites-available`?**

**`/etc/nginx/sites-available/`** is a directory that stores **all your website configuration files**, whether they are active or not.

### **Think of it as:**
- 📂 **Storage folder** - All site configs live here
- 🔌 **Inactive by default** - Configs here don't affect Nginx until enabled
- 📝 **Safe to edit** - Edit/test configs without affecting live sites

---

## 🎯 **What is `sites-enabled`?**

**`/etc/nginx/sites-enabled/`** contains **symbolic links** (shortcuts) to configs in `sites-available/`.

### **Think of it as:**
- ✅ **Active sites only** - Only linked configs are served by Nginx
- 🔗 **Symbolic links** - Just pointers to real files in `sites-available/`
- 🚀 **What Nginx actually reads** - Nginx loads configs from here

---

## 🔍 **The `default` File**

### **What is it?**

The `default` file is the **default website configuration** that comes with Nginx installation.

```bash
# View the default config
cat /etc/nginx/sites-available/default
```

**Typical content:**
```nginx
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    
    root /var/www/html;
    index index.html index.htm;
    
    server_name _;  # Catch-all (matches any domain)
    
    location / {
        try_files $uri $uri/ =404;
    }
}
```

### **What does it do?**

- Serves the **default Nginx welcome page** (`Welcome to nginx!`)
- **Catches all requests** that don't match any other `server_name`
- Located at: `/var/www/html/index.nginx-debian.html`

---

## 🛠️ **How to Add Your Own Sites**

### **Step 1: Create Config in `sites-available`**

```bash
# Create a new config file for your site
sudo nano /etc/nginx/sites-available/mysite.com
```

**Example config:**
```nginx
server {
    listen 80;
    server_name mysite.com www.mysite.com;
    
    root /var/www/mysite;
    index index.html;
    
    location / {
        try_files $uri $uri/ =404;
    }
}
```

**Save and exit** (Ctrl+X, Y, Enter)

---

### **Step 2: Enable the Site (Create Symbolic Link)**

```bash
# Create symbolic link from sites-enabled to sites-available
sudo ln -s /etc/nginx/sites-available/mysite.com /etc/nginx/sites-enabled/

# Verify the link was created
ls -la /etc/nginx/sites-enabled/
# Output:
# lrwxrwxrwx 1 root root 35 Jan 01 12:00 mysite.com -> /etc/nginx/sites-available/mysite.com
```

---

### **Step 3: Test Configuration**

```bash
# Test if config is valid
sudo nginx -t

# Output if successful:
# nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
# nginx: configuration file /etc/nginx/nginx.conf test is successful
```

---

### **Step 4: Reload Nginx**

```bash
# Reload to apply changes (no downtime)
sudo systemctl reload nginx

# OR restart (brief downtime)
sudo systemctl restart nginx
```

---

## 📋 **Common Commands**

### **List All Available Sites:**
```bash
ls -la /etc/nginx/sites-available/
```

### **List All Enabled Sites:**
```bash
ls -la /etc/nginx/sites-enabled/
```

### **Enable a Site:**
```bash
sudo ln -s /etc/nginx/sites-available/mysite.com /etc/nginx/sites-enabled/
```

### **Disable a Site:**
```bash
sudo rm /etc/nginx/sites-enabled/mysite.com
# Note: This only removes the link, not the actual config file
```

### **Edit a Site Config:**
```bash
sudo nano /etc/nginx/sites-available/mysite.com
```

### **Delete a Site Config:**
```bash
# First disable it
sudo rm /etc/nginx/sites-enabled/mysite.com

# Then delete the config
sudo rm /etc/nginx/sites-available/mysite.com
```

---

## 🔍 **Check Current Configuration**

### **See What Sites Are Active:**
```bash
# List enabled sites
ls -l /etc/nginx/sites-enabled/

# Output example:
# lrwxrwxrwx 1 root root 34 Jan 01 default -> /etc/nginx/sites-available/default
# lrwxrwxrwx 1 root root 35 Jan 02 mysite.com -> /etc/nginx/sites-available/mysite.com
```

### **Test Which Site Nginx Will Serve:**
```bash
# Check Nginx configuration
sudo nginx -T

# OR filter for specific site
sudo nginx -T | grep -A 20 "server_name mysite.com"
```

---

## 🎯 **Real-World Example: Two Sites on One Server**

### **Scenario:**
- Existing site: `example.com`
- New site: `codeshare.example.com`
- Both on same server

### **Step-by-Step:**

**1. Create config for existing site:**
```bash
sudo nano /etc/nginx/sites-available/example.com
```

**Content:**
```nginx
server {
    listen 80;
    server_name example.com www.example.com;
    root /var/www/example;
    index index.html;
    
    location / {
        try_files $uri $uri/ =404;
    }
}
```

**2. Create config for CodeShare:**
```bash
sudo nano /etc/nginx/sites-available/codeshare.example.com
```

**Content:**
```nginx
server {
    listen 80;
    server_name codeshare.example.com;
    
    location / {
        root /var/www/codeshare/frontend/build;
        try_files $uri $uri/ /index.html;
    }
    
    location /api/ {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
    }
}
```

**3. Enable both sites:**
```bash
sudo ln -s /etc/nginx/sites-available/example.com /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/codeshare.example.com /etc/nginx/sites-enabled/
```

**4. Disable default (optional):**
```bash
sudo rm /etc/nginx/sites-enabled/default
```

**5. Test and reload:**
```bash
sudo nginx -t
sudo systemctl reload nginx
```

**6. Check what's enabled:**
```bash
ls -la /etc/nginx/sites-enabled/
# Output:
# lrwxrwxrwx 1 root root 35 example.com -> ../sites-available/example.com
# lrwxrwxrwx 1 root root 45 codeshare.example.com -> ../sites-available/codeshare.example.com
```

---

## 🚫 **Should You Remove the `default` File?**

### **When to Keep:**
- ✅ Testing server (shows "Welcome to nginx!" page)
- ✅ Catch-all for undefined domains
- ✅ Temporary placeholder

### **When to Remove/Disable:**
```bash
# Disable default site
sudo rm /etc/nginx/sites-enabled/default

# Reload nginx
sudo systemctl reload nginx
```

### **Why Remove:**
- ❌ Security: Prevents showing default page when accessing by IP
- ❌ Professionalism: Don't want "Welcome to nginx!" showing
- ❌ Clarity: Only serve your actual sites

---

## 📊 **Directory Structure After Adding Sites**

```
/etc/nginx/
├── nginx.conf
├── sites-available/
│   ├── default                      # Default Nginx site (disable if not needed)
│   ├── example.com                  # Your existing site config
│   └── codeshare.example.com        # Your CodeShare config
└── sites-enabled/
    ├── example.com -> ../sites-available/example.com
    └── codeshare.example.com -> ../sites-available/codeshare.example.com
```

**Notice:** `default` is NOT in `sites-enabled` (disabled)

---

## 🔒 **After Adding SSL (Let's Encrypt)**

Certbot will **automatically modify** your config files:

```
/etc/nginx/sites-available/
├── example.com                   # Now includes SSL config
└── codeshare.example.com         # Now includes SSL config
```

**Example modified config:**
```nginx
# HTTP (redirect to HTTPS)
server {
    listen 80;
    server_name example.com www.example.com;
    return 301 https://$host$request_uri;
}

# HTTPS
server {
    listen 443 ssl http2;
    server_name example.com www.example.com;
    
    ssl_certificate /etc/letsencrypt/live/example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;
    
    root /var/www/example;
    index index.html;
}
```

---

## 🧪 **Troubleshooting**

### **Problem: Changes not taking effect**
```bash
# Did you reload Nginx?
sudo systemctl reload nginx

# Is the site enabled?
ls -la /etc/nginx/sites-enabled/

# Check for syntax errors
sudo nginx -t
```

### **Problem: Site not accessible**
```bash
# Check if site is enabled
ls -la /etc/nginx/sites-enabled/ | grep mysite

# Check Nginx status
sudo systemctl status nginx

# Check error logs
sudo tail -f /var/log/nginx/error.log
```

### **Problem: Symbolic link broken**
```bash
# Remove broken link
sudo rm /etc/nginx/sites-enabled/mysite.com

# Create new link
sudo ln -s /etc/nginx/sites-available/mysite.com /etc/nginx/sites-enabled/
```

---

## 📝 **Best Practices**

1. ✅ **Name configs by domain** - `example.com`, not `site1`
2. ✅ **Keep configs in `sites-available`** - Edit there, enable via link
3. ✅ **Test before reload** - Always run `sudo nginx -t`
4. ✅ **Disable unused sites** - Remove from `sites-enabled/`
5. ✅ **Comment your configs** - Add notes for future you
6. ✅ **Backup before changes** - `cp sites-available/site.com sites-available/site.com.backup`

---

## 🎯 **Quick Reference**

| Action | Command |
|---|---|
| Create config | `sudo nano /etc/nginx/sites-available/mysite.com` |
| Enable site | `sudo ln -s /etc/nginx/sites-available/mysite.com /etc/nginx/sites-enabled/` |
| Disable site | `sudo rm /etc/nginx/sites-enabled/mysite.com` |
| Test config | `sudo nginx -t` |
| Reload Nginx | `sudo systemctl reload nginx` |
| List available | `ls /etc/nginx/sites-available/` |
| List enabled | `ls /etc/nginx/sites-enabled/` |
| View logs | `sudo tail -f /var/log/nginx/error.log` |

---

## 🚀 **Summary**

- **`sites-available/`** = Storage for all site configs (active or not)
- **`sites-enabled/`** = Symbolic links to active sites only
- **`default`** = Default Nginx site (can be disabled)
- **Add sites** = Create in `sites-available/`, link to `sites-enabled/`
- **Enable/Disable** = Add/remove symbolic links in `sites-enabled/`

---

**Now you understand the structure!** Ready to add your CodeShare site? 🎉

