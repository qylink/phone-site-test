# Xiaomi Pro 14 static site - nginx alpine image
# Stage 1: build (no-op, static files)
# Stage 2: serve via nginx:1.27-alpine
FROM nginx:1.27-alpine

LABEL maintainer="qylink"

# Replace default nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Static site files (html/, css/, js/)
COPY html/  /usr/share/nginx/html/

# Health check
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget -q --spider http://localhost/ || exit 1

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]