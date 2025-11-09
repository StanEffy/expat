# Backend Environment Configuration Fix

## Current Issue
The backend needs to be configured to accept connections from both desktop and mobile devices.

## Correct Configuration

The backend should:
1. **Listen on `0.0.0.0:8000`** (all interfaces) - NOT `127.0.0.1`
2. **CORS origin** should be set to your frontend URL
3. **Allow connections** from external IPs

## Updated Environment Variables

Create or update `~/projects/expat-back/expat-app/.env` with:

```bash
# Backend port and host binding
EXPAT_BACKEND_PORT=8000
EXPAT_BACKEND_HOST=0.0.0.0  # IMPORTANT: 0.0.0.0, not 127.0.0.1

EXPAT_APP_ENV=production

# Database configuration
EXPAT_DB_HOST=expat-db
EXPAT_DB_PORT=5432
EXPAT_DB_USER=expat_user
EXPAT_DB_NAME=expat
EXPAT_POSTGRES_PASSWORD=DPpi6Vuf7N

# JWT and security
EXPAT_JWT_SIGNING_KEY=1yktt<`!D?lJnHSi[!HJuXlwF>jQwT
EXPAT_INVITE_CODE=9965

# Frontend CORS origin - allow requests from these origins
# Replace YOUR_SERVER_IP with your actual server IP address
EXPAT_FRONTEND_ORIGIN=http://YOUR_SERVER_IP,http://localhost:3000,http://127.0.0.1:3000

# Token expiry
EXPAT_ACCESS_TOKEN_EXPIRY=3600
EXPAT_REFRESH_TOKEN_EXPIRY=604800

# Database ports (if needed)
EXPAT_DB_HOST_PORT=5432
EXPAT_DB_CONTAINER_PORT=5432
```

## Key Changes Needed in Backend Code

### 1. Check how the server starts

Look for where the backend server starts (usually in `main.py`, `app.py`, or similar):

**For FastAPI/Uvicorn:**
```python
import uvicorn

if __name__ == "__main__":
    host = os.getenv("EXPAT_BACKEND_HOST", "0.0.0.0")  # Default to 0.0.0.0
    port = int(os.getenv("EXPAT_BACKEND_PORT", "8000"))
    uvicorn.run(app, host=host, port=port)
```

**For Django:**
```python
# In manage.py or settings
host = os.getenv("EXPAT_BACKEND_HOST", "0.0.0.0")
port = int(os.getenv("EXPAT_BACKEND_PORT", "8000"))
runserver_command = f"{host}:{port}"
```

**For Flask:**
```python
if __name__ == "__main__":
    host = os.getenv("EXPAT_BACKEND_HOST", "0.0.0.0")
    port = int(os.getenv("EXPAT_BACKEND_PORT", "8000"))
    app.run(host=host, port=port)
```

### 2. Check CORS configuration

Make sure CORS allows your frontend origin:

**FastAPI:**
```python
from fastapi.middleware.cors import CORSMiddleware

origins = os.getenv("EXPAT_FRONTEND_ORIGIN", "").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

**Django:**
```python
# settings.py
CORS_ALLOWED_ORIGINS = os.getenv("EXPAT_FRONTEND_ORIGIN", "").split(",")
# OR
CORS_ALLOW_ALL_ORIGINS = True  # For development only
```

### 3. Check Docker configuration (if using Docker)

If running in Docker, make sure the container exposes the port:

```yaml
# docker-compose.yml
services:
  backend:
    ports:
      - "0.0.0.0:8000:8000"  # Not "8000:8000"
    environment:
      - EXPAT_BACKEND_HOST=0.0.0.0
```

## Quick Fix Script

Run this in your backend directory:

```bash
cd ~/projects/expat-back/expat-app

# 1. Add EXPAT_BACKEND_HOST to .env
if ! grep -q "EXPAT_BACKEND_HOST" .env; then
    echo "EXPAT_BACKEND_HOST=0.0.0.0" >> .env
fi

# 2. Update frontend origin to include multiple origins
# Replace YOUR_SERVER_IP with your actual server IP address
sed -i 's|EXPAT_FRONTEND_ORIGIN=.*|EXPAT_FRONTEND_ORIGIN=http://YOUR_SERVER_IP,http://localhost:3000,http://127.0.0.1:3000|' .env

# 3. Verify the .env file
cat .env | grep -E "(EXPAT_BACKEND|EXPAT_FRONTEND)"
```

## Restart Backend

After making changes:

```bash
# If using systemd:
sudo systemctl restart expat-backend

# If using Docker:
docker-compose restart

# If running manually:
# Stop current process, then:
cd ~/projects/expat-back/expat-app
python main.py  # or however you start it
```

## Verify It Works

1. **Check if backend is listening on 0.0.0.0:**
   ```bash
   sudo ss -tlnp | grep 8000
   # Should show: tcp  0.0.0.0:8000  0.0.0.0:*   LISTEN
   ```

2. **Test from server:**
   ```bash
   curl http://localhost:8000/health
   curl http://127.0.0.1:8000/health
   curl http://YOUR_SERVER_IP:8000/health
   ```

3. **Test from desktop:**
   ```bash
   curl http://YOUR_SERVER_IP:8000/health
   ```

4. **Test from mobile:**
   - Open browser on mobile
   - Go to: `http://YOUR_SERVER_IP:8000/health`
   - Should get a response

## Important Notes

- **0.0.0.0** means "listen on all network interfaces" - this allows connections from anywhere
- **127.0.0.1** means "only localhost" - this blocks external connections
- The frontend origin in CORS should match where your frontend is served from
- Firewall might still block port 8000 - check with `sudo ufw status`

