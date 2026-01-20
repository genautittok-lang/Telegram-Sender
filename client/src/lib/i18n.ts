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
  
  const phoneMatch = cleaned.match(/\+?[78]?(\d{10})/);
  
  if (phoneMatch) {
    const fullMatch = phoneMatch[0];
    const localPart = phoneMatch[1];
    
    if (!localPart.startsWith('9')) {
      return null;
    }
    
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
  
  return null;
}

export function extractRecipientData(line: string): { phone: string; name?: string; date?: string } | null {
  // Pattern: Name — Date — Phone
  // Example: Овчинникова Ольга Станиславовна — 2007-01-05 — +79500731429
  const parts = line.split(/[—\-\|]/).map(p => p.trim());
  
  let phone: string | null = null;
  let name: string | undefined;
  let date: string | undefined;

  if (parts.length >= 3) {
    // Try to find phone in parts
    for (let i = 0; i < parts.length; i++) {
      const p = parts[i];
      const extracted = extractPhoneNumber(p);
      if (extracted) {
        phone = extracted;
        // Assume name is the first part if not the phone
        if (i > 0) name = parts[0];
        // Assume date is the part before phone if 3+ parts
        if (i > 1) date = parts[i-1];
        break;
      }
    }
  } else {
    phone = extractPhoneNumber(line);
  }

  return phone ? { phone, name, date } : null;
}

export function parseRecipientsList(text: string): string[] {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  const phones: string[] = [];
  
  for (const line of lines) {
    const data = extractRecipientData(line);
    if (data) {
      phones.push(data.phone);
    }
  }
  
  return phones;
}
