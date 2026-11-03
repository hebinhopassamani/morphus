# Etapa 1: Compila o Angular gerando apenas os arquivos estáticos (sem Node em produção)
FROM node:24-alpine AS build
ARG NG_CONFIG=production
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npx ng build --configuration=${NG_CONFIG}

# Etapa 2: Servidor estático interno do Angular na porta 80 (roteado pelo mpx-reverse-proxy)
FROM caddy:2-alpine
COPY --from=build /app/dist/morphus-app/browser /srv
RUN printf ":80 {\n\troot * /srv\n\ttry_files {path} /index.html\n\tfile_server\n}\n" > /etc/caddy/Caddyfile
EXPOSE 80
