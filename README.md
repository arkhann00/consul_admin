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

## Структура

```
src/
  api/          # client, auth, doctors, news
  auth/         # токены, AuthContext
  components/   # Layout, ProtectedRoute, …
  pages/        # Login, Dashboard, Doctors, News
  utils/        # mediaUrl, validation
```
