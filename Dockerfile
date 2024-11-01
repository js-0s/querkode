#
# DockerFile for querkode frontend
#
# includes a volumed-dev-runner (that has dev-dependencies like git installed)
# and the production-image builder that ensures that only the required
# run-time dependencies and configurations are added to the image

# Development image, without copying to allow hot-reload

FROM node:20-alpine AS devrunner
RUN apk add --no-cache libc6-compat git bash \
  jq zip mc vips
RUN npm install -g yarn-upgrade-all ynpx

RUN touch /root/.bashrc \
 && echo 'PS1="querkode \w # "' \
 >> /root/.bashrc

WORKDIR /app
VOLUME /app
VOLUME /app/node_modules
VOLUME /app/.next
VOLUME /usr/local/share/.cache/yarn

ENV NODE_ENV development

EXPOSE 1902
ENV PORT 1902

ENV NEXT_TELEMETRY_DISABLED 1
CMD ["yarn", "dev-docker"]


#
# Production Build
#

# Install dependencies only when needed
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat vips
WORKDIR /app
COPY package.json yarn.lock .npmrc ./
RUN yarn install --frozen-lockfile



# Rebuild the source code only when needed
FROM node:20-alpine AS builder
RUN apk add --no-cache libc6-compat vips
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /usr/local/share/.cache/yarn /usr/local/share/.cache/yarn
COPY . .

# .env.local is generated in the github-action. it has to exist for the application
# its content contains non-secrets from .env.${environment}
COPY .env /app/.env.local
COPY .env.build /app/.env.build
# .env.production is loaded in util/scripts and expected to have the variables of
# environment
COPY .env /app/.env.production
COPY .npmrc .
RUN . ./.env.local && . ./.env.build \
 && cat .env.build >> .env \
 && yarn build \
 && yarn install --production --ignore-scripts --prefer-offline


# Production image, copy all the files and run next
FROM node:20-alpine AS runner
RUN apk add --no-cache libc6-compat vips
WORKDIR /app

ENV NODE_ENV production

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# You only need to copy next.config.js if you are NOT using the default configuration
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/.env.local ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/lang ./lang
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

USER nextjs

EXPOSE 3000

ENV PORT 3000

ENV NEXT_TELEMETRY_DISABLED 1

CMD ["node_modules/.bin/next", "start"]

