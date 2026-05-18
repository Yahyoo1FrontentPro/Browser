# 🛠 Локальный запуск Aura Nexus Browser (Windows)

Добро пожаловать в руководство разработчика! Здесь описан идеальный Developer Experience (DX) workflow для быстрого старта локальной разработки (Next.js + Tauri + Rust) на Windows.

## 1. Environment Setup (Локальные секреты)

Чтобы ваш статус **«Владельца» (God-Mode)** работал в локальной среде (без деплоя на Render), необходимо создать файл `.env.local` в корне проекта.

Создайте файл `.env.local` и добавьте следующие ключи:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL="https://[PROJECT_ID].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbG...[ВАШ_ANON_KEY]"
SUPABASE_SERVICE_ROLE_KEY="eyJhbG...[ВАШ_SERVICE_ROLE_KEY]"

# God-Mode / Identity
# Замените на ваш ID из Supabase Auth (найти можно в таблице auth.users)
OWNER_ID="d3b5b5c9-XXXX-XXXX-XXXX-XXXXXXXXXXXX"
```

> **Важно:** Переменная `OWNER_ID` и ваши ключи считываются на сервере Next.js (в `src/lib/auth-engine.ts` или `middleware.ts`). Она автоматически дарует вам все права уровня `'owner'`, обходя проверки подписки в базе данных.

## 2. Установка зависимостей Windows (Tauri & Rust)

Так как Tauri использует нативные системные компоненты, на Windows требуется установить C++ линкер, Rust и WebView2.

Откройте **PowerShell от имени администратора** и выполните следующие команды по очереди:

### A. Установка пакетного менеджера Winget (если еще не установлен)
Обычно установлен по умолчанию в Windows 10/11. Если нет, обновите "Установщик приложений" из Microsoft Store.

### B. Установка C++ Build Tools (Линкер)
Для компиляции Rust-кода под Windows обязателен C++ Build Tools.
```powershell
winget install --id Microsoft.VisualStudio.2022.BuildTools --exact --force --accept-package-agreements --accept-source-agreements
```
*(После установки может потребоваться открыть **Visual Studio Installer**, нажать "Изменить" и убедиться, что выбрана рабочая нагрузка **"Разработка классических приложений на C++"** / "Desktop development with C++".)*

### C. Установка WebView2
Движок рендеринга для окна Tauri на Windows:
```powershell
winget install --id Microsoft.EdgeWebView2Runtime --exact
```

### D. Установка Rust и Node.js
```powershell
# Установка Rust (Rustup)
winget install --id Rustlang.Rustup --exact

# Установка Node.js (LTS)
winget install --id OpenJS.NodeJS.LTS
```
*(После выполнения команд перезапустите терминал, чтобы обновились переменные среды).*

## 3. Настройка скриптов запуска (package.json)

Для идеального DX мы настроим запуск Next.js и Tauri одной командой, используя пакеты `concurrently` (для параллельного запуска) и `wait-on` (чтобы окно Tauri не открывалось, пока Next.js сервер не будет готов).

Сначала установите эти dev-зависимости:
```bash
npm install concurrently wait-on cross-env --save-dev
```

Затем добавьте/обновите блок `scripts` в вашем `package.json`:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    
    "tauri": "tauri",
    "dev:desktop": "cross-env NODE_ENV=development concurrently -k \"npm run dev\" \"npm run tauri:wait\"",
    "tauri:wait": "wait-on http://localhost:3000 && tauri dev"
  }
}
```
**Как это работает:**
Команда `npm run dev:desktop` запустит локальный сервер Next.js. Утилита `wait-on` будет пинговать порт 3000. Как только Next.js соберет проект и откроет порт, автоматически запустится компиляция ядра Rust и откроется окно Tauri. 

*Примечание:* Убедитесь, что в `src-tauri/tauri.conf.json` свойство `"beforeDevCommand"` пустое (`""`), а `"devPath"` равно `"http://localhost:3000"`.

## 4. Troubleshooting (Решение частых проблем)

При сборке Tauri на Windows могут возникать специфичные ошибки. Вот Топ-3 и их решения:

### ❌ Ошибка 1: `error: linker 'link.exe' not found`
**Причина:** Rust не видит установленный C++ Build Tools.
**Решение:** Откройте меню «Пуск», найдите "Visual Studio Installer", нажмите «Изменить» (Modify) и убедитесь, что установлена галочка напротив **"Разработка классических приложений на C++"** (Desktop development with C++), и справа в компонентах выбраны: `MSVC v143 - VS 2022 C++ x64/x86 build tools` и `Windows 11/10 SDK`.

### ❌ Ошибка 2: Конфликт портов (Белый экран в окне Tauri)
**Симптом:** Окно Tauri открывается, но отображает "localhost refused to connect" или просто пустой белый экран.
**Причина:** Tauri загрузил `http://localhost:3000` до того, как Next.js завершил тяжелую первую компиляцию страниц.
**Решение:** Наш скрипт с `wait-on` решает 99% этих проблем. Однако, если первая сборка Next.js слишком медленная, окно может отвалиться по таймауту. Решение — просто нажать в окне браузера комбинацию `Ctrl + F5` (или `F5`) для перезагрузки фрейма после того, как в консоли Next.js появится надпись `compiled successfully`.

### ❌ Ошибка 3: `Error failed to build webview2` / Несовместимость версий
**Причина:** Отсутствуют, повреждены или конфликтуют библиотеки WebView2 Runtime на уровне операционной системы.
**Решение:** Принудительно обновите Edge WebView2:
```powershell
winget install --id Microsoft.EdgeWebView2Runtime --exact --force
```
Если проблема сохраняется, удалите папку кэша компиляции Rust: удалите директорию `src-tauri/target/` и выполните сборку заново (`npm run dev:desktop`).
