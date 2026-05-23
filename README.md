# Consilium — админ-панель

Веб-админка для стоматологической клиники Consilium (React + JavaScript). Работает с API из `AI_BACKEND.md`.

## Возможности

- Вход администратора (`is_admin: true`)
- Автообновление access token через refresh (ротация)
- CRUD врачей (multipart + JSON)
- CRUD новостей (multipart + JSON)
- Загрузка изображений до 5 MB

## Запуск

1. Убедитесь, что бэкенд запущен на `http://127.0.0.1:8000`
2. Создайте администратора на сервере: `uv run python scripts/create_admin.py`
3. Установите зависимости и запустите фронт:

```bash
npm install
npm run dev
```

Откройте http://localhost:5173

## Переменные окружения

Скопируйте `.env.example` в `.env`:

```
VITE_API_BASE_URL=http://127.0.0.1:8000
```

## Сборка

```bash
npm run build
npm run preview
```

## Docker

### Production (nginx + статика)

Бэкенд должен быть доступен. По умолчанию nginx проксирует `/api`, `/uploads` и `/health` на `http://host.docker.internal:8000`.

```bash
docker compose up --build
```

Админка: http://localhost:8082 (порт задаётся через `ADMIN_PORT`).

Переменные — см. `.env.docker.example`:

```bash
cp .env.docker.example .env
# при необходимости: API_UPSTREAM=http://api:8000
docker compose up --build
```

Сборка с явным URL API (без прокси nginx):

```bash
docker build --build-arg VITE_API_BASE_URL=http://127.0.0.1:8000 -t consul-admin .
docker run -p 8082:80 consul-admin
```

### Development (hot reload)

```bash
docker compose -f docker-compose.dev.yml up --build
```

http://localhost:5173 — `VITE_API_BASE_URL` по умолчанию `http://127.0.0.1:8000`.

## Структура

```
src/
  api/          # client, auth, doctors, news
  auth/         # токены, AuthContext
  components/   # Layout, ProtectedRoute, …
  pages/        # Login, Dashboard, Doctors, News
  utils/        # mediaUrl, validation
```
