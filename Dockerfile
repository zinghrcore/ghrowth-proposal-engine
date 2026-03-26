FROM node:18

# Root app folder
WORKDIR /app

# -------- Backend --------
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm install

COPY backend ./

# -------- Frontend --------
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install

COPY frontend ./
RUN npm run build

# -------- Start backend --------
WORKDIR /app/backend
EXPOSE 5000
CMD ["npm", "start"]