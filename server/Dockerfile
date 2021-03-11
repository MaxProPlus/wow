FROM node:14-alpine as build
WORKDIR /app

# Копирование зависимостей
COPY package*.json ./

# Установка зависимостей
RUN npm ci

# Копирование файлов проекта
COPY . .

# Компиляция проекта
RUN npm run build

FROM node:14-alpine as app

# Установка зависимостей
RUN apk add --no-cache su-exec

WORKDIR /home/node

# Копирование зависимостей для продакшена
COPY --chown=node:node package*.json ./

# Установка зависимостей для продакшена
RUN npm ci --only=prod

# Копирование скомпилированного проекта
COPY --from=build --chown=node:node /app/dist /home/node/dist
COPY --from=build --chown=node:node /app/entrypoint.sh /home/node

# Создание монтируемых директорий
RUN mkdir -m '0755' -p /home/node/uploads && \
    mkdir -m '0755' -p /home/node/logs

# Выставление прав
RUN chown node:node -R /home/node

# Определение монтируемых каталогов
VOLUME ["/home/node/uploads", "/home/node/logs"]

# Порт сервера
EXPOSE 5000

WORKDIR /home/node

# ENTRYPOINT для исправления прав
ENTRYPOINT ["./entrypoint.sh"]
CMD ["node", "dist"]
