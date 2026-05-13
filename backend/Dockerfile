FROM node:24-alpine
WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev --no-audit --no-fund
COPY server.js ./
COPY data ./data
EXPOSE 5678
ENV NODE_ENV=production
CMD ["node", "server.js"]
