# Health Tracker

Ежедневный мониторинг здоровья после инсульта. Контроль давления, пульса, сахара и приёма лекарств.

**Ссылка:** [health-tracker-seven-navy.vercel.app](https://health-tracker-seven-navy.vercel.app)

---

## Возможности

### Мониторинг показателей
- Запись артериального давления (систолическое / диастолическое)
- Контроль пульса и уровня сахара в крови
- Автоматическое выявление критических значений
- Графики и тренды за неделю, месяц и квартал

### Лекарства
- Ежедневный чеклист приёма лекарств, сгруппированный по времени суток
- Прогресс-бар выполнения на день
- Ad-hoc лекарства — на один раз, без сохранения в расписание
- Группы «ИЛИ» — достаточно принять любой из вариантов
- Пропуск приёма на конкретный день
- Перетаскивание для сортировки
- Недельный календарь для редактирования расписания по дням

### Расписание
- Настройка ежедневного расписания (утро / день / вечер)
- Недельный календарь с переопределениями
- Каталог пресетов для быстрого добавления

### Отчёт для врача
- Автоматическая сводка за период
- Экспорт в PDF
- Печать и отправка на email

### Приватность
- Данные в защищённом облаке Supabase
- Аутентификация по email
- Row Level Security — каждый видит только свои данные

---

## Технологии

| Компонент | Технология |
|-----------|------------|
| Фреймворк | Next.js 16 (App Router) |
| Язык | TypeScript |
| Стили | CSS Modules + CSS Custom Properties |
| Аутентификация | Supabase Auth |
| База данных | PostgreSQL (Supabase) |
| Графики | Recharts |
| Иконки | Lucide React |
| Валидация | Zod + React Hook Form |
| PDF | @react-pdf/renderer |

---

## Быстрый старт

### 1. Клонировать

```bash
git clone https://github.com/Jake-015kz/health-tracker.git
cd health-tracker
```

### 2. Установить зависимости

```bash
npm install
```

### 3. Настроить переменные окружения

Создать `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 4. Выполнить миграции

В Supabase Dashboard → SQL Editor выполнить:

```sql
ALTER TABLE medications ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;
ALTER TABLE medications ADD COLUMN IF NOT EXISTS overrides JSONB DEFAULT '{}'::jsonb;
```

### 5. Настроить Supabase Auth

- **Site URL:** `http://localhost:3000` (локально) / `https://health-tracker-seven-navy.vercel.app` (продакшн)
- **Redirect URLs:** `http://localhost:3000/**`, `https://health-tracker-seven-navy.vercel.app/**`

### 6. Запустить

```bash
npm run dev
```

---

## Структура проекта

```
src/
├── app/                    # Маршруты (Next.js App Router)
│   ├── api/                # API routes
│   │   ├── ai/             # AI-описание лекарств
│   │   └── auth/           # Аутентификация
│   ├── auth/               # Callback подтверждения email
│   ├── dashboard/          # Основной экран
│   ├── login/              # Вход
│   ├── signup/             # Регистрация
│   └── page.tsx            # Лендинг
├── entities/               # Бизнес-сущности
│   ├── biometrics/         # Биометрические данные
│   └── medication/         # Лекарства и расписание
├── features/               # Фичи (UI + логика)
│   ├── auth/               # Аутентификация и хранилище
│   ├── export-data/        # Экспорт данных
│   ├── log-metrics/        # Форма ввода измерений
│   └── medication-checklist/ # Чеклист лекарств
├── shared/                 # Общие утилиты
│   ├── lib/                # Библиотечный код
│   └── ui/                 # Переиспользуемые компоненты
└── widgets/                # Виджеты
    ├── dashboard/          # Обзорная панель
    ├── doctor-report/      # Отчёт для врача
    └── layout/             # Layout (sidebar, bottom-nav)
```

---

## Команды

```bash
npm run dev          # Dev-сервер
npm run build        # Сборка
npm run start        # Продакшн-сервер
npm run lint         # ESLint
npm run lint:fix     # Автоисправление ESLint
npm run typecheck    # TypeScript
npm run format       # Prettier
```

---

## Деплой на Vercel

1. Импортировать репозиторий на [vercel.com/new](https://vercel.com/new)
2. Vercel автоматически определит Next.js
3. Добавить переменные окружения в настройках проекта
4. Выполнить SQL-миграции в Supabase
5. Настроить Site URL и Redirect URLs в Supabase

---

## Лицензия

MIT
