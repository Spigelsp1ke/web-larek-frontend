https://github.com/Spigelsp1ke/web-larek-frontend.git
# Проектная работа "Веб-ларек"
Учебный проект Web-Larek, реализованный на TypeScript при помощи паттерна MVP (Model-View-Presenter). Предствляет из себя интернет-магазин, принимающий данные с сервера и отправляющий данные на сервер. 

Стек: HTML, SCSS, TS, Webpack

Структура проекта:
- src/ — исходные файлы проекта
- src/components/ — папка с JS компонентами
- src/components/base/ — папка с базовым кодом
- src/components/common/ — папка с общими файлами

Важные файлы:
- src/pages/index.html — HTML-файл главной страницы
- src/types/index.ts — файл с типами
- src/index.ts — точка входа приложения
- src/scss/styles.scss — корневой файл стилей
- src/utils/constants.ts — файл с константами
- src/utils/utils.ts — файл с утилитами

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
## Опиcание классов
Базовые файлы:
- api.ts - класс API - получение и отправка данных с сервера
- Component.ts - класс Component<T>	- абстрактный класс - сохраняет container: HTMLElement, предоставляет хелперы setText, setImage, toggleClass 
- events.ts - класс IEvents - связывает все слои между собой
- Model.ts - класс Model<T> - Базовый класс предметной модели, метод emit - эмиттер событий

Common-файлы:
- Basket.ts - класс Basket регулирует поведение корзины, получает их, а также регулирует пустую корзину. 
- Form.ts - класс Form отвечает за поведение формы на странице. 
- Modal.ts - класс ModalView - Универсальное модальное окно;генерирует поведение модальных окон, закрытие при различных действиях (методы open и close создают modal:open и modal:close).
- Page.ts - класс Page отвечает за макет целиком: шапка, счётчик корзины, контейнер для каталога. Наследует абстрактный класс Component. 

Компоненты:
- AppData.ts - класс ShopState хранит данные о приложении. Держит в себе каталог товаров и черновик заказа. Наследует абстракный класс Model. Методы: addItem, removeItem, clearBasket, getTotal, setCatalog.
- MarketAPI.ts - файл нормализует ответы с сервера (класс MarketAPI выполняет нормализацию; методы getCatalog, order)
- ProductCard.ts - класс ProductCard выполняет представление товара в списке. Наследует абстрактный класс Component. Constructor в классе собирает информацию о товаре.
- ShopPresenter.ts - файл, который реализует и связывает весь сценарий. Класс ShopPresenter принимает ShopState, MarketAPI, модальные окна, формы. 
Методы:
init - "вешает" события на различные елементы проекта,
renderCatalog - показывает каталог товаров на странице,
openPreview - при помощи ProductCard, получает превью и реализует на странице, 
openBasket - получает и отображает корзину,
updateHeaderCounter - обновляет счетчик корзины на главной странице,
openOrderStep1 - создание первой формы для оформления заказа,
openOrderStep2 - создание второй формы для оформления заказа,
showSuccess - вывод окна успешного заказа

Model-View-Presenter (MVP) - шаблон проектирования, в данном проекте:
Model: классы Model<T> и ShopState
View: классы ProductCard, Modal, Page, Basket, Form
Presenter: ShopPresenter





