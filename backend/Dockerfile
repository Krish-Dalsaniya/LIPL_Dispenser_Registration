# Use the official Node.js 20-alpine image as the base image
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json first to leverage Docker cache
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the backend source code
COPY . .

# Expose the port your backend runs on (defined in server.js/env)
EXPOSE 5000

# Command to run the backend application
CMD ["npm", "start"]
