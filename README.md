# Health Tracker

Приложение для мониторинга здоровья после инсульта. Контроль артериального давления, пульса, уровня сахара в крови и приёма лекарств.

## Стек

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript (strict)
- **UI:** Radix UI Slot (asChild), CSS Modules (БЭМ)
- **Charts:** Recharts
- **Forms:** React Hook Form + Zod
- **Storage:** localStorage (MVP)

## Структура проекта (Feature-Sliced Design)

```
src/
├── app/          # Роутинг (App Router)
├── widgets/      # Составные блоки UI (дашборд, отчёт)
├── features/     # Пользовательские действия (формы, чек-листы)
├── entities/     # Бизнес-сущности (biometrics, medication, telegram)
└── shared/       # Переиспользуемые ресурсы (UI, утилиты, конфиг)
```

## Запуск

```bash
npm install
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000)

## Скрипты

| Команда | Описание |
|---------|----------|
| `npm run dev` | Запуск dev-сервера |
| `npm run build` | Production-сборка |
| `npm run start` | Запуск production-сервера |
| `npm run lint` | Проверка ESLint |
| `npm run lint:fix` | Автоисправление ESLint |
| `npm run format` | Форматирование Prettier |
| `npm run typecheck` | Проверка TypeScript |

## Деплой на Vercel

Проект готов к деплою на Vercel «из коробки»:

```bash
npx vercel
```

## Функционал

- **Давление:** Контроль систолического/диастолического давления с визуальным выделением критических зон (>140/90)
- **Пульс:** Мониторинг частоты сердечных сокращений
- **Сахар:** Контроль уровня глюкозы в крови с выделением повышенных значений (>7.0 ммоль/л)
- **Лекарства:** Интерактивный чек-лист приёма таблеток на текущий день
- **Графики:** Динамика давления, пульса и сахара (Recharts)
- **Экспорт:** Выгрузка истории в JSON/CSV для врача
- **Отчёт:** Печатная таблица со всей историей измерений

## Лицензия

Private
