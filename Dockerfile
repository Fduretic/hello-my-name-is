FROM node:22.22.0-alpine3.23@sha256:e4bf2a82ad0a4037d28035ae71529873c069b13eb0455466ae0bc13363826e34 AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . .
ARG PUBLIC_DISPLAY_NAME="YOUR NAME"
RUN PUBLIC_DISPLAY_NAME="$PUBLIC_DISPLAY_NAME" npm run build

FROM nginx:1.28.2-alpine3.23@sha256:5b4900b042ccfa8b0a73df622c3a60f2322faeb2be800cbee5aa7b44d241649e
RUN sed -i 's/worker_processes  auto;/worker_processes  2;/' /etc/nginx/nginx.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/hello/browser /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 CMD wget -q -O /dev/null http://127.0.0.1:80/health || exit 1
