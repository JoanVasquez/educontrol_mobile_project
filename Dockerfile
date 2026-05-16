FROM node:22-bookworm-slim

WORKDIR /app

ENV NG_CLI_ANALYTICS=false
ENV CHOKIDAR_USEPOLLING=true

COPY package*.json ./
RUN npm ci && chown -R node:node /app

COPY --chown=node:node . .

EXPOSE 8100

USER node

CMD ["npm", "run", "start", "--", "--host", "0.0.0.0", "--port", "8100", "--poll", "2000"]
