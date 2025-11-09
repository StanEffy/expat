#!/bin/bash

# Script to fix backend environment configuration
# This updates ~/projects/expat-back/expat-app/.env

BACKEND_DIR="$HOME/projects/expat-back/expat-app"
ENV_FILE="$BACKEND_DIR/.env"

echo "=== Fixing Backend Environment Configuration ==="
echo ""

# Check if backend directory exists
if [ ! -d "$BACKEND_DIR" ]; then
    echo "ERROR: Backend directory not found: $BACKEND_DIR"
    echo "Please update BACKEND_DIR in this script to match your backend location"
    exit 1
fi

# Create .env if it doesn't exist
if [ ! -f "$ENV_FILE" ]; then
    echo "Creating new .env file..."
    touch "$ENV_FILE"
fi

# Backup existing .env
if [ -f "$ENV_FILE" ]; then
    cp "$ENV_FILE" "${ENV_FILE}.backup.$(date +%Y%m%d_%H%M%S)"
    echo "Backed up existing .env file"
fi

# Function to set or update env variable
set_env_var() {
    local key=$1
    local value=$2
    local file=$3
    
    if grep -q "^${key}=" "$file"; then
        # Update existing value
        sed -i "s|^${key}=.*|${key}=${value}|" "$file"
        echo "Updated: ${key}=${value}"
    else
        # Add new value
        echo "${key}=${value}" >> "$file"
        echo "Added: ${key}=${value}"
    fi
}

echo ""
echo "Updating environment variables..."

# Set backend host to 0.0.0.0 (allows external connections)
set_env_var "EXPAT_BACKEND_HOST" "0.0.0.0" "$ENV_FILE"

# Update frontend origin to allow multiple origins
# Replace YOUR_SERVER_IP with your actual server IP address
set_env_var "EXPAT_FRONTEND_ORIGIN" "http://YOUR_SERVER_IP,http://localhost:3000,http://127.0.0.1:3000" "$ENV_FILE"

# Ensure backend port is set
set_env_var "EXPAT_BACKEND_PORT" "8000" "$ENV_FILE"

echo ""
echo "=== Updated .env file ==="
echo ""
echo "Key configuration:"
grep -E "(EXPAT_BACKEND_HOST|EXPAT_BACKEND_PORT|EXPAT_FRONTEND_ORIGIN)" "$ENV_FILE" || echo "No matching variables found"
echo ""

echo "=== Next Steps ==="
echo ""
echo "1. Make sure your backend code reads EXPAT_BACKEND_HOST and uses it when starting the server"
echo "2. Restart your backend service"
echo "3. Verify with: sudo ss -tlnp | grep 8000"
echo "   (Should show 0.0.0.0:8000, not 127.0.0.1:8000)"
echo ""

