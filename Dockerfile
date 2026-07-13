###############################################################################
# builder

FROM node:24.11-alpine AS builder

RUN npm i --loglevel=error -g pnpm
RUN pnpm config set store-dir /pnpm-store
RUN pnpm config set minimum-release-age 0

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

WORKDIR /repo
COPY --parents **/package.json .
COPY --parents **/patches .
COPY pnpm-*.yaml .

RUN pnpm i

COPY . .
WORKDIR /repo/playground/turbopack
RUN pnpm build

###############################################################################
# runner

FROM node:24.11-alpine AS runner
RUN apk add --no-cache nginx

COPY --from=builder /repo/playground/turbopack/.next/standalone /next-standalone
COPY --from=builder /repo/playground/turbopack/.next/static /next-static
COPY --from=builder /repo/playground/turbopack/public /next-public

EXPOSE 3334

COPY <<'EOF' /etc/nginx/nginx.conf
events {
  worker_connections 1024;
}

http {
  include /etc/nginx/mime.types;

  server {
    listen 3334;

    gzip on;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/json application/xml+rss;
    gzip_min_length 1024;
    gzip_vary on;

    location /_next/static/ {
      alias /next-static/;
      expires 1y;
      add_header Cache-Control "public, immutable";
    }

    location / {
      root /next-public;
      try_files $uri @nextjs;
    }

    location @nextjs {
      proxy_pass http://127.0.0.1:3000;
      proxy_set_header Host $host;
      proxy_set_header X-Real-IP $remote_addr;
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
      proxy_set_header X-Forwarded-Proto $scheme;
      proxy_http_version 1.1;
      proxy_buffering off;
      proxy_request_buffering off;
      gzip off;
    }
  }
}
EOF

ENV NODE_ENV=production
WORKDIR /next-standalone/playground/turbopack

COPY <<'EOF' /docker-entrypoint.sh
#!/bin/sh
set -e
HOSTNAME=127.0.0.1 PORT=3000 node server.js &
exec nginx -g 'daemon off;'
EOF

RUN chmod +x /docker-entrypoint.sh
CMD ["/docker-entrypoint.sh"]
