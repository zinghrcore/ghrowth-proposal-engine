FROM node:18

# Root app folder
WORKDIR /app

# -------- Backend --------
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm install
<<<<<<< HEAD
=======

>>>>>>> 2290ac4263dd23bedba8c3344490cce1886be311

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