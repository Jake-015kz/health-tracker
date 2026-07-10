# Health Tracker

Приложение для ежедневного мониторинга здоровья после инсульта. Контроль давления, пульса, уровня сахара и приёма лекарств.

**Ссылка:** [health-tracker-seven-navy.vercel.app](https://health-tracker-seven-navy.vercel.app)

---

## Возможности

### Мониторинг показателей
- Запись артериального давления (систолическое / диастолическое)
- Контроль пульса и уровня сахара в крови
- Автоматическое выявление критических значений
- Графики и тренды за неделю, месяц и квартал

### Лекарства
- Ежедневный чеклист приёма лекарств, сгруппированный по времени суток (утро / день / вечер)
- Прогресс-бар выполнения на день
- Ad-hoc лекарства — добавить таблетку на сегодня (например, от высокого давления) без сохранения в расписание
- Группы лекарств «ИЛИ» — достаточно принять любой из вариантов (Глюконил / Глюкованс)
- Напоминания о приёме лекарств через push-уведомления

### Расписание
- Настройка ежедневного расписания лекарств (какие лекарства, в какое время)
- Каталог пресетов для быстрого добавления
- Группировка по времени суток с эмодзи-индикаторами

### Отчёт для врача
- Автоматическая сводка показателей за период
- Экспорт в PDF для передачи лечащему врачу

### Приватность
- Данные хранятся локально (localStorage) или в защищённом облаке Supabase
- Аутентификация через email
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

### 1. Клонировать репозиторий

```bash
git clone https://github.com/Jake-015kz/health-tracker.git
cd health-tracker
```

### 2. Установить зависимости

```bash
npm install
```

### 3. Настроить переменные окружения

Создать файл `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 4. Выполнить миграцию базы данных

В Supabase Dashboard → SQL Editor вставить содержимое файла:

```
supabase/migrations/20250710_add_ad_hoc_medications.sql
```

### 5. Настроить Supabase Auth

1. **Authentication → URL Configuration → Site URL:**
   - Локально: `http://localhost:3000`
   - Продакшн: `https://health-tracker-seven-navy.vercel.app`

2. **Authentication → URL Configuration → Redirect URLs:**
   - Добавить `http://localhost:3000/**`
   - Добавить `https://health-tracker-seven-navy.vercel.app/**`

### 6. Запустить

```bash
npm run dev
```

Открыть [http://localhost:3000](http://localhost:3000)

---

## Структура проекта

```
src/
├── app/                    # Маршруты (Next.js App Router)
│   ├── api/                # API routes
│   │   ├── ai/             # AI-описание лекарств
│   │   └── auth/           # Аутентификация
│   ├── auth/               # Callback для подтверждения email
│   ├── dashboard/          # Основной экран
│   ├── login/              # Вход
│   ├── signup/             # Регистрация
│   └── page.tsx            # Лендинг
├── entities/               # Бизнес-сущности
│   ├── biometrics/         # Биометрические данные
│   └── medication/         # Лекарства и расписание
├── features/               # Фичи (UI + логика)
│   ├── auth/               # Аутентификация и хранилище данных
│   ├── export-data/        # Экспорт данных
│   ├── log-metrics/        # Форма ввода измерений
│   └── medication-checklist/ # Чеклист лекарств
├── shared/                 # Общие утилиты
│   ├── lib/                # Библиотечный код
│   └── ui/                 # Переиспользуемые компоненты
└── widgets/                # Виджеты (составные компоненты)
    ├── dashboard/          # Обзорная панель
    ├── doctor-report/      # Отчёт для врача
    └── layout/             # Layout (sidebar, bottom-nav)
```

---

## Команды

```bash
npm run dev          # Запуск dev-сервера
npm run build        # Сборка для продакшна
npm run start        # Запуск продакшн-сервера
npm run lint         # Проверка ESLint
npm run lint:fix     # Автоисправление ESLint
npm run typecheck    # Проверка TypeScript
npm run format       # Форматирование Prettier
```

---

## Деплой на Vercel

1. Импортировать репозиторий на [vercel.com/new](https://vercel.com/new)
2. Vercel автоматически определит Next.js и соберёт проект
3. Добавить переменные окружения в настройках проекта на Vercel
4. Выполнить SQL миграцию в Supabase
5. Настроить Site URL и Redirect URLs в Supabase

---

## Лицензия

MIT
