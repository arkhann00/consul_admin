# Consilium — админ-панель

Веб-админка для стоматологической клиники Consilium (React + JavaScript). Работает с API из `AI_BACKEND.md`.

## Возможности

- CRUD врачей и новостей (multipart + JSON)
- Загрузка изображений до 5 MB
- Docker: nginx проксирует API на бэкенд

## Конфигурация — один файл `.env`

```bash
cp .env.example .env
```

| Переменная | Назначение |
|------------|------------|
| `ADMIN_PORT` | Порт админки снаружи (по умолчанию **8082**) |
| `API_UPSTREAM` | Адрес бэкенда для nginx в Docker (по умолчанию **http://5.42.113.18:8081**) |
| `VITE_API_BASE_URL` | URL API для `npm run dev` (из браузера) |

На том же сервере, что и бэкенд, часто лучше:

```env
API_UPSTREAM=http://172.17.0.1:8081
```

## Docker (production)

```bash
docker compose up --build -d
```

- Админка: http://5.42.113.18:8082 (или `http://localhost:8082`)
- Бэкенд: значение `API_UPSTREAM` в `.env`

Проверка:

```bash
curl http://5.42.113.18:8081/health
curl http://5.42.113.18:8082/health
docker compose exec admin grep proxy_pass /etc/nginx/conf.d/default.conf
```

## Локальная разработка

```bash
npm install
npm run dev
```

Используется `VITE_API_BASE_URL` из `.env`. Откройте http://localhost:5173

## Сборка без Docker

```bash
npm run build
npm run preview
```

## Структура

```
.env              # единый конфиг (не коммитить секреты)
.env.example      # шаблон
docker-compose.yml
Dockerfile
nginx/
src/
```
