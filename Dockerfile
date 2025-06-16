# Base image
FROM node:20-slim

# Set working directory
WORKDIR /app

# Copy only package files for caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Expose port
EXPOSE 3000

# Run the JavaScript app
CMD ["node", "src/app.js"]
