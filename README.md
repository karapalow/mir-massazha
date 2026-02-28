# Мир Массажа — Сайт школы массажа

Современный многостраничный сайт для школы обучения массажу.

## Структура проекта

```
mir/
├── index.html          # Главная страница
├── courses.html        # Страница курсов
├── classic-massage.html
├── medical-massage.html
├── kids-massage.html   # Страницы отдельных курсов
├── about.html          # О нас
├── contacts.html       # Контакты
├── css/
│   └── style.css      # Основные стили
├── js/
│   └── main.js        # Анимации, меню, валидация форм
└── images/             # Папка для изображений (логотип и др.)
```

## Добавление логотипа

1. Поместите файл логотипа в папку `images/` (например, `logo.png`)
2. В `index.html` замените блок с классом `logo-section__placeholder` на:
   ```html
   <img src="images/logo.png" alt="Мир Массажа" class="logo-section__logo">
   ```
3. В шапке сайта (все страницы) замените `header__logo-placeholder` на:
   ```html
   <img src="images/logo.png" alt="Мир Массажа" class="header__logo">
   ```

## Запуск

Откройте `index.html` в браузере или используйте локальный сервер:

```bash
# Python
python -m http.server 8000

# Node.js (npx)
npx serve
```

## Функциональность

- Плавная прокрутка
- Анимации при скролле (IntersectionObserver)
- Адаптивное мобильное меню
- Валидация форм
- SEO meta-теги
