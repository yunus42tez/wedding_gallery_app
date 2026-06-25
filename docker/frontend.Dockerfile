FROM node:20-alpine AS build

WORKDIR /app

# Enable corepack for pnpm if needed, or use npm. The workspace uses pnpm.
RUN corepack enable && corepack prepare pnpm@latest --activate

COPY frontend/package.json frontend/pnpm-workspace.yaml* ./
RUN pnpm install

COPY frontend/ ./
RUN pnpm run build

FROM nginx:alpine
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
