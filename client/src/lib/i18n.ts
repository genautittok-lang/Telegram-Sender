import { createContext, useContext } from "react";

export type Language = 'en' | 'uk' | 'ru';

export const translations = {
  en: {
    dashboard: 'Dashboard',
    accounts: 'Accounts',
    logs: 'Logs',
    settings: 'Settings',
    totalAccounts: 'Total Accounts',
    activeAccounts: 'Active Accounts',
    messagesSent: 'Messages Sent',
    errors: 'Errors',
    startAll: 'Start All',
    stopAll: 'Stop All',
    pauseAll: 'Pause All',
    start: 'Start',
    stop: 'Stop',
    pause: 'Pause',
    delete: 'Delete',
    save: 'Save',
    cancel: 'Cancel',
    add: 'Add',
    edit: 'Edit',
    back: 'Back',
    addAccount: 'Add Account',
    phoneNumber: 'Phone Number',
    apiId: 'API ID',
    apiHash: 'API Hash',
    requestCode: 'Request Code',
    sendCode: 'Send Code',
    verificationCode: 'Verification Code',
    twoFactorPassword: '2FA Password (if enabled)',
    signIn: 'Sign In',
    verifyConnect: 'Verify & Connect',
    connectTelegram: 'Connect Telegram Account',
    codeSentTo: 'Code sent to',
    telegramCode: 'Telegram Code',
    messageTemplate: 'Message Template',
    recipients: 'Recipients',
    addRecipients: 'Add Recipients',
    manageRecipients: 'Manage Recipients',
    clearRecipients: 'Clear All',
    recipientsHint: 'Paste recipients list. Format: "Name — Date — Phone" or just phone number (one per line)',
    importList: 'Import List',
    currentList: 'Current List',
    noRecipients: 'No recipients yet.',
    minDelay: 'Min Delay (sec)',
    maxDelay: 'Max Delay (sec)',
    proxy: 'Proxy URL',
    config: 'Config',
    accountConfig: 'Account Configuration',
    saveChanges: 'Save Changes',
    templateOverride: 'This message will override any group templates.',
    schedule: 'Schedule',
    scheduleType: 'Schedule Type',
    manual: 'Manual',
    daily: 'Daily',
    weekly: 'Weekly',
    scheduleTime: 'Start Time',
    scheduleDays: 'Days',
    monday: 'Mon',
    tuesday: 'Tue',
    wednesday: 'Wed',
    thursday: 'Thu',
    friday: 'Fri',
    saturday: 'Sat',
    sunday: 'Sun',
    status: 'Status',
    idle: 'Idle',
    running: 'Running',
    waiting: 'Waiting',
    sending: 'Sending',
    error: 'Error',
    pending: 'Pending',
    sent: 'Sent',
    failed: 'Failed',
    groupName: 'Group Name',
    createGroup: 'Create Group',
    noGroup: 'No Group',
    info: 'Info',
    warn: 'Warning',
    systemOperational: 'System Operational',
    added: 'Added',
    deleteConfirm: 'Delete account? This cannot be undone.',
    clearConfirm: 'Are you sure you want to delete ALL recipients for this account?',
    noAccountsFound: 'No accounts found. Add one to get started.',
    loadingAccounts: 'Loading accounts...',
    noValidPhones: 'No valid phone numbers found in the input.',
    phonesExtracted: 'phone numbers extracted',
    globalOverview: 'Global overview of your Telegram automation.',
    consoleLog: 'console.log',
    realtimeLogs: 'Real-time activity log from all accounts.',
    progress: 'Progress',
    noAccountsConnected: 'No accounts connected. Go to the Accounts page to add one.',
    manageAccounts: 'Manage your connected Telegram accounts.',
    organizeGroups: 'Organize accounts and share message templates.',
    noTemplateSet: 'No template set',
    created: 'Created',
    sharedTemplate: 'Shared Message Template',
    apiCredentials: 'API Credentials (recommended)',
    apiCredentialsHint: 'Using your own API credentials reduces ban risk. Get them at my.telegram.org/apps',
    testNow: 'Test',
    testSmsSuccess: 'SMS test passed! Code request sent successfully.',
    testSmsFailed: 'SMS test failed. Check the phone number.',
    kyivTime: 'Kyiv time',
    qrLogin: 'QR Login',
    scanQrCode: 'Scan this QR code with Telegram app',
    proxyUrl: 'Proxy URL',
    proxyHint: 'Format: socks5://user:pass@host:port or http://host:port',
    testMessage: 'Test Message',
    testPhoneNumber: 'Phone Number',
    sendTestMessage: 'Send Test',
    testMessageSuccess: 'Test message sent successfully!',
    testMessageFailed: 'Failed to send test message',
    testMessageHint: 'Send a test message to verify account works',
    advanced: 'Advanced Settings',
  },
  uk: {
    dashboard: 'Панель',
    accounts: 'Акаунти',
    groups: 'Групи',
    logs: 'Логи',
    settings: 'Налаштування',
    totalAccounts: 'Всього акаунтів',
    activeAccounts: 'Активні акаунти',
    messagesSent: 'Повідомлень надіслано',
    errors: 'Помилки',
    startAll: 'Запустити всі',
    stopAll: 'Зупинити всі',
    pauseAll: 'Пауза всіх',
    start: 'Запустити',
    stop: 'Зупинити',
    pause: 'Пауза',
    delete: 'Видалити',
    save: 'Зберегти',
    cancel: 'Скасувати',
    add: 'Додати',
    edit: 'Редагувати',
    back: 'Назад',
    addAccount: 'Додати акаунт',
    phoneNumber: 'Номер телефону',
    apiId: 'API ID',
    apiHash: 'API Hash',
    requestCode: 'Запросити код',
    sendCode: 'Надіслати код',
    verificationCode: 'Код підтвердження',
    twoFactorPassword: 'Пароль 2FA (якщо увімкнено)',
    signIn: 'Увійти',
    verifyConnect: 'Підтвердити та підключити',
    connectTelegram: 'Підключити Telegram акаунт',
    codeSentTo: 'Код надіслано на',
    telegramCode: 'Код Telegram',
    messageTemplate: 'Шаблон повідомлення',
    recipients: 'Одержувачі',
    addRecipients: 'Додати одержувачів',
    manageRecipients: 'Управління одержувачами',
    clearRecipients: 'Очистити всіх',
    recipientsHint: 'Вставте список одержувачів. Формат: "Ім\'я — Дата — Телефон" або просто номер телефону (по одному на рядок)',
    importList: 'Імпортувати список',
    currentList: 'Поточний список',
    noRecipients: 'Немає одержувачів.',
    minDelay: 'Мін. затримка (сек)',
    maxDelay: 'Макс. затримка (сек)',
    proxy: 'Proxy URL',
    config: 'Налаштування',
    accountConfig: 'Налаштування акаунта',
    saveChanges: 'Зберегти зміни',
    templateOverride: 'Це повідомлення замінить шаблони групи.',
    schedule: 'Розклад',
    scheduleType: 'Тип розкладу',
    manual: 'Вручну',
    daily: 'Щодня',
    weekly: 'Щотижня',
    scheduleTime: 'Час старту',
    scheduleDays: 'Дні',
    monday: 'Пн',
    tuesday: 'Вт',
    wednesday: 'Ср',
    thursday: 'Чт',
    friday: 'Пт',
    saturday: 'Сб',
    sunday: 'Нд',
    status: 'Статус',
    idle: 'Очікує',
    running: 'Працює',
    waiting: 'Очікує',
    sending: 'Надсилає',
    error: 'Помилка',
    pending: 'Очікує',
    sent: 'Надіслано',
    failed: 'Помилка',
    groupName: 'Назва групи',
    createGroup: 'Створити групу',
    noGroup: 'Без групи',
    info: 'Інфо',
    warn: 'Попередження',
    systemOperational: 'Система працює',
    added: 'Додано',
    deleteConfirm: 'Видалити акаунт? Цю дію не можна скасувати.',
    clearConfirm: 'Ви впевнені, що хочете видалити ВСІХ одержувачів цього акаунта?',
    noAccountsFound: 'Акаунтів не знайдено. Додайте один, щоб почати.',
    loadingAccounts: 'Завантаження акаунтів...',
    noValidPhones: 'Не знайдено дійсних номерів телефонів.',
    phonesExtracted: 'номерів телефонів знайдено',
    globalOverview: 'Огляд Telegram автоматизації.',
    consoleLog: 'console.log',
    realtimeLogs: 'Логи активності з усіх акаунтів в реальному часі.',
    progress: 'Прогрес',
    noAccountsConnected: 'Акаунтів немає. Перейдіть на сторінку Акаунтів.',
    manageAccounts: 'Керування вашими Telegram акаунтами.',
    organizeGroups: 'Організуйте акаунти та діліться шаблонами.',
    noTemplateSet: 'Шаблон не встановлено',
    created: 'Створено',
    sharedTemplate: 'Спільний шаблон',
    apiCredentials: 'API ключі (рекомендовано)',
    apiCredentialsHint: 'Використання власних API ключів зменшує ризик бану. Отримайте на my.telegram.org/apps',
    testNow: 'Тест',
    testSmsSuccess: 'SMS тест пройдено! Код успішно надіслано.',
    testSmsFailed: 'SMS тест не пройдено. Перевірте номер телефону.',
    kyivTime: 'за Києвом',
    qrLogin: 'QR вхід',
    scanQrCode: 'Скануйте QR код в додатку Telegram',
    proxyUrl: 'Proxy URL',
    proxyHint: 'Формат: socks5://user:pass@host:port або http://host:port',
    testMessage: 'Тестове повідомлення',
    testPhoneNumber: 'Номер телефону',
    sendTestMessage: 'Надіслати тест',
    testMessageSuccess: 'Тестове повідомлення надіслано!',
    testMessageFailed: 'Не вдалося надіслати тестове повідомлення',
    testMessageHint: 'Надіслати тест для перевірки акаунта',
    advanced: 'Додаткові налаштування',
  },
  ru: {
    dashboard: 'Панель',
    accounts: 'Аккаунты',
    groups: 'Группы',
    logs: 'Логи',
    settings: 'Настройки',
    totalAccounts: 'Всего аккаунтов',
    activeAccounts: 'Активные аккаунты',
    messagesSent: 'Сообщений отправлено',
    errors: 'Ошибки',
    startAll: 'Запустить все',
    stopAll: 'Остановить все',
    pauseAll: 'Пауза всех',
    start: 'Запустить',
    stop: 'Остановить',
    pause: 'Пауза',
    delete: 'Удалить',
    save: 'Сохранить',
    cancel: 'Отмена',
    add: 'Добавить',
    edit: 'Редактировать',
    back: 'Назад',
    addAccount: 'Добавить аккаунт',
    phoneNumber: 'Номер телефона',
    apiId: 'API ID',
    apiHash: 'API Hash',
    requestCode: 'Запросить код',
    sendCode: 'Отправить код',
    verificationCode: 'Код подтверждения',
    twoFactorPassword: 'Пароль 2FA (если включён)',
    signIn: 'Войти',
    verifyConnect: 'Подтвердить и подключить',
    connectTelegram: 'Подключить Telegram аккаунт',
    codeSentTo: 'Код отправлен на',
    telegramCode: 'Код Telegram',
    messageTemplate: 'Шаблон сообщения',
    recipients: 'Получатели',
    addRecipients: 'Добавить получателей',
    manageRecipients: 'Управление получателями',
    clearRecipients: 'Очистить всех',
    recipientsHint: 'Вставьте список получателей. Формат: "Имя — Дата — Телефон" или просто номер телефона (по одному на строку)',
    importList: 'Импортировать список',
    currentList: 'Текущий список',
    noRecipients: 'Нет получателей.',
    minDelay: 'Мин. задержка (сек)',
    maxDelay: 'Макс. задержка (сек)',
    proxy: 'Proxy URL',
    config: 'Настройки',
    accountConfig: 'Настройки аккаунта',
    saveChanges: 'Сохранить изменения',
    templateOverride: 'Это сообщение переопределит шаблоны группы.',
    schedule: 'Расписание',
    scheduleType: 'Тип расписания',
    manual: 'Вручную',
    daily: 'Ежедневно',
    weekly: 'Еженедельно',
    scheduleTime: 'Время старта',
    scheduleDays: 'Дни',
    monday: 'Пн',
    tuesday: 'Вт',
    wednesday: 'Ср',
    thursday: 'Чт',
    friday: 'Пт',
    saturday: 'Сб',
    sunday: 'Нд',
    status: 'Статус',
    idle: 'Ожидает',
    running: 'Работает',
    waiting: 'Ожидает',
    sending: 'Отправляет',
    error: 'Ошибка',
    pending: 'Ожидает',
    sent: 'Отправлено',
    failed: 'Ошибка',
    groupName: 'Название группы',
    createGroup: 'Создать группу',
    noGroup: 'Без группы',
    info: 'Инфо',
    warn: 'Предупреждение',
    systemOperational: 'Система работает',
    added: 'Додано',
    deleteConfirm: 'Удалить аккаунт? Это действие нельзя отменить.',
    clearConfirm: 'Вы уверены, что хотите удалить ВСЕХ получателей этого аккаунта?',
    noAccountsFound: 'Аккаунтов не найдено. Добавьте один, чтобы начать.',
    loadingAccounts: 'Загрузка аккаунтов...',
    noValidPhones: 'Не найдено действительных номеров телефонов.',
    phonesExtracted: 'номеров телефонов найдено',
    globalOverview: 'Обзор вашей Telegram автоматизации.',
    consoleLog: 'console.log',
    realtimeLogs: 'Логи активности в реальном времени.',
    progress: 'Прогресс',
    noAccountsConnected: 'Аккаунтов нет. Перейдите на страницу Аккаунтов.',
    manageAccounts: 'Управление вашими Telegram аккаунтами.',
    organizeGroups: 'Организуйте аккаунты и делитесь шаблонами.',
    noTemplateSet: 'Шаблон не установлен',
    created: 'Создано',
    sharedTemplate: 'Общий шаблон',
    apiCredentials: 'API ключи (рекомендуется)',
    apiCredentialsHint: 'Использование своих API ключей уменьшает риск бана. Получите на my.telegram.org/apps',
    testNow: 'Тест',
    testSmsSuccess: 'SMS тест пройден! Код успешно отправлен.',
    testSmsFailed: 'SMS тест не пройден. Проверьте номер телефона.',
    kyivTime: 'по Киеву',
    qrLogin: 'QR вход',
    scanQrCode: 'Сканируйте QR код в приложении Telegram',
    proxyUrl: 'Proxy URL',
    proxyHint: 'Формат: socks5://user:pass@host:port или http://host:port',
    testMessage: 'Тестовое сообщение',
    testPhoneNumber: 'Номер телефона',
    sendTestMessage: 'Отправить тест',
    testMessageSuccess: 'Тестовое сообщение отправлено!',
    testMessageFailed: 'Не удалось отправить тестовое сообщение',
    testMessageHint: 'Отправить тест для проверки аккаунта',
    advanced: 'Дополнительные настройки',
  },
};

export type TranslationKey = keyof typeof translations.en;

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: TranslationKey) => string;
}

export const LanguageContext = createContext<LanguageContextType>({
  lang: 'uk',
  setLang: () => {},
  t: (key) => key,
});

export function useLanguage() {
  return useContext(LanguageContext);
}

export function extractPhoneNumber(line: string): string | null {
  const cleaned = line.replace(/[\s\-\(\)]/g, '');
  
  // Ukrainian numbers: +380XXXXXXXXX (12 digits total)
  const uaMatch = cleaned.match(/\+?380(\d{9})/);
  if (uaMatch) {
    return '+380' + uaMatch[1];
  }
  
  // Russian numbers: +7XXXXXXXXXX or 8XXXXXXXXXX (11 digits, local part starts with 9)
  const ruMatch = cleaned.match(/\+?[78]?(\d{10})/);
  if (ruMatch) {
    const fullMatch = ruMatch[0];
    const localPart = ruMatch[1];
    
    // Russian mobile numbers start with 9
    if (!localPart.startsWith('9')) {
      // Not a Russian mobile, skip this match
    } else {
      if (fullMatch.startsWith('+7') && fullMatch.length === 12) {
        return fullMatch;
      }
      if (fullMatch.startsWith('+8') && fullMatch.length === 12) {
        return '+7' + localPart;
      }
      if ((fullMatch.startsWith('8') || fullMatch.startsWith('7')) && fullMatch.length === 11) {
        return '+7' + localPart;
      }
      if (localPart.length === 10 && localPart.startsWith('9')) {
        return '+7' + localPart;
      }
      return '+7' + localPart;
    }
  }
  
  // Generic international format: +XXXXXXXXXXX (10-15 digits after +)
  const intlMatch = cleaned.match(/^\+(\d{10,15})$/);
  if (intlMatch) {
    return '+' + intlMatch[1];
  }
  
  return null;
}

export function extractRecipientData(line: string): { identifier: string; name?: string; date?: string } | null {
  // Pattern: Name — Date — Phone/Username
  // Example: Овчинникова Ольга Станиславовна — 2007-01-05 — +79500731429
  // Example: @username
  // Example: username
  const parts = line.split(/[—\-\|]/).map(p => p.trim());
  
  let identifier: string | null = null;
  let name: string | undefined;
  let date: string | undefined;

  // If it's a single part, check if it's a username or phone
  if (parts.length === 1) {
    const raw = parts[0];
    if (raw.startsWith('@')) {
      return { identifier: raw };
    }
    const phone = extractPhoneNumber(raw);
    if (phone) return { identifier: phone };
    
    // If it looks like a username (no spaces, reasonably long)
    if (/^[a-zA-Z0-9_]{5,32}$/.test(raw)) {
      return { identifier: '@' + raw };
    }
    return null;
  }

  // Multi-part line
  if (parts.length >= 2) {
    // Try to find identifier (phone or @username) in parts, usually the last one
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i];
      
      // Check for @username
      if (p.startsWith('@')) {
        identifier = p;
      } else {
        // Check for phone
        const phone = extractPhoneNumber(p);
        if (phone) identifier = phone;
      }

      if (identifier) {
        // Name is usually the first part if it's not the identifier
        if (i !== 0) name = parts[0];
        // Date is often the middle part
        if (parts.length >= 3 && i === parts.length - 1) {
          date = parts[1];
        }
        break;
      }
    }
  }

  return identifier ? { identifier, name, date } : null;
}

export function parseRecipientsList(text: string): string[] {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  const identifiers: string[] = [];
  
  for (const line of lines) {
    const data = extractRecipientData(line);
    if (data) {
      identifiers.push(data.identifier);
    }
  }
  
  return identifiers;
}
