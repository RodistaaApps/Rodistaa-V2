# Dockerfile for Mock Services
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package.json ./

# Install dependencies
RUN npm install --omit=dev

# Copy source code
COPY dist ./dist

# Expose port
EXPOSE 3000

# Start the mock server
CMD ["node", "dist/index.js"]

