FROM node:20-alpine

# Needed for native modules like bcrypt
RUN apk add --no-cache make gcc g++ python3

WORKDIR /app

COPY package*.json tsconfig.json ./

# Only now do install to avoid copying Windows-built binaries
RUN npm install
RUN npm rebuild bcrypt --build-from-source

COPY ./src ./src

RUN npm run build

EXPOSE 3000

CMD ["node", "dist/app.js"]
