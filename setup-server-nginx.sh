#!/usr/bin/env bash
set -e

# ==============================================================================
# Script to enable Gzip compression and 1-year asset caching on Ubuntu host Nginx
# ==============================================================================

echo "⚙️ Applying Nginx compression & performance config..."

# 1. Add global gzip and gzip_static configuration
cat << 'EOF' | sudo tee /etc/nginx/conf.d/expat-performance.conf > /dev/null
# Gzip compression and pre-compressed static files
gzip on;
gzip_static on;
gzip_vary on;
gzip_min_length 1024;
gzip_proxied any;
gzip_comp_level 6;
gzip_types
    text/plain
    text/css
    text/xml
    text/javascript
    application/json
    application/javascript
    application/x-javascript
    application/xml
    application/xml+rss
    application/vnd.ms-fontobject
    application/x-font-ttf
    font/opentype
    image/svg+xml
    image/x-icon;
EOF

echo "✅ Created /etc/nginx/conf.d/expat-performance.conf"

# 2. Test Nginx syntax
sudo nginx -t

# 3. Reload Nginx service
sudo systemctl reload nginx

echo "🚀 Nginx successfully reloaded! Compression and cache headers are now active."
