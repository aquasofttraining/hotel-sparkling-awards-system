# 1. Folosește imaginea de bază
FROM node:20-slim

# 2. Setează directorul de lucru
WORKDIR /app

# 3. Copiază fișierele de configurare și instalează dependențele
COPY package*.json tsconfig.json ./
RUN npm install

# 4. Copiază codul sursă
COPY ./src ./src

# 5. Rulează compilarea TypeScript în container
RUN npx tsc

# 6. Expune portul aplicației
EXPOSE 3000

# 7. Rulează aplicația compilată
CMD ["node", "dist/app.js"]
