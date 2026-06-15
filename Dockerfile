# Xiaomi Pro 14 static site - Caddy
FROM caddy:2-alpine

LABEL maintainer="qylink"

# Copy Caddy config
COPY Caddyfile /etc/caddy/Caddyfile

# Copy static site files
COPY html/  /usr/share/caddy/

EXPOSE 80

CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile"]