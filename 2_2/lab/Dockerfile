FROM node:20-alpine
WORKDIR /app
LABEL course.student="11082007"
COPY package*.json ./
RUN npm install --production
COPY . .
RUN adduser -D appuser \
    && mkdir -p /data \
    && chown -R appuser /data /app
USER appuser
EXPOSE 8000
CMD ["node", "src/index.js"]