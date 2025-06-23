https://github.com/Spigelsp1ke/web-larek-frontend.git
# Проектная работа "Веб-ларек"
Интернет‑магазин, написанный на TypeScript и собранный Webpack.Архитектура построена по паттерну Model‑View‑Presenter (MVP). Позволяет просматривать каталог товаров, добавлять их в корзину и оформлять заказы. 

## Паттерн проектирования
1. Model - Хранит данные и бизнес‑логику, публикует события об изменениях. 
Реализация: Model<T>, ShopState
2. View - Отвечает только за работу с DOM: отрисовку и обработку пользовательских действий.
Реализация: Component<T> и все наследники: Page, ProductCard, Basket, Form, ModalView
3. Presenter - Получает события от View/Model, координирует их работу, не трогает DOM напрямую.
Реализация: ShopPresenter + шина событий EventEmitter

## Структура проекта

Стек: HTML, SCSS, TS, Webpack

Структура проекта:
- src/ — исходные файлы проекта
- src/components/ — папка с JS компонентами
- src/components/base/ — папка с базовым кодом
- src/components/common/ — папка с общими файлами
- src/components/screens/ - папка с View-файлами

Важные файлы:
- src/pages/index.html — HTML-файл главной страницы
- src/types/index.ts — файл с типами
- src/index.ts — точка входа приложения
- src/scss/styles.scss — корневой файл стилей
- src/utils/constants.ts — файл с константами
- src/utils/utils.ts — файл с утилитами

## Опиcание классов
Базовый слой:
- **Component<T>** 
Поля: container: HTMLElementкласс 
Методы: render, toggleClass, setText, setImage, setDisabled, setHidden, setVisible
Назначение: Базовый класс View: хранит корневой элемент и утилиты для работы c DOM.
- **Model<T>** 
Поля: events: IEvents 
Методы: emit(event, payload)
Назначение: Абстракция модели предметной области и источник событий.
- **EventEmitter** 
Поля: _events: Map
Методы: render, toggleClass, setText, setImage, setDisabled, setHidden, setVisible
Назначение: Шина событий для связи слоёв.
- **Api** 
Поля: baseUrl, options
Методы: get, post, protected handleResponse
Назначение: Унифицированные HTTP‑запросы.

Общие компоненты:
- **Page** 
Поля: \_counter, \_catalog, \_wrapper, \_basket
Методы/сетторы: сетторы: counter, catalog, locked setHidden, setVisible
Назначение: Каркас страницы: шапка, счётчик корзины, галерея.
- **ProductCard** 
Поля: \_title, \_image, \_category, \_price, опц. \_description, \_button
Методы/сетторы: сетторы: id, title, image, category, price, description
Назначение: Карточка товара в каталоге/превью.
- **Basket** 
Поля: \_list, \_total, \_button
Методы/сетторы: сетторы: items, total, selected
Назначение: Представление модального окна корзины.
- **Form<T>** 
Поля: \_submit, \_errors
Методы: render(state), protected onInputChange
Назначение: Универсальная форма с валидацией.
- **ModalView** 
Поля: open(fragment), close()
Методы: get, post, protected handleResponse
Назначение: Обёртка над модальным окном.

View-экраны:
- **CatalogView** 
Поля: template — <template id="card-catalog">
Методы: private render(products); подписка на ui:catalog в конструкторе
Назначение: Генерирует карточки каталога, эмитит card:select
- **PreviewView** 
Поля: template — <template id="card-preview">
Методы: show(product) — заполняет карточку, открывает модалку
Назначение: Быстрый просмотр товара
- **BasketView** 
Поля: template — <template id="basket">	
Методы: show() — обновить список, сумму и открыть
private update()
Назначение: Корзина с товарами
- **OrderAddressView** 
Поля: template — <template id="order">	
Методы: show() — форма адреса и выбора оплаты; валидация
Назначение: Шаг 1 оформления
- **OrderContactsView** 
Поля: template — <template id="contacts">	
Методы: show() — форма контактов, использует Form<T>
Назначение: Шаг 2 оформления
- **SuccessView** 
Поля: template — <template id="success">
Методы: show(result) — выводит id заказа / списанную сумму
Назначение: Экран «Спасибо за заказ»

Presenter:
- **ShopPresenter.ts**
Назначение: Связывает Model и View через события. Не работает с DOM напрямую — получает готовые шаблоны от View. Инстанциирует все View-классы; слушает пользовательские события → вызывает методы модели и показывает нужные View;загружает каталог при старте

## Пользовательские события
```
catalog:change
```
Расположение: ShopState.setCatalog
Назначение: Каталог изменился, нужно перерисовать витрину.

```
card:select
```
Расположение: ProductCard → ShopPresenter
Назначение: Пользователь открыл превью товара.

```
basket:add
```
Расположение: PreviewView (кнопка «В корзину»)
Назначение: Добавить товар в корзину.

```
basket:remove
```
Расположение: BasketView (крестик у позиции)
Назначение: Удалить товар в корзину.

```
basket:open	
```
Расположение: Page (клик по иконке корзины)
Назначение: Открыть окно корзины.

```
ui:basket-counter	
```
Расположение: Presenter
Назначение: Показать количество товаров на иконке корзины.

```
modal:open / modal:close
```
Расположение: ModalView
Назначение: Состояние модального окна — открыто / закрыто.

```
ui:catalog	
```
Расположение: Presenter
Назначение: Передать витрину в представление.

```
order:step1:complete
```
Расположение: OrderAddressView
Назначение: Пользователь заполнил адрес и способ оплаты.

```
order:complete
```
Расположение: OrderContactsView
Назначение: Пользователь подтвердил контакты — оформить заказ

```
basket:update
```
Расположение: ShopState.addItem / removeItem
Назначение: Изменение конкретного поля формы.

```
order:success
```
Расположение: Presenter (после MarketAPI.order)
Назначение: Заказ успешно создан; показать экран «Спасибо».


## Установка и запуск
Для установки и запуска проекта необходимо выполнить команды

```
npm install
npm run start
```

или

```
yarn
yarn start
```
## Сборка

```
npm run build
```

или

```
yarn build
```





