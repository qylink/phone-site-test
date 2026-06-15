# ===========================================
# Multi-stage build for static site
# Stage 1: build (none needed - static files)
# Stage 2: serve via nginx alpine
# ===========================================
FROM nginx:1.27-alpine

# 替换默认配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 静态资源
COPY html/  /usr/share/nginx/html/

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget -q --spider http://localhost/ || exit 1

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]