# Expat Frontend

React + Vite frontend application for the Expat company register.

## 🌟 Features

- 🎨 Modern UI with PrimeReact
- 🌍 Multi-language support (English, Finnish, Swedish, Russian, Ukrainian)
- 📱 Responsive design
- 🔐 JWT authentication & 2FA Admin Guard
- 🔍 Company search and filtering
- ⚡ Fast build with Vite

## 🛠️ Tech Stack

- **Framework**: React 19
- **Build Tool**: Vite 6
- **UI Library**: PrimeReact 10
- **Language**: TypeScript
- **Routing**: React Router 7
- **i18n**: i18next

## 🚀 Local Development

### Prerequisites

- Node.js 18 or higher
- npm

### Setup

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Edit .env.local with your backend URL if different from x-pat.duckdns.org:8000
# vim .env.local

# Start development server
npm run dev
```

The app will be available at **http://localhost:3000**

### Environment Variables

Create `.env.local` file:
```bash
VITE_API_BASE_URL=http://x-pat.duckdns.org:8000
```

## 🏗️ Building for Production

### Standard Build

```bash
# Build for production
npm run build

# Output will be in ./dist directory
ls -la dist/

# Preview production build locally
npm run preview
```

### Docker Build

```bash
# Build with default API URL (x-pat.duckdns.org:8000)
docker build -t expat-frontend .

# Build with custom API URL (RECOMMENDED for production)
docker build \
  --build-arg VITE_API_BASE_URL=https://api.expat.yourdomain.com \
  -t expat-frontend:v1.0.0 .

# Run the container locally
docker run -p 8080:80 expat-frontend:v1.0.0

# Access at http://localhost:8080
```

## ☸️ Kubernetes Deployment

This frontend is designed to be deployed to Kubernetes alongside the backend.

**Important**: The Kubernetes manifests are in the **backend repository** at:
```
vitalybrazhnikov/expat-app/k8s/
```

### Step 1: Build and Push Image

```bash
# Build with your production API URL
docker build \
  --build-arg VITE_API_BASE_URL=https://api.expat.yourdomain.com \
  -t your-registry/expat-frontend:v1.0.0 \
  .

# Push to your container registry
docker push your-registry/expat-frontend:v1.0.0
```

### Step 2: Update Backend Repo Manifest

In the backend repository, edit `k8s/frontend-deployment.yaml`:

```yaml
spec:
  containers:
  - name: frontend
    image: your-registry/expat-frontend:v1.0.0  # Update this line
    env:
    - name: VITE_API_BASE_URL
      value: "https://api.expat.yourdomain.com"  # Your backend API URL
```

### Step 3: Deploy

From the backend repository:
```bash
cd k8s
./deploy.sh
```

See the backend repository's `QUICK_START_K8S.md` for complete deployment instructions.

## 🌐 API Configuration

The frontend needs to know where the backend API is located.

### Development
```bash
# .env.local
VITE_API_BASE_URL=http://x-pat.duckdns.org:8000
```

### Production - Option 1: Build Time (Recommended)
```bash
docker build \
  --build-arg VITE_API_BASE_URL=https://api.expat.yourdomain.com \
  -t expat-frontend .
```

### Production - Option 2: Kubernetes Deployment
Set in backend repo's `k8s/frontend-deployment.yaml`:
```yaml
env:
- name: VITE_API_BASE_URL
  value: "https://api.expat.yourdomain.com"
```

## 📁 Project Structure
 
```
expat-app/
├── src/
│   ├── types/          # Centralized TypeScript domain interfaces & models
│   ├── services/       # Unified API client & domain service layer
│   ├── providers/      # Application-level providers composition (AppProviders)
│   ├── contexts/       # React Contexts (Auth, Favourites, Polls, Notifications)
│   ├── hooks/          # Custom reusable hooks (useAuth, useFavourites, etc.)
│   ├── components/     # Reusable UI components & layouts
│   │   ├── Common/     # Buttons, Cards, SEO, Inputs, LanguageSwitcher
│   │   ├── Companies/  # Company filter, search, editors
│   │   ├── Admin/      # 2FA modals, Admin guards, Admin layouts
│   │   └── Layouts/    # Root Layout with nested <Outlet />
│   ├── pages/          # Application routes (Lazy-loaded)
│   │   ├── Home.tsx
│   │   ├── Companies.tsx
│   │   ├── CompanyDetails.tsx
│   │   ├── Polls.tsx, PollDetail.tsx
│   │   ├── Profile.tsx
│   │   ├── Login.tsx
│   │   ├── NotFound.tsx (404)
│   │   └── admin/      # Admin dashboard, user management, audit logs
│   ├── constants/      # App constants & API endpoints
│   ├── utils/          # Token management, 2FA validation, formatting
│   ├── i18n/           # Internationalization config & translations
│   ├── styles/         # Global SCSS variables, mixins, animations
│   └── assets/         # Images, fonts, SVG icons
├── public/             # Static public assets
├── Dockerfile          # Production Docker build
├── nginx.conf          # Nginx configuration for production
├── vite.config.ts      # Vite configuration with chunk splitting & path aliases
└── package.json        # Dependencies & scripts
```

## 📜 Available Scripts

- `npm run dev` - Start development server (port 3000)
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🌍 Languages

The application supports:
- 🇬🇧 English (en)
- 🇫🇮 Finnish (fi)
- 🇸🇪 Swedish (sv)
- 🇷🇺 Russian (ru)
- 🇺🇦 Ukrainian (uk)

Language files are in `src/i18n/locales/` and `public/locales/`.

## 🔌 API Integration

Backend API endpoints are defined in `src/constants/api.ts`.

### Key Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/sign-in` | User login |
| POST | `/auth/sign-up` | User registration |
| GET | `/auth/profile` | Get user profile |
| GET | `/api/companies/` | List companies (paginated) |
| GET | `/api/companies/:id` | Get company details |

## 🐛 Troubleshooting

### Frontend can't connect to backend

**Check:**
1. `VITE_API_BASE_URL` is set correctly
2. Backend CORS is enabled
3. Backend is running and accessible

```bash
# Test API connectivity
curl http://x-pat.duckdns.org:8000/health
```

### Build issues

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf node_modules/.vite
```

### Docker build issues

```bash
# Build without cache
docker build --no-cache -t expat-frontend .
```

### 404 on page refresh in production

This is already handled! The `nginx.conf` includes:
```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

## 🧪 Testing

### Test Local Docker Build

```bash
# Build the image
docker build -t expat-frontend-test .

# Run it
docker run -p 8080:80 expat-frontend-test

# Access at http://localhost:8080
```

### Test with Backend

```bash
# Make sure backend is running
# Then build frontend with backend URL
docker build \
  --build-arg VITE_API_BASE_URL=http://x-pat.duckdns.org:8000 \
  -t expat-frontend-test .

docker run -p 8080:80 expat-frontend-test
```

## 📦 Deployment Options

### Option 1: Separate Subdomains (Recommended)

```
Frontend: https://expat.yourdomain.com
Backend:  https://api.expat.yourdomain.com
```

```bash
docker build \
  --build-arg VITE_API_BASE_URL=https://api.expat.yourdomain.com \
  -t expat-frontend .
```

### Option 2: Path-Based Routing

```
Frontend: https://expat.com/
Backend:  https://expat.com/api
```

```bash
docker build \
  --build-arg VITE_API_BASE_URL=/api \
  -t expat-frontend .
```

## 🔒 Security

- ✅ Security headers configured in nginx.conf
- ✅ HTTPS via Kubernetes ingress
- ✅ No sensitive data in frontend code
- ✅ Tokens stored securely in localStorage
- ✅ CORS handled by backend

## ⚡ Performance

- ✅ Gzip compression (reduces bundle size)
- ✅ Static asset caching (1 year for immutable files)
- ✅ Code splitting via React lazy loading
- ✅ Tree shaking (removes unused code)
- ✅ Minification in production builds

## 🔗 Related Repositories

- **Backend Repository**: https://github.com/vitalybrazhnikov/expat-app
  - Kubernetes manifests are here: `k8s/`
  - Deployment instructions: `QUICK_START_K8S.md`

- **Frontend Repository**: https://github.com/StanEffy/expat (this repo)

## 📝 License

[Add your license here]

---

## 🎯 Quick Start Summary

1. **Local Development**: `npm install && npm run dev`
2. **Build for Production**: `docker build --build-arg VITE_API_BASE_URL=https://api.yourdomain.com -t expat-frontend .`
3. **Deploy to Kubernetes**: Push image, update backend repo's K8s manifest, run `./deploy.sh`

**Need help?** See the backend repository's documentation at `vitalybrazhnikov/expat-app`



