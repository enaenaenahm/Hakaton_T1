
# Terraform LogViewer

Веб-приложение для анализа логов Terraform. Позволяет импортировать, фильтровать, искать и визуализировать логи выполнения Terraform в виде списка, диаграммы Ганта и хронологической шкалы.

##  Возможности

- **Импорт логов** — NDJSON и JSON-массивы
- **Полнотекстовый поиск** по сообщениям и содержимому
- **Фильтры** — по уровню (ERROR/WARN/INFO/DEBUG/TRACE), ресурсу, времени, `tf_req_id`
- **Три режима визуализации**:
  -  **List** — таблица логов с цветовой индикацией
  -  **Gantt Chart** — диаграмма Ганта по запросам (`tf_req_id`)
  -  **Timeline** — хронологическая блок-схема событий
- **Просмотр JSON** — req/res/raw для HTTP-запросов Terraform
- **Экспорт** — NDJSON и CSV
- **Пометка прочитанного**

##  Архитектура

```Markdown
┌──────────────┐      ┌──────────────────┐      ┌──────────────┐
│   Frontend   │─────▶│   Backend API    │─────▶│  PostgreSQL  │
│  React+Vite  │ HTTP │  FastAPI (Python)│ SQL  │  + FTS index │
│  :5174       │      │  :8000           │      │  :5432       │
└──────────────┘      └──────────────────┘      └──────────────┘
```

**Стек:**

- Frontend: React 18, Vite, dayjs
- Backend: FastAPI, SQLAlchemy 2.0, psycopg3
- БД: PostgreSQL 16 (uuid-ossp, tsvector для FTS)

## Структура проекта

```Markdown
Fixiki_TerraformLogViewer_HackathonT1/
├── anatoliy-backend/backend/      # Python FastAPI
│   ├── app/
│   │   ├── main.py                # эндпоинты API
│   │   ├── parser.py              # парсер логов
│   │   ├── gantt.py               # сборка сегментов Ганта
│   │   └── plugins/manager.py     # mock-плагин статистики
│   └── requirements.txt
├── enjie-visualization/timeline-starter/   # React фронтенд
│   ├── src/
│   │   ├── main.jsx
│   │   └── components/
│   │       ├── GanttChart.jsx
│   │       └── Timeline.jsx
│   └── package.json
└── albert-db-gantt/backend_gantt/ # альтернативный бэкенд (не используется)
```

##  Запуск

### 1. PostgreSQL

Установите **Postgres.app** (https://postgresapp.com) — не требует sudo.

```bash
# Добавить в PATH
export PATH="/Applications/Postgres.app/Contents/Versions/latest/bin:$PATH"

# Создать БД и схему
createdb logviewer
psql -d logviewer -f init.sql
```

Схема `init.sql`:

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE TABLE IF NOT EXISTS log_record (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  raw jsonb NOT NULL, ts timestamptz, level text, section text,
  tf_req_id text, parent_req_id text, tf_resource_type text,
  is_read boolean NOT NULL DEFAULT false,
  has_req_body boolean DEFAULT false, has_res_body boolean DEFAULT false,
  message text
);
ALTER TABLE log_record ADD COLUMN IF NOT EXISTS fts tsvector;
CREATE INDEX IF NOT EXISTS idx_log_fts ON log_record USING GIN (fts);
CREATE INDEX IF NOT EXISTS idx_log_ts ON log_record (ts);
CREATE INDEX IF NOT EXISTS idx_log_req ON log_record (tf_req_id);
-- + триггер log_fts_update() для автообновления fts
```

### 2. Backend

```bash
cd anatoliy-backend/backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

export DATABASE_URL="postgresql+psycopg://<user>@localhost:5432/logviewer"
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Проверка: http://localhost:8000/docs → Swagger UI

### 3. Frontend

```bash
cd enjie-visualization/timeline-starter
npm install
npm run dev
```

Открыть: **http://localhost:5174**

## API endpoints

| Метод | Путь                     | Описание                         |
| ---------- | ---------------------------- | ---------------------------------------- |
| POST       | `/import`                  | Импорт NDJSON/JSON                 |
| POST       | `/search`                  | Поиск с фильтрами         |
| GET        | `/gantt/segments`          | Сегменты для Ганта       |
| GET        | `/record/{id}/json/{kind}` | req/res/raw JSON                         |
| POST       | `/mark-read`               | Пометить прочитанным  |
| GET        | `/export?fmt=ndjson\|csv`   | Экспорт                           |
| GET        | `/plugins/run`             | Статистика по уровням |

## Пример использования

1. Импортировать логи Terraform через кнопку **Import Logs**
2. Использовать фильтры (level, tf_req_id, full-text)
3. Переключаться между режимами **List / Gantt Chart / Timeline**
4. Кликать по записям для просмотра req/res/raw JSON

---

**Разработано в рамках хакатона T1. Команда: Albert (DB + Gantt), Anatoliy (Backend), Sergey/Enjie (Frontend visualization).**
