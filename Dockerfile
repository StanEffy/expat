# Build stage
FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Set environment variables for the build
ENV REACT_APP_API_URL=http://localhost:${EXPAT_APP_PORT}
ENV REACT_APP_API_VERSION=v1

RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built assets from build stage
COPY --from=build /app/build /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose the port that matches your frontend port
EXPOSE ${EXPAT_APP_PORT}

# Start nginx
CMD ["nginx", "-g", "daemon off;"]