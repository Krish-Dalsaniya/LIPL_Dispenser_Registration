# Use the official Node.js 20-alpine image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the frontend source code
COPY . .

# Expose Vite's default port
EXPOSE 5173

# Start the development server and allow external access
CMD ["npm", "run", "dev", "--", "--host"]
