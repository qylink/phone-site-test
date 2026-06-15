# 飞牛 Fnos 部署指南

## 最简方式（Web UI）

1. 飞牛管理后台 → **Docker** → **Compose** → **新建项目**
2. 项目名：`phone-site`
3. 路径：`/volume1/docker/phone-site`
4. 把 `docker-compose.yml` 完整粘贴进去 → **部署**
5. 等待构建完成（约 1-2 分钟）
6. 访问 `http://飞牛IP:8080`

## SSH 方式

```bash
# SSH 到飞牛
ssh admin@飞牛IP

# 创建项目目录
mkdir -p /volume1/docker/phone-site/{html,logs/nginx}
cd /volume1/docker/phone-site

# 方式 A：用 git 拉取
git clone https://github.com/qylink/phone-site-test.git ./

# 方式 B：手动上传 5 个文件
# docker-compose.yml, Dockerfile, nginx.conf, *.html, css/, js/

# 复制站点文件到 html 目录（如果用方式 A）
cp -r index.html product.html specs.html buy.html support.html css js html/

# 启动
docker compose up -d

# 查看状态
docker compose ps
docker compose logs -f

# 访问
# http://飞牛IP:8080

# 停止
docker compose down

# 升级（拉取新代码后重建）
docker compose build --no-cache
docker compose up -d
```

## 目录结构（部署到飞牛后）

```
/volume1/docker/phone-site/
├── docker-compose.yml
├── Dockerfile
├── nginx.conf
├── html/                  ← 站点文件（可挂载热更新）
│   ├── index.html
│   ├── product.html
│   ├── specs.html
│   ├── buy.html
│   ├── support.html
│   ├── css/
│   └── js/
└── logs/nginx/            ← nginx 日志
```

## 修改端口

编辑 `docker-compose.yml` 中 `"8080:80"` 左侧数字，例如改为 `"9090:80"` 即可。

## 修改静态文件（不重建镜像）

`./html` 目录已经挂载到容器 `/usr/share/nginx/html`，修改后刷新浏览器即可生效，无需重启。

## 常见问题

**Q: WebUI 提示"找不到 Dockerfile"**
A: 路径选择错了。`docker-compose.yml` 中的 `build: context: .` 表示 Dockerfile 与 compose 文件在**同一目录**。把整个项目（含 Dockerfile）放到 `/volume1/docker/phone-site/`。

**Q: 端口 8080 被占用**
A: 改成其他端口如 `"9090:80"`。在飞牛 WebUI → 容器 → 端口设置里也能改。

**Q: 想绑定域名访问**
A: 飞牛 → 系统设置 → 反向代理 → 添加一条 `域名 → http://localhost:8080`，申请证书即可 HTTPS 访问。