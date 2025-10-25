# Dockerfile
FROM node:18-alpine

# Create app dir
WORKDIR /usr/src/app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy source (including server.js and build artifacts if frontend bundled)
COPY . .

# If you build frontend assets in repo, uncomment a build step here
# RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]