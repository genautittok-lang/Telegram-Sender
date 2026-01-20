export type Language = 'en' | 'uk' | 'ru';

export const translations = {
  en: {
    // Navigation
    dashboard: 'Dashboard',
    accounts: 'Accounts',
    groups: 'Groups',
    logs: 'Logs',
    settings: 'Settings',
    
    // Dashboard
    totalAccounts: 'Total Accounts',
    activeAccounts: 'Active Accounts',
    messagesSent: 'Messages Sent',
    errors: 'Errors',
    
    // Controls
    startAll: 'Start All',
    stopAll: 'Stop All',
    pauseAll: 'Pause All',
    start: 'Start',
    stop: 'Stop',
    delete: 'Delete',
    save: 'Save',
    cancel: 'Cancel',
    add: 'Add',
    edit: 'Edit',
    
    // Account
    addAccount: 'Add Account',
    phoneNumber: 'Phone Number',
    apiId: 'API ID',
    apiHash: 'API Hash',
    requestCode: 'Request Code',
    verificationCode: 'Verification Code',
    twoFactorPassword: '2FA Password (if enabled)',
    signIn: 'Sign In',
    messageTemplate: 'Message Template',
    recipients: 'Recipients',
    addRecipients: 'Add Recipients',
    clearRecipients: 'Clear Recipients',
    recipientsHint: 'Paste list of recipients (one per line). Format: Name — Date — Phone or just phone number',
    minDelay: 'Min Delay (sec)',
    maxDelay: 'Max Delay (sec)',
    proxy: 'Proxy URL',
    
    // Scheduling
    schedule: 'Schedule',
    scheduleType: 'Schedule Type',
    manual: 'Manual',
    daily: 'Daily',
    weekly: 'Weekly',
    scheduleTime: 'Time',
    scheduleDays: 'Days',
    monday: 'Mon',
    tuesday: 'Tue',
    wednesday: 'Wed',
    thursday: 'Thu',
    friday: 'Fri',
    saturday: 'Sat',
    sunday: 'Sun',
    
    // Status
    status: 'Status',
    idle: 'Idle',
    running: 'Running',
    waiting: 'Waiting',
    sending: 'Sending',
    error: 'Error',
    pending: 'Pending',
    sent: 'Sent',
    failed: 'Failed',
    
    // Groups
    groupName: 'Group Name',
    createGroup: 'Create Group',
    noGroup: 'No Group',
    
    // Logs
    info: 'Info',
    warn: 'Warning',
    
    // Messages
    accountAdded: 'Account added successfully',
    accountDeleted: 'Account deleted',
    recipientsAdded: 'Recipients added',
    codeSent: 'Verification code sent',
    authSuccess: 'Authentication successful',
    noRecipientsFound: 'No valid phone numbers found',
    
    // Validation
    invalidPhone: 'Invalid phone number format',
    required: 'This field is required',
  },
  
  uk: {
    // Navigation
    dashboard: 'Панель',
    accounts: 'Акаунти',
    groups: 'Групи',
    logs: 'Логи',
    settings: 'Налаштування',
    
    // Dashboard
    totalAccounts: 'Всього акаунтів',
    activeAccounts: 'Активні акаунти',
    messagesSent: 'Повідомлень надіслано',
    errors: 'Помилки',
    
    // Controls
    startAll: 'Запустити всі',
    stopAll: 'Зупинити всі',
    pauseAll: 'Пауза всіх',
    start: 'Запустити',
    stop: 'Зупинити',
    delete: 'Видалити',
    save: 'Зберегти',
    cancel: 'Скасувати',
    add: 'Додати',
    edit: 'Редагувати',
    
    // Account
    addAccount: 'Додати акаунт',
    phoneNumber: 'Номер телефону',
    apiId: 'API ID',
    apiHash: 'API Hash',
    requestCode: 'Запросити код',
    verificationCode: 'Код підтвердження',
    twoFactorPassword: 'Пароль 2FA (якщо увімкнено)',
    signIn: 'Увійти',
    messageTemplate: 'Шаблон повідомлення',
    recipients: 'Одержувачі',
    addRecipients: 'Додати одержувачів',
    clearRecipients: 'Очистити одержувачів',
    recipientsHint: 'Вставте список одержувачів (по одному на рядок). Формат: Ім\'я — Дата — Телефон або просто номер',
    minDelay: 'Мін. затримка (сек)',
    maxDelay: 'Макс. затримка (сек)',
    proxy: 'Proxy URL',
    
    // Scheduling
    schedule: 'Розклад',
    scheduleType: 'Тип розкладу',
    manual: 'Вручну',
    daily: 'Щодня',
    weekly: 'Щотижня',
    scheduleTime: 'Час',
    scheduleDays: 'Дні',
    monday: 'Пн',
    tuesday: 'Вт',
    wednesday: 'Ср',
    thursday: 'Чт',
    friday: 'Пт',
    saturday: 'Сб',
    sunday: 'Нд',
    
    // Status
    status: 'Статус',
    idle: 'Очікує',
    running: 'Працює',
    waiting: 'Очікує',
    sending: 'Надсилає',
    error: 'Помилка',
    pending: 'Очікує',
    sent: 'Надіслано',
    failed: 'Помилка',
    
    // Groups
    groupName: 'Назва групи',
    createGroup: 'Створити групу',
    noGroup: 'Без групи',
    
    // Logs
    info: 'Інфо',
    warn: 'Попередження',
    
    // Messages
    accountAdded: 'Акаунт успішно додано',
    accountDeleted: 'Акаунт видалено',
    recipientsAdded: 'Одержувачів додано',
    codeSent: 'Код підтвердження надіслано',
    authSuccess: 'Авторизацію успішно завершено',
    noRecipientsFound: 'Не знайдено дійсних номерів телефонів',
    
    // Validation
    invalidPhone: 'Невірний формат номера телефону',
    required: 'Це поле обов\'язкове',
  },
  
  ru: {
    // Navigation
    dashboard: 'Панель',
    accounts: 'Аккаунты',
    groups: 'Группы',
    logs: 'Логи',
    settings: 'Настройки',
    
    // Dashboard
    totalAccounts: 'Всего аккаунтов',
    activeAccounts: 'Активные аккаунты',
    messagesSent: 'Сообщений отправлено',
    errors: 'Ошибки',
    
    // Controls
    startAll: 'Запустить все',
    stopAll: 'Остановить все',
    pauseAll: 'Пауза всех',
    start: 'Запустить',
    stop: 'Остановить',
    delete: 'Удалить',
    save: 'Сохранить',
    cancel: 'Отмена',
    add: 'Добавить',
    edit: 'Редактировать',
    
    // Account
    addAccount: 'Добавить аккаунт',
    phoneNumber: 'Номер телефона',
    apiId: 'API ID',
    apiHash: 'API Hash',
    requestCode: 'Запросить код',
    verificationCode: 'Код подтверждения',
    twoFactorPassword: 'Пароль 2FA (если включён)',
    signIn: 'Войти',
    messageTemplate: 'Шаблон сообщения',
    recipients: 'Получатели',
    addRecipients: 'Добавить получателей',
    clearRecipients: 'Очистить получателей',
    recipientsHint: 'Вставьте список получателей (по одному на строку). Формат: Имя — Дата — Телефон или просто номер',
    minDelay: 'Мин. задержка (сек)',
    maxDelay: 'Макс. задержка (сек)',
    proxy: 'Proxy URL',
    
    // Scheduling
    schedule: 'Расписание',
    scheduleType: 'Тип расписания',
    manual: 'Вручную',
    daily: 'Ежедневно',
    weekly: 'Еженедельно',
    scheduleTime: 'Время',
    scheduleDays: 'Дни',
    monday: 'Пн',
    tuesday: 'Вт',
    wednesday: 'Ср',
    thursday: 'Чт',
    friday: 'Пт',
    saturday: 'Сб',
    sunday: 'Нд',
    
    // Status
    status: 'Статус',
    idle: 'Ожидает',
    running: 'Работает',
    waiting: 'Ожидает',
    sending: 'Отправляет',
    error: 'Ошибка',
    pending: 'Ожидает',
    sent: 'Отправлено',
    failed: 'Ошибка',
    
    // Groups
    groupName: 'Название группы',
    createGroup: 'Создать группу',
    noGroup: 'Без группы',
    
    // Logs
    info: 'Инфо',
    warn: 'Предупреждение',
    
    // Messages
    accountAdded: 'Аккаунт успешно добавлен',
    accountDeleted: 'Аккаунт удалён',
    recipientsAdded: 'Получатели добавлены',
    codeSent: 'Код подтверждения отправлен',
    authSuccess: 'Авторизация успешно завершена',
    noRecipientsFound: 'Не найдено действительных номеров телефонов',
    
    // Validation
    invalidPhone: 'Неверный формат номера телефона',
    required: 'Это поле обязательно',
  },
};

export type TranslationKey = keyof typeof translations.en;

export function t(lang: Language, key: TranslationKey): string {
  return translations[lang][key] || translations.en[key] || key;
}

// Phone number extraction utility
export function extractPhoneNumber(line: string): string | null {
  // Try to find phone number pattern in the line
  // Supports formats: +79500731429, 79500731429, 8-950-073-14-29, etc.
  
  // First, remove all spaces, dashes, parentheses
  const cleaned = line.replace(/[\s\-\(\)]/g, '');
  
  // Match phone number patterns
  // Pattern: optional + followed by digits (at least 10)
  const phoneMatch = cleaned.match(/\+?[78]?(\d{10,15})/);
  
  if (phoneMatch) {
    let phone = phoneMatch[0];
    // Normalize: if starts with 8, replace with +7 (Russian format)
    if (phone.startsWith('8') && phone.length === 11) {
      phone = '+7' + phone.slice(1);
    }
    // Add + if missing
    if (!phone.startsWith('+')) {
      phone = '+' + phone;
    }
    return phone;
  }
  
  return null;
}

// Parse multiple lines and extract all phone numbers
export function parseRecipientsList(text: string): string[] {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  const phones: string[] = [];
  
  for (const line of lines) {
    const phone = extractPhoneNumber(line);
    if (phone) {
      phones.push(phone);
    }
  }
  
  return phones;
}
