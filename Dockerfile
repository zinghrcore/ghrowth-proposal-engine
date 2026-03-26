FROM node:18

WORKDIR /app

# Copy only package files first (better caching)
COPY backend/package*.json ./backend/

WORKDIR /app/backend
RUN npm install

# Copy full backend code
COPY backend .

# Frontend build
WORKDIR /app
COPY frontend ./frontend

WORKDIR /app/frontend
RUN npm install
RUN npm run build

# Back to backend
WORKDIR /app/backend

EXPOSE 5000

CMD ["npm", "start"]
