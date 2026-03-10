FROM node:18-slim AS build

WORKDIR /app

COPY backend/package*.json ./

RUN npm ci

COPY backend/ .

RUN npm run build

FROM node:18-slim

WORKDIR /app

COPY backend/package*.json ./
RUN npm ci --only=production

COPY --from=build /app/dist ./dist

RUN sed -i '1s/^/const crypto = require("crypto");\n/' /app/node_modules/@nestjs/typeorm/dist/common/typeorm.utils.js

RUN echo '#!/bin/sh' > /app/startup.sh && \
    echo 'export NODE_TLS_REJECT_UNAUTHORIZED=0' >> /app/startup.sh && \
    echo 'exec npm run start:prod' >> /app/startup.sh && \
    chmod +x /app/startup.sh

EXPOSE 3000

CMD ["/app/startup.sh"]