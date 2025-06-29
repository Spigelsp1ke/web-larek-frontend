https://github.com/Spigelsp1ke/web-larek-frontend.git
# Проектная работа "Веб-ларек"
Интернет‑магазин, написанный на TypeScript и собранный Webpack.Архитектура построена по паттерну Model‑View‑Presenter (MVP). Позволяет просматривать каталог товаров, добавлять их в корзину и оформлять заказы. 

## Паттерн проектирования
1. Model - Хранит данные (каталог, корзина, заказ) и бизнес‑логику, инкапсулирует правила: подсчёт суммы, очистка корзины, Общается с сервером. 
Реализация: Model<T>, ShopState
2. View - Полностью управляет DOM: ищет узлы, вешает обработчики, меняет классы.Эмитит события о действиях пользователя. Никогда не вызывает API и не меняет Model напрямую.
Реализация: Component<T> и все наследники: Page, ProductCard, Basket, Form, ModalView
3. Presenter -  Подписывается на события View и Model, делегирует логику в Model (добавить товар, оформить заказ), конвертирует ответы Model в «ui:*» события для View, не взаимодействует с DOM.
Реализация: index.ts + шина событий EventEmitter
MVP-паттерн оставляет Presenter максимально без DOM, а View — без бизнес-логики. Это обеспечивает тестируемость, читаемость и простое масштабирование.

Как загружается отдельный View:
- При старте index.ts создаёт одиночные экземпляры всех *View.
- Presenter слушает события и вызывает view.render()/update()
- Повторные открытия не создают новые объекты — показывается тот же DOM-узел, данные заменяются методами render / update

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
Поля: container: HTMLElement 
Методы: render(data?: Partial<T>) - возвращает корневой DOM-элемент, toggleClass(element: HTMLElement, className: string, force?: boolean) - переключает класс, setText(element: HTMLElement, value: unknown) - устанавливает текстовое содержимое, setImage(element: HTMLImageElement, src: string, alt?: string) - устанавливает изображение с алтернативным текстом, setDisabled(element: HTMLElement, state: boolean) - меняет статус блокировки, setHidden(element: HTMLElement) - скрывает элемент, setVisible(element: HTMLElement) - показывает элемент
Назначение: Базовый класс View: хранит корневой элемент и утилиты для работы c DOM.
- **Model<T>** 
Поля: constructor(data: Partial<T>,events: EventEmitter) 
Методы: emit(event, payload)
Назначение: Абстракция модели предметной области и источник событий.
- **EventEmitter** 
Поля: _events: Map
Методы: on<T extends object>(eventName: EventName, callback: (event: T) => void) - устанавливает обработчик на событие, off(eventName: EventName, callback: Subscriber) - Снять обработчик с события, emit<T extends object>(eventName: string, data?: T) - инициирует событие с данными, onAll(callback: (event: EmitterEvent) => void) - слушает все события, offAll() - сбрасывает все обработчики, trigger<T extends object>(eventName: string, context?: Partial<T>) - делает коллбек триггер, генерирующий событие при вызове
Назначение: Шина событий для связи слоёв.
- **Api** 
Поля: baseUrl, options
Методы: get<T>(uri: string) - получает данные с сервера, post<T>(uri: string, data: object, method: ApiPostMethods = 'POST') - отправляет данные на сервер, protected handleResponse(response: Response): Promise<object> - нормализирует ответ
Назначение: Унифицированные HTTP‑запросы.
- **MarketAPI**
Методы: getCatalog() — получает список товаров, конвертирует ссылки на CDN.
createOrder(data) — создаёт заказ.
Назначение: Надстройка над Api
- **ShopState**
Методы: addItem(id) / removeItem(id) — управляют списком в корзине и шлют basket:update, setOrderField(key, value) — универсальный сеттер полей заказа, Валидация разбита на validateStep1(), validateStep2() и validate() с эмитами order:validated, order:step1:validated, order:step2:validated
Назначение: Расширяет Model<IAppState> и содержит бизнес‑правила

Общие компоненты:
- **Page** 
Поля: \_counter, \_catalog, \_wrapper, \_basket
Методы/сетторы: сетторы: counter(value: number) - устанавливает счетчик корзины, catalog(items: HTMLElement[]) - устанавливает каталог товаров, locked(value: boolean) - блокирует прокрутку страницы
Назначение: Каркас страницы: шапка, счётчик корзины, галерея.
- **ProductCard** 
Поля: \_title, \_image, \_category, \_price, опц. \_description, \_button
Методы/сетторы: сетторы: id(value: string), title(value: string), image(value: string), category(value: string), price(value: number), description(value: string) — обновляют DOM; render() — отдаёт заполненный контейнер.
Назначение: Карточка товара в каталоге/превью.
- **PaymentSelector**
Поля: get value() — текущий выбранный способ оплаты; constructor(root, events) — ищет все button[name], вешает обработчик клика: переключает активный стиль, сохраняет выбранное значение и эмитит событие payment:change.
Назначение: UI‑контрол для выбора способа оплаты.
- **BasketItem**
Поля: constructor(product, index, events) — заполняет DOM‑узел, регистрирует удаление basket:remove.
Методы: render() — возвращает готовый элемент.
Назначение: Отдельная строка товара в корзине.
- **Form<T>** 
Поля: \_submit, \_errors
Методы: updateValidation(data: { valid: boolean; errors: string[] }) - обновляет валидацию
Назначение: Абстрактный класс. Универсальная форма с валидацией. Обрабатывает input/submit, эмитит order:change; метод updateValidation() обновляет кнопку и блок ошибок.

View-экраны:
- **ModalView** 
Поля: constructor
Методы: open() - вставляет контент, показывает модалку и бросает modal:open; close() — скрывает и очищает контент, эмитит modal:close.
Назначение: Обёртка над модальным окном.
- **CatalogView** 
Поля: template — <template id="card-catalog">
Методы: private render(products) - создаёт карточки и заменяет содержимое галереи, подписка на ui:catalog в конструкторе
Назначение: Использует ProductCardFactory для генеррации карточек, эмитит card:select
- **ProductCardFactory**
Методы: create(container: HTMLElement, product: IProduct) - генерирует карточку
Назначение: Фабрика для генерации карточек
- **PreviewView** 
Поля: template — <template id="card-preview">
Методы: show(product) — заполняет карточку, открывает модалку
Назначение: Быстрый просмотр товара
- **BasketView** 
Поля: template — <template id="basket">	
Методы: render() — возвращает элемент
update({ rows,total,selected }) - принимает готовые BasketItem-узлы,обновляет корзину
Назначение: Корзина с товарами
- **OrderAddressView** 
Поля: template — <template id="order">	
Методы: show() — форма адреса и выбора оплаты; валидация; setupPaymentButtons() — переключает активную кнопку, эмитит order:change; setupAddressInput() — лайв‑валидация адреса; setupFormSubmission() — при submit эмитит order:step1:complete, clear() - очищает форму после успешного заказа
Назначение: Шаг 1 оформления заказа. Наследует Form.
- **OrderContactsView** 
Поля: template — <template id="contacts">	
Методы: show() — форма почты и телефона; валидация; setupPaymentButtons() — переключает активную кнопку, эмитит order:change; setupAddressInput() — лайв‑валидация адреса; setupFormSubmission() — при submit эмитит order:step1:complete, clear() - очищает форму после успешного заказа
Назначение: Шаг 2 оформления заказа. Наследует Form.
- **SuccessView** 
Поля: template — <template id="success">
Методы: show(res) —  выводит списанную сумму и возвращает элемент
Назначение: Экран «Спасибо за заказ»

Presenter:
- **index.ts**
Назначение: Связывает Model и View через события. Не работает с DOM напрямую — получает готовые шаблоны от View. Инстанциирует все View-классы; слушает пользовательские события → вызывает методы модели и показывает нужные View; загружает каталог при старте

## Пользовательские события
```
catalog:change
```
Расположение: ShopState.setCatalog
Назначение: Каталог изменился, нужно перерисовать витрину.

```
card:select
```
Расположение: ProductCard → Presenter
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

```
payment:change
```
Расположение: PaymentSelector
Назначение: Cообщает о выбранном способе оплаты.

```
basket:render
```
Расположение: Presenter
Назначение: Передаёт данные для перерисовки корзины

```
order:step1:validated / order:step2:validated
```
Расположение: Presenter
Назначение: Результаты пошаговой проверки форм.

```
modal:request-close
```
Расположение: PreviewView
Назначение: «Мягкая» просьба к ModalView закрыться

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





