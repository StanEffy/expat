# Kubernetes Deployment Instructions

## 📍 Important: Where Are the Kubernetes Files?

The Kubernetes manifests (YAML files) are located in the **backend repository**, not here.

**Backend Repository**: `vitalybrazhnikov/expat-app`
**Location**: `/k8s/` directory

This is intentional - it allows the backend and frontend to be deployed together to the same Kubernetes cluster while being maintained as separate projects.

## 🏗️ Architecture

```
Backend Repo (vitalybrazhnikov/expat-app)
└── k8s/
    ├── namespace.yaml               # Kubernetes namespace
    ├── configmap.yaml              # Configuration
    ├── secrets.yaml.example        # Secrets template
    ├── postgres-*.yaml             # Database
    ├── backend-*.yaml              # Backend API
    ├── frontend-*.yaml             # This frontend! ⭐
    ├── ingress.yaml                # External access
    └── deploy.sh                   # Deployment script

Frontend Repo (this repo - StanEffy/expat)
└── src/                            # Your React code
    └── Dockerfile                  # Build instructions
```

## 🚀 Deployment Process

### Step 1: Build Docker Image (Do This Here)

In this frontend repository:

```bash
# Build the Docker image with your production API URL
docker build \
  --build-arg VITE_API_BASE_URL=https://api.expat.yourdomain.com \
  -t your-registry/expat-frontend:v1.0.0 \
  .

# Example with Docker Hub:
docker build \
  --build-arg VITE_API_BASE_URL=https://api.expat.yourdomain.com \
  -t yourusername/expat-frontend:v1.0.0 \
  .

# Example with GitHub Container Registry:
docker build \
  --build-arg VITE_API_BASE_URL=https://api.expat.yourdomain.com \
  -t ghcr.io/staneff/expat-frontend:v1.0.0 \
  .

# Push to registry
docker push your-registry/expat-frontend:v1.0.0
```

### Step 2: Update Kubernetes Manifest (In Backend Repo)

Go to the backend repository and edit the frontend deployment:

```bash
# Navigate to backend repository
cd /path/to/vitalybrazhnikov/expat-app

# Edit the frontend deployment
vim k8s/frontend-deployment.yaml
```

Update the image reference (around line 20):

```yaml
spec:
  containers:
  - name: frontend
    # Update this line with your image
    image: your-registry/expat-frontend:v1.0.0
    
    # Optional: Update API URL if needed
    env:
    - name: VITE_API_BASE_URL
      value: "https://api.expat.yourdomain.com"
```

### Step 3: Deploy (From Backend Repo)

```bash
# Still in backend repository
cd k8s

# Deploy everything (or just frontend)
./deploy.sh

# Or deploy just the frontend manually
kubectl apply -f frontend-deployment.yaml
kubectl apply -f frontend-service.yaml
```

### Step 4: Verify

```bash
# Check if frontend pods are running
kubectl get pods -n expat -l app=expat-frontend

# Check frontend logs
kubectl logs -f -l app=expat-frontend -n expat

# Check frontend service
kubectl get svc expat-frontend-service -n expat

# Check ingress
kubectl get ingress expat-ingress -n expat
```

## 📋 Complete Deployment Checklist

### In This Repo (Frontend)

- [ ] Updated `src/constants/api.ts` with environment variable
- [ ] Updated `Dockerfile` with correct Vite configuration
- [ ] Added `nginx.conf` for production
- [ ] Built Docker image with correct API URL
- [ ] Pushed image to container registry
- [ ] Noted the image tag (e.g., `v1.0.0`)

### In Backend Repo

- [ ] Cloned/accessed backend repo: `vitalybrazhnikov/expat-app`
- [ ] Copied `k8s/secrets.yaml.example` to `k8s/secrets.yaml`
- [ ] Filled in secrets (passwords, JWT key, invite code)
- [ ] Updated `k8s/configmap.yaml` with frontend URL
- [ ] Updated `k8s/frontend-deployment.yaml` with your image
- [ ] Updated `k8s/ingress.yaml` with your domains
- [ ] Ran `cd k8s && ./deploy.sh`

## 🔧 Environment Configuration

### Build Time (Recommended)

Set the API URL when building the Docker image:

```bash
docker build \
  --build-arg VITE_API_BASE_URL=https://api.expat.yourdomain.com \
  -t expat-frontend:v1.0.0 \
  .
```

### Kubernetes Deployment Time

Or set it in the Kubernetes deployment manifest (backend repo):

```yaml
# k8s/frontend-deployment.yaml
env:
- name: VITE_API_BASE_URL
  value: "https://api.expat.yourdomain.com"
```

## 🌐 API URL Options

### Option 1: Separate Subdomains (Recommended)

```bash
# Frontend: https://expat.yourdomain.com
# Backend:  https://api.expat.yourdomain.com

docker build \
  --build-arg VITE_API_BASE_URL=https://api.expat.yourdomain.com \
  -t expat-frontend .
```

Configure in backend repo's `k8s/ingress.yaml`:
```yaml
rules:
- host: expat.yourdomain.com        # Frontend
- host: api.expat.yourdomain.com    # Backend
```

### Option 2: Path-Based Routing

```bash
# Frontend: https://expat.com/
# Backend:  https://expat.com/api

docker build \
  --build-arg VITE_API_BASE_URL=/api \
  -t expat-frontend .
```

Configure in backend repo's `k8s/ingress.yaml`:
```yaml
rules:
- host: expat.com
  paths:
  - path: /api    # Backend
  - path: /       # Frontend
```

## 🧪 Testing Before Production

### Test Docker Image Locally

```bash
# Build
docker build \
  --build-arg VITE_API_BASE_URL=http://localhost:8000 \
  -t expat-frontend-test \
  .

# Run
docker run -p 8080:80 expat-frontend-test

# Visit http://localhost:8080
```

### Test in Kubernetes with Port-Forward

```bash
# After deploying to K8s
kubectl port-forward -n expat svc/expat-frontend-service 3000:80

# Visit http://localhost:3000
```

## 🔄 Updating the Deployment

When you make changes to the frontend:

```bash
# 1. Build new image (in this frontend repo)
docker build \
  --build-arg VITE_API_BASE_URL=https://api.expat.yourdomain.com \
  -t your-registry/expat-frontend:v1.0.1 \
  .

docker push your-registry/expat-frontend:v1.0.1

# 2. Update in Kubernetes (from backend repo)
kubectl set image deployment/expat-frontend \
  frontend=your-registry/expat-frontend:v1.0.1 \
  -n expat

# 3. Check rollout status
kubectl rollout status deployment/expat-frontend -n expat

# 4. Verify
kubectl get pods -n expat -l app=expat-frontend
```

## 🆘 Troubleshooting

### Can't find Kubernetes manifests?

They're in the **backend repository**: `vitalybrazhnikov/expat-app/k8s/`

### Frontend not connecting to backend?

1. Check API URL in the build:
```bash
# Inspect Docker image
docker run -it your-registry/expat-frontend:v1.0.0 sh
# Inside container, check if VITE_API_BASE_URL was set correctly
```

2. Check backend CORS settings

3. Check if backend is accessible:
```bash
kubectl exec -it <frontend-pod> -n expat -- wget -O- http://expat-backend-service:8000/health
```

### Image pull errors?

1. Check image name is correct in `k8s/frontend-deployment.yaml`
2. Check image exists in registry
3. Check registry authentication (if private registry)

### 404 on page refresh?

Already fixed! The `nginx.conf` includes SPA routing support.

## 📚 Full Documentation

For complete documentation, see the backend repository:

- **Quick Start**: `vitalybrazhnikov/expat-app/QUICK_START_K8S.md`
- **Complete Guide**: `vitalybrazhnikov/expat-app/KUBERNETES_DEPLOYMENT.md`
- **Architecture**: `vitalybrazhnikov/expat-app/PROJECT_ARCHITECTURE.md`
- **K8s Details**: `vitalybrazhnikov/expat-app/k8s/README.md`

## 🎯 Quick Command Reference

```bash
# In FRONTEND repo (this repo):
docker build --build-arg VITE_API_BASE_URL=https://api.yourdomain.com -t registry/expat-frontend:v1 .
docker push registry/expat-frontend:v1

# In BACKEND repo:
cd k8s
vim frontend-deployment.yaml  # Update image
./deploy.sh

# Check deployment:
kubectl get pods -n expat
kubectl logs -f -l app=expat-frontend -n expat
```

## ✅ Summary

1. **Frontend code lives here** (StanEffy/expat)
2. **Kubernetes manifests live in backend repo** (vitalybrazhnikov/expat-app/k8s/)
3. **Build Docker image here**, push to registry
4. **Update manifest in backend repo**, deploy from there
5. **Both projects work together** in the same Kubernetes cluster

This separation allows:
- ✅ Independent development
- ✅ Separate release schedules
- ✅ Different teams can own each project
- ✅ But they still deploy to the same environment

---

**Ready to deploy?** Follow the steps above! 🚀


