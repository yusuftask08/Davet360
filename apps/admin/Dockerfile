# apps/admin — Next.js standalone build. NEXT_PUBLIC_* değişkenleri build ANINDA client
# bundle'a gömülür — bu yüzden runtime env değil, Coolify'da "Build Args" olarak verilmeli.
FROM node:20-alpine AS base
RUN npm install -g turbo@^2 pnpm@^9

FROM base AS pruner
WORKDIR /app
COPY . .
RUN turbo prune @repo/admin --docker

FROM base AS installer
WORKDIR /app
COPY --from=pruner /app/out/json/ .
RUN pnpm install --frozen-lockfile
COPY --from=pruner /app/out/full/ .

ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_PANEL_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL \
    NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL \
    NEXT_PUBLIC_PANEL_URL=$NEXT_PUBLIC_PANEL_URL

RUN npx turbo run build --filter=@repo/admin

FROM node:20-alpine AS runner
WORKDIR /app
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 adminrunner
COPY --from=installer /app/apps/admin/public ./apps/admin/public
COPY --from=installer --chown=adminrunner:nodejs /app/apps/admin/.next/standalone ./
COPY --from=installer --chown=adminrunner:nodejs /app/apps/admin/.next/static ./apps/admin/.next/static
USER adminrunner
EXPOSE 3000
ENV PORT=3000 HOSTNAME=0.0.0.0
CMD ["node", "apps/admin/server.js"]
