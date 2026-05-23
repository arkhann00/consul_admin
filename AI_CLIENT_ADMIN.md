# Админ-панель Consilium — инструкция для ИИ-агента

Цель: реализовать **сетевой слой и CRUD UI** для **веб или desktop админки** управления контентом клиники (врачи, новости). API: `AI_BACKEND.md`.

## Контекст

- Вход только для пользователей с **`is_admin: true`** (создаются на сервере: `scripts/create_admin.py`, не через `/auth/register`).
- После входа — полный CRUD врачей и новостей + загрузка изображений.
- Пациентское мобильное приложение — отдельный клиент (`AI_CLIENT_MOBILE.md`); админка **не** дублирует регистрацию пациентов как основной сценарий.

## Конфигурация

```typescript
// Пример .env для Vite/Next
VITE_API_BASE_URL=http://127.0.0.1:8000
const API_PREFIX = '/api/v1';
```

Все запросы: `${VITE_API_BASE_URL}${API_PREFIX}/...`.

## Архитектура слоя (рекомендация)

```
src/
  api/
    client.ts           # fetch/axios instance + auth header
    auth.ts
    doctors.ts
    news.ts
    types.ts            # Doctor, News, User, TokenPair
  auth/
    tokenStorage.ts     # localStorage / sessionStorage / cookie
    AuthContext.tsx
  features/
    doctors/
    news/
```

Разделение:

- **JSON-эндпоинты** (`*/json`) — удобны, если картинка уже URL или правка без файла.
- **Multipart** (`POST/PUT` без `/json`) — создание/редактирование **с файлом** с формы.

## Аутентификация

### Вход администратора

| Метод | Путь | Тело |
|-------|------|------|
| POST | `/api/v1/auth/login` | `{ "phone": "...", "password": "..." }` |

Ответ: `{ access_token, refresh_token, token_type }`.

Сразу после логина:

```http
GET /api/v1/auth/me
Authorization: Bearer <access_token>
```

Если `is_admin === false` — показать ошибку «Нет прав администратора» и **не** пускать в панель (бэкенд всё равно вернёт **403** на CRUD).

### Хранение токенов

- `access_token` — в памяти + `sessionStorage` или httpOnly cookie (если есть BFF).
- `refresh_token` — `localStorage` или secure cookie; нужен для продления сессии.

### Refresh (как в мобильном клиенте)

При **401** на любом запросе (кроме login/refresh):

1. `POST /api/v1/auth/refresh` с `{ refresh_token }`
2. Сохранить новую пару токенов (ротация refresh обязательна).
3. Повторить исходный запрос один раз.

Один inflight refresh на вкладку (очередь или mutex).

### Logout

Очистить storage и context. Серверного revoke нет.

### Регистрация

`POST /auth/register` в админке **не использовать** для создания админов. Документируйте в UI: «Администратор создаётся на сервере».

## Права и ошибки

| Код | `detail` | UI |
|-----|----------|-----|
| 401 | Not authenticated / Invalid token | Redirect login |
| 403 | Admin access required | «Требуются права администратора» |
| 404 | Doctor/News not found | Toast + обновить список |
| 400 | file type / size | Показать лимит 5 MB и форматы JPEG/PNG/WebP/GIF |

## CRUD: Врачи

Базовый путь: `/api/v1/doctors`

### Чтение (можно без токена, в админке лучше с токеном)

| Метод | Путь |
|-------|------|
| GET | `/doctors?skip=0&limit=50` |
| GET | `/doctors/{id}` |

### Создание

**Вариант A — с загрузкой фото (рекомендуется для админки)**

```http
POST /api/v1/doctors
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

Поля form:

| Поле | Обязательно | Тип |
|------|-------------|-----|
| `first_name` | да | string |
| `last_name` | да | string |
| `position` | да | string |
| `patronymic` | нет | string |
| `description` | нет | string |
| `avatar` | нет | file |
| `avatar_url` | нет | string (если без файла — внешний URL или `/uploads/...`) |

Если передан файл `avatar` с непустым filename — сервер сохраняет файл и подставляет `avatar_url` автоматически.

**Вариант B — только JSON**

```http
POST /api/v1/doctors/json
Content-Type: application/json
```

```json
{
  "first_name": "Анна",
  "last_name": "Петрова",
  "patronymic": "Сергеевна",
  "position": "Стоматолог-терапевт",
  "description": "Опыт 10 лет",
  "avatar_url": "/uploads/doctors/abc.jpg"
}
```

### Обновление

**Multipart** — частичное: отправляйте только изменённые поля + опционально новый `avatar`.

```http
PUT /api/v1/doctors/{id}
```

**JSON:**

```http
PUT /api/v1/doctors/{id}/json
```

```json
{
  "position": "Главный врач",
  "avatar_url": "/uploads/doctors/new.jpg"
}
```

Только ключи, которые меняются (`exclude_unset` на сервере).

### Удаление

```http
DELETE /api/v1/doctors/{id}
Authorization: Bearer <token>
```

Ответ **204**, тело пустое.

## CRUD: Новости

Базовый путь: `/api/v1/news`

### Чтение

| Метод | Путь |
|-------|------|
| GET | `/news?skip=0&limit=50` |
| GET | `/news/{id}` |

Список: сортировка **новые сверху** (`created_at DESC`).

### Создание

**Multipart:**

```http
POST /api/v1/news
```

| Поле | Обязательно |
|------|-------------|
| `title` | да |
| `description` | да |
| `image` | нет (file) |
| `image_url` | нет (string; при загрузке файла сервер пишет в поле `image` модели) |

**JSON:**

```http
POST /api/v1/news/json
```

```json
{
  "title": "Акция на чистку",
  "description": "До конца месяца скидка 20%",
  "image": "/uploads/news/xyz.jpg"
}
```

Поле в JSON — **`image`**, не `image_url`.

### Обновление

- `PUT /api/v1/news/{id}` — multipart, поля `title`, `description`, `image` (file), `image_url` (строка для подстановки в `image`).
- `PUT /api/v1/news/{id}/json` — JSON `NewsUpdate`.

### Удаление

`DELETE /api/v1/news/{id}` → **204**.

## URL превью изображений

```typescript
export function mediaUrl(path: string | null | undefined): string {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${import.meta.env.VITE_API_BASE_URL}${path}`;
}
```

Показывать превью после создания/редактирования из `avatar_url` (врач) или `image` (новость).

## Типы TypeScript (скопировать в `types.ts`)

```typescript
export interface TokenPair {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface User {
  id: number;
  name: string;
  phone: string;
  is_admin: boolean;
  created_at: string;
}

export interface Doctor {
  id: number;
  avatar_url: string | null;
  first_name: string;
  last_name: string;
  patronymic: string | null;
  position: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface News {
  id: number;
  title: string;
  description: string;
  image: string | null;
  created_at: string;
  updated_at: string;
}

export interface DoctorCreate {
  first_name: string;
  last_name: string;
  position: string;
  patronymic?: string | null;
  description?: string | null;
  avatar_url?: string | null;
}

export interface NewsCreate {
  title: string;
  description: string;
  image?: string | null;
}
```

## Пример: axios + multipart (создание врача с фото)

```typescript
import axios from 'axios';

async function createDoctorWithAvatar(
  token: string,
  data: {
    first_name: string;
    last_name: string;
    position: string;
    patronymic?: string;
    description?: string;
    avatarFile?: File;
  },
) {
  const form = new FormData();
  form.append('first_name', data.first_name);
  form.append('last_name', data.last_name);
  form.append('position', data.position);
  if (data.patronymic) form.append('patronymic', data.patronymic);
  if (data.description) form.append('description', data.description);
  if (data.avatarFile) form.append('avatar', data.avatarFile);

  const res = await axios.post(`${BASE}/api/v1/doctors`, form, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data as Doctor;
}
```

Для **редактирования** с новым фото — тот же `FormData` на `PUT /api/v1/doctors/{id}`.

## Пример: JSON без файла

```typescript
await api.put(`/doctors/${id}/json`, {
  position: 'Ортодонт',
});
```

## UI-модули (минимальный scope)

| Раздел | Функции |
|--------|---------|
| Login | phone, password → токены → проверка `is_admin` |
| Dashboard | ссылки на разделы (опционально) |
| Врачи | таблица/карточки, create/edit/delete, превью `avatar_url`, форма с file input |
| Новости | список по дате, редактор title/description, image upload, delete |

Формы редактирования:

- Режим «заменить фото» → multipart PUT с полем `avatar` или `image`.
- Режим «только текст» → `PUT .../json`.

## Валидация на клиенте (совпадает с бэкендом)

| Поле | Правило |
|------|---------|
| doctor `first_name`, `last_name` | 1–100 символов |
| doctor `position` | 1–255 |
| news `title` | 1–255 |
| news `description` | min 1 |
| файл | ≤ 5 MB, image/jpeg \| png \| webp \| gif |

## Чеклист для агента

- [ ] Login + проверка `is_admin` через `/auth/me`
- [ ] Bearer на всех мутациях
- [ ] Refresh при 401 с ротацией refresh token
- [ ] Врачи: multipart для форм с файлом, `/json` для текстовых правок
- [ ] Новости: поле **`image`** в JSON; в form — файл `image`, опционально `image_url`
- [ ] Превью через `VITE_API_BASE_URL + path`
- [ ] DELETE обрабатывает 204 без JSON body
- [ ] Не вызывать `/auth/register` для создания админа

## Тестирование вручную

1. На сервере: `uv run python scripts/create_admin.py`
2. Login в админке → `is_admin: true`
3. Создать врача с JPEG → в ответе `avatar_url: "/uploads/doctors/...."`
4. Открыть в браузере `{BASE}{avatar_url}`
5. Создать новость, отредактировать title через `/json`, удалить

## Связанные файлы

- `AI_BACKEND.md` — полная спецификация
- `AI_CLIENT_MOBILE.md` — пациентское приложение (read-only контент)
