FROM node:20-alpine AS base

WORKDIR /app
RUN apk add --no-cache libc6-compat

FROM base AS deps

COPY package*.json ./
RUN npm ci

FROM deps AS build

ARG NEXT_PUBLIC_API_URL=/api
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

COPY . .
RUN npm run build

FROM base AS runner

ENV NODE_ENV=production
ENV PORT=3001
ENV HOSTNAME=0.0.0.0

COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static

EXPOSE 3001

CMD ["node", "server.js"]
