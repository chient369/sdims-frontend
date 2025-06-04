# Stage 1: Build the React application
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock or pnpm-lock.yaml)
COPY package.json package-lock.json* ./
# If you are using yarn, uncomment the next line and comment out the npm ci line
# COPY yarn.lock ./
# If you are using pnpm, uncomment the next two lines and comment out the npm ci line
# COPY pnpm-lock.yaml ./
# RUN npm install -g pnpm && pnpm install --frozen-lockfile

# Install dependencies
# Use npm ci for cleaner installs if package-lock.json is committed and up-to-date
RUN npm ci
# If you prefer npm install, use this instead:
# RUN npm install

# Copy the rest of the application code
COPY . .

# Build the application (uses the script from package.json)
# Ensure your build script in package.json is correctly configured (e.g., "vite build")
RUN npm run build

# Stage 2: Serve the application with Nginx
FROM nginx:1.25-alpine AS production

# Copy the build output from the builder stage
# Vite typically builds to a 'dist' directory
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy the Nginx configuration file
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start Nginx when the container launches
CMD ["nginx", "-g", "daemon off;"] 