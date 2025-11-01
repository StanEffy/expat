# Backend Connection Troubleshooting

## Problem: ERR_CONNECTION_REFUSED on port 8000

When the frontend (or mobile) tries to connect to `http://YOUR_SERVER_IP:8000`, it gets connection refused.

## Common Causes & Fixes

### 1. Backend only listening on localhost (127.0.0.1)

**Problem**: Backend is running but only accepts connections from `localhost`, not from external IPs.

**How to check**:
```bash
# On the server, check what interface the backend is listening on
sudo ss -tlnp | grep 8000
# OR
sudo netstat -tlnp | grep 8000
```

**What you'll see if it's wrong**:
```
tcp   0.0.0.0:8000   127.0.0.1:8000    LISTEN     # WRONG - only localhost
```

**What you need**:
```
tcp   0.0.0.0:8000   0.0.0.0:8000      LISTEN     # CORRECT - all interfaces
```

**How to fix** (depends on your backend framework):

#### If using FastAPI/Uvicorn:
```bash
# Instead of:
uvicorn main:app --host 127.0.0.1 --port 8000

# Use:
uvicorn main:app --host 0.0.0.0 --port 8000
```

#### If using Django:
```python
# In settings.py or runserver:
python manage.py runserver 0.0.0.0:8000
```

#### If using Flask:
```python
# app.run(host='0.0.0.0', port=8000)
```

#### If using Docker:
```bash
# Make sure you expose the port:
docker run -p 0.0.0.0:8000:8000 your-backend-image
# OR in docker-compose.yml:
ports:
  - "0.0.0.0:8000:8000"
```

### 2. Backend not running

**Check if backend is running**:
```bash
ps aux | grep -i expat
ps aux | grep python
ps aux | grep uvicorn
```

**Start the backend**:
```bash
cd ~/projects/expat-back/expat-app
# Check how to start it (usually):
# python manage.py runserver 0.0.0.0:8000
# OR
# uvicorn main:app --host 0.0.0.0 --port 8000
# OR check for a startup script
```

### 3. Firewall blocking port 8000

**Check firewall**:
```bash
sudo ufw status
# OR
sudo iptables -L -n | grep 8000
```

**Open port 8000** (if using UFW):
```bash
sudo ufw allow 8000/tcp
sudo ufw reload
```

**Or if using iptables directly**:
```bash
sudo iptables -A INPUT -p tcp --dport 8000 -j ACCEPT
```

### 4. Backend running on different port

**Check what port backend is actually using**:
```bash
sudo ss -tlnp | grep python
# OR check your backend configuration files
```

## Quick Diagnostic Script

Run this on your server (YOUR_SERVER_IP):

```bash
#!/bin/bash
echo "=== Backend Connection Diagnostics ==="
echo ""
echo "1. Checking if port 8000 is in use:"
sudo ss -tlnp | grep 8000 || echo "Port 8000 is NOT in use"
echo ""
echo "2. Checking backend processes:"
ps aux | grep -E "(expat|python|uvicorn|gunicorn)" | grep -v grep
echo ""
echo "3. Testing localhost connection:"
curl -s http://localhost:8000/health || curl -s http://localhost:8000/ || echo "Connection failed"
echo ""
echo "4. Testing external IP connection:"
curl -s http://YOUR_SERVER_IP:8000/health || curl -s http://YOUR_SERVER_IP:8000/ || echo "Connection failed"
echo ""
echo "5. Checking firewall:"
sudo ufw status 2>/dev/null || sudo iptables -L -n | grep 8000 || echo "No firewall rules found"
```

## Solution Summary

Most likely fix: **Change backend to listen on `0.0.0.0` instead of `127.0.0.1`**

1. Go to `~/projects/expat-back/expat-app`
2. Find where the server is started
3. Change `--host 127.0.0.1` to `--host 0.0.0.0`
4. Restart the backend
5. Verify: `sudo ss -tlnp | grep 8000` should show `0.0.0.0:8000`

## Testing After Fix

From your server:
```bash
curl http://YOUR_SERVER_IP:8000/health
```

From your mobile/desktop:
```bash
curl http://YOUR_SERVER_IP:8000/health
```

Both should work!


