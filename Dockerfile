# Xiaomi Pro 14 static site - nginx alpine
# Use generic tag (more likely to be cached on Fnos mirror)
FROM nginx:alpine

LABEL maintainer="qylink"

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY html/  /usr/share/nginx/html/

HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget -q --spider http://localhost/ || exit 1

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]