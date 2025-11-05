# Admin Panel Discreet Endpoint Configuration

The admin panel uses a **discreet endpoint** that can be customized via environment variable to make it less obvious than standard paths like `/admin` or `/management`.

## Default Configuration

By default, the admin panel is accessible at:

```
/app-console
```

## Customization

You can customize the admin panel path by setting the `VITE_ADMIN_PANEL_PATH` environment variable.

### Development

Create a `.env` file in the project root:

```env
VITE_ADMIN_PANEL_PATH=/your-custom-path
```

### Examples of Discreet Paths

```env
# Less obvious options
VITE_ADMIN_PANEL_PATH=/app-console
VITE_ADMIN_PANEL_PATH=/tools
VITE_ADMIN_PANEL_PATH=/console
VITE_ADMIN_PANEL_PATH=/dashboard
VITE_ADMIN_PANEL_PATH=/sys-admin
VITE_ADMIN_PANEL_PATH=/internal
VITE_ADMIN_PANEL_PATH=/app-tools
```

### Production

Set the environment variable in your deployment configuration:

- **Docker**: Add to `docker-compose.yml` or Dockerfile
- **Kubernetes**: Add to deployment manifest or ConfigMap
- **Build-time**: Set during build process

## Important Notes

1. **Backend API**: The backend API endpoints still use `/management` - this only affects the frontend routes
2. **Security**: This is **obfuscation only** - proper security relies on:
   - Authentication (JWT tokens)
   - Admin role checking
   - 2FA verification
3. **Route Protection**: All admin routes are still protected by `AdminRouteGuard` regardless of the path

## How It Works

1. The `ADMIN_PANEL_PATH` constant is defined in `src/constants/api.ts`
2. It reads from `VITE_ADMIN_PANEL_PATH` environment variable
3. Falls back to `/app-console` if not set
4. All admin routes use this path dynamically:
   - `${ADMIN_PANEL_PATH}` - Dashboard
   - `${ADMIN_PANEL_PATH}/users` - User management
   - `${ADMIN_PANEL_PATH}/company-updates` - Company updates

## Testing

After changing the path, restart your development server:

```bash
npm run dev
```

Then navigate to your custom path (e.g., `/your-custom-path`) to access the admin panel.

