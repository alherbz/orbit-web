FROM node:20-alpine
WORKDIR /app

# Install production dependencies first for better layer caching.
COPY package.json ./
RUN npm install --omit=dev || npm install

# Copy the application source explicitly so the runnable entrypoint
# (server.js) and static assets are guaranteed to land at /app.
COPY server.js ./server.js
COPY public ./public

ENV PORT=3000
EXPOSE 3000

# The project's own entrypoint. package.json "start" is also `node server.js`.
CMD ["node", "server.js"]
