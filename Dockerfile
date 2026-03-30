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

# Install frontend dependencies and build (CRA bakes REACT_APP_API_URL at build time)
# Example: docker build --build-arg REACT_APP_API_URL=https://api.yourdomain.com .
# Same host as UI: use empty string so axios calls /api/... on the same origin
ARG REACT_APP_API_URL=
ENV REACT_APP_API_URL=${REACT_APP_API_URL}

WORKDIR /app/frontend
RUN npm install
RUN npm run build

# Go back to backend
WORKDIR /app/backend

# Expose backend port
EXPOSE 5000

# Start backend server
CMD ["npm", "start"]
