FROM oven/bun:1 AS base

WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

FROM base AS development
ENV NODE_ENV=development
COPY . .
EXPOSE 3000
CMD ["bun", "run", "dev"]

FROM base AS builder
COPY . .
ARG NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
ARG NEXT_PUBLIC_SUPABASE_URL

ENV NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=$NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL

RUN bun run build

FROM oven/bun:1 AS prod
WORKDIR /app
ENV NODE_ENV=production

# Copy the standalone output (contains server.js and minimal node_modules)
COPY --from=builder /app/.next/standalone ./

# Copy static files to where standalone expects them
COPY --from=builder /app/.next/static ./.next/static

# Copy public folder to where standalone expects it
COPY --from=builder /app/public ./public

EXPOSE 3000
CMD ["bun", "server.js"]
