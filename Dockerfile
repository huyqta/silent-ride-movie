# Base image
FROM node:20-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
# Using the version specified in packageManager
RUN corepack prepare pnpm@10.32.1 --activate

# Stage 1: Prune the monorepo
FROM base AS pruner
WORKDIR /app
RUN pnpm add -g turbo
COPY . .
RUN turbo prune silent-ride --docker

# Stage 2: Install dependencies and build
FROM base AS builder
WORKDIR /app

# Copy pruned monorepo metadata
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy the rest of the source
COPY --from=pruner /app/out/full/ .
COPY turbo.json turbo.json

# Environment variables for build time (if needed for static generation)
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY

# Build the project
RUN pnpm turbo build --filter=silent-ride

# Stage 3: Runner
FROM node:20-slim AS runner
WORKDIR /app

ENV NODE_ENV=production

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

# Copy static assets and standalone build
COPY --from=builder /app/apps/web/public ./apps/web/public

# Standalone mode copies all necessary files (including node_modules from other packages)
# into a single directory.
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static

# Note: In standalone mode, the entry point for the app is server.js inside the app folder
# For Turborepo, it's usually at apps/web/server.js
EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "apps/web/server.js"]
