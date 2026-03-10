FROM node:18 AS build

WORKDIR /app

COPY frontend/package*.json ./

RUN npm ci

COPY frontend/ .

RUN NEXT_TELEMETRY_DISABLED=1 npx next build --no-lint
RUN test -f next.config.js || echo 'module.exports = {}' > next.config.js

FROM node:18-alpine AS production

WORKDIR /app

COPY --from=build /app/.next ./.next
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/public ./public
COPY --from=build /app/next.config.js ./next.config.js

ENV NODE_ENV=production

USER node

EXPOSE 3000

CMD ["npm", "start"]