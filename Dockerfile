FROM node:18

# Root app folder
WORKDIR /app

# -------- Backend --------
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm install

COPY backend ./

# Install frontend dependencies and build (CRA bakes REACT_APP_API_URL at build time)
# For sub-path hosting under /zhrproposalengine, default API base is /zhrproposalengine
ARG REACT_APP_API_URL=/zhrproposalengine
ENV REACT_APP_API_URL=${REACT_APP_API_URL}
# PUBLIC_URL controls CRA asset paths (static/js, static/css)
ARG PUBLIC_URL=/zhrproposalengine
ENV PUBLIC_URL=${PUBLIC_URL}

WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install

COPY frontend ./
RUN npm run build

# -------- Start backend --------
WORKDIR /app/backend
EXPOSE 5000
CMD ["npm", "start"]