FROM node:18

# Root app folder
WORKDIR /app

# -------- Backend --------
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm install

COPY backend ./

# Install frontend dependencies and build (CRA bakes REACT_APP_API_URL at build time)
# Example: docker build --build-arg REACT_APP_API_URL=https://api.yourdomain.com .
# Same host as UI: use empty string so axios calls /api/... on the same origin
ARG REACT_APP_API_URL=
ENV REACT_APP_API_URL=${REACT_APP_API_URL}

WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install

COPY frontend ./
RUN npm run build

# -------- Start backend --------
WORKDIR /app/backend
EXPOSE 5000
CMD ["npm", "start"]