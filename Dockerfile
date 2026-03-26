# Use Node base image
FROM node:18

# Create app directory
WORKDIR /app

# Copy backend files
COPY backend ./backend

# Install backend dependencies
WORKDIR /app/backend
RUN npm install


# Copy frontend files
WORKDIR /app
COPY frontend ./frontend

# Install frontend dependencies
WORKDIR /app/frontend
RUN npm install
RUN npm run build

# Go back to backend
WORKDIR /app/backend

# Expose backend port
EXPOSE 5000

# Start backend server
CMD ["npm", "start"]
