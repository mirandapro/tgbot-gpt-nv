# Використовуємо офіційний Docker образ для Node.js
FROM node:16-alpine

# Вказуємо робочу директорію для нашого додатка
WORKDIR /app

# Копіюємо package.json та package-lock.json в робочу директорію
COPY package*.json ./

# Встановлюємо залежності
RUN npm ci

# Копіюємо увесь наш додаток в робочу директорію
COPY . .

ENV PORT=3000

EXPOSE $PORT

# Вказуємо команду для запуску додатка
CMD ["npm", "start"]