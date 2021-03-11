FROM node:14-alpine as builder
WORKDIR /app

# Копирование зависимостей
COPY client/package*.json ./client/
COPY server/package*.json ./server/

# Установка зависимостей
RUN npm --prefix client ci --only=prod
RUN npm --prefix server ci

# Копирование файлов проекта
COPY . .

# Компиляция проекта
RUN npm --prefix client run build

FROM nginx:stable-alpine as app

# Удаление стандартных html из nginx
RUN rm -rf /usr/share/nginx/html/*

# Копирование конфига nginx
COPY nginx/nginx.conf /etc/nginx

# Копироние скомпилированного проекта
COPY --from=builder /app/client/build /usr/share/nginx/html

# Создание монтируемых директорий
RUN mkdir -m '0755' -p /usr/share/nginx/uploads
