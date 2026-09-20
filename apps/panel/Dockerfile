# apps/panel — Next.js standalone build. NEXT_PUBLIC_* değişkenleri build ANINDA client
# bundle'a gömülür — bu yüzden runtime env değil, Coolify'da "Build Args" olarak verilmeli.
FROM node:20-alpine AS base
RUN npm install -g turbo@^2 pnpm@^9

FROM base AS pruner
WORKDIR /app
COPY . .
RUN turbo prune @repo/panel --docker

FROM base AS installer
WORKDIR /app
COPY --from=pruner /app/out/json/ .
RUN pnpm install --frozen-lockfile
COPY --from=pruner /app/out/full/ .

ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL \
    NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL

RUN npx turbo run build --filter=@repo/panel

FROM node:20-alpine AS runner
WORKDIR /app
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 panelrunner
COPY --from=installer /app/apps/panel/public ./apps/panel/public
COPY --from=installer --chown=panelrunner:nodejs /app/apps/panel/.next/standalone ./
COPY --from=installer --chown=panelrunner:nodejs /app/apps/panel/.next/static ./apps/panel/.next/static
USER panelrunner
EXPOSE 3000
ENV PORT=3000 HOSTNAME=0.0.0.0
CMD ["node", "apps/panel/server.js"]
