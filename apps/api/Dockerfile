# apps/api — pnpm/Turborepo monorepo'dan sadece bu app'in ihtiyaç duyduğu paketleri
# (turbo prune) ayıklayıp minimal bir imaja kurar. Derleme adımı yok (düz Node/Express).
FROM node:20-alpine AS base
RUN npm install -g turbo@^2 pnpm@^9

FROM base AS pruner
WORKDIR /app
COPY . .
RUN turbo prune @repo/api --docker

FROM base AS installer
WORKDIR /app
COPY --from=pruner /app/out/json/ .
RUN pnpm install --frozen-lockfile
COPY --from=pruner /app/out/full/ .

FROM node:20-alpine AS runner
WORKDIR /app
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 apiuser
COPY --from=installer /app .
RUN mkdir -p /app/apps/api/uploads && chown -R apiuser:nodejs /app/apps/api/uploads
USER apiuser
WORKDIR /app/apps/api
# NODE_ENV=production cookie'leri secure+SameSite=None yapar; PORT Coolify'daki port ayarıyla eşleşmeli.
ENV NODE_ENV=production PORT=4000
EXPOSE 4000
CMD ["node", "src/index.js"]
