FROM node:20-alpine
WORKDIR /app
LABEL course.student="11082007"
COPY package*.json ./
RUN npm install --omit=dev
COPY . .
RUN mkdir -p /data && chown -R node /data /app
USER node
EXPOSE 8000
CMD ["node", "src/index.js"]