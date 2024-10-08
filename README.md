# bmstuPressToPDF

## Описание

**bmstuPressToPDF** — это утилита для загрузки книг с сайта библиотеки МГТУ им. Н.Э. Баумана и сохранения их в формате PDF. Проект разработан для удобного чтения в оффлайн.

## Установка

1. Склонируйте репозиторий:
    ```sh
    git clone https://github.com/dan0102dan/bmstuPressToPDF
    cd bmstuPressToPDF
    ```

2. Настройте файл `config.ts`, вписав туда `id` и `token` вашего Telegram-бота, полученного от BotFather. Также укажите `Cookie`, взятые с авторизованной сессии на сайте, и директорию для временного сохранения файлов:
    ```ts
    // config.ts
    export const mainBot = {
        id: 0,
        token: ''
    }
    export const dir = '/tmp'
    export const Cookie = ''
    ```

3. Установите зависимости:
    ```sh
    npm install
    ```

4. Сгенерируйте JavaScript файлы:
    ```sh
    npx tsc
    ```

5. Запустите проект:
    ```sh
    node ./dist/bmstuPressBot.js
    ```

## Юридическая ответственность

Используя **bmstuPressToPDF**, вы соглашаетесь с тем, что:

- Проект предназначен только для личного использования. Вы обязуетесь не распространять загруженные книги и не использовать их в коммерческих целях.
- Вы несете полную ответственность за соблюдение авторских прав и правил использования контента, доступного на сайте библиотеки МГТУ им. Н.Э. Баумана.
- Автор проекта не несет ответственности за любые нарушения авторских прав или иных прав третьих лиц, которые могут возникнуть в результате использования этого программного обеспечения.

Перед использованием данного инструмента убедитесь, что вы имеете право загружать и сохранять контент с сайта библиотеки в соответствии с его условиями использования.