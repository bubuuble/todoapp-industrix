# Gunakan Node.js versi ringan
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files & install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Build TypeScript ke JavaScript (folder dist)
RUN npm run build

# Expose port
EXPOSE 4000

# Jalankan aplikasi (dist/src/index.js)
CMD ["node", "dist/src/index.js"]