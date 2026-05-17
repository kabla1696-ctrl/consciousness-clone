export interface Language {
  code: string
  name: string
  native: string
  flag: string
  dir: 'ltr' | 'rtl'
}

export const LANGUAGES: Language[] = [
  { code: 'en', name: 'English', native: 'English', flag: '🇬🇧', dir: 'ltr' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা', flag: '🇧🇩', dir: 'ltr' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी', flag: '🇮🇳', dir: 'ltr' },
  { code: 'ur', name: 'Urdu', native: 'اردو', flag: '🇵🇰', dir: 'rtl' },
  { code: 'ar', name: 'Arabic', native: 'العربية', flag: '🇸🇦', dir: 'rtl' },
  { code: 'es', name: 'Spanish', native: 'Español', flag: '🇪🇸', dir: 'ltr' },
  { code: 'fr', name: 'French', native: 'Français', flag: '🇫🇷', dir: 'ltr' },
  { code: 'de', name: 'German', native: 'Deutsch', flag: '🇩🇪', dir: 'ltr' },
  { code: 'pt', name: 'Portuguese', native: 'Português', flag: '🇧🇷', dir: 'ltr' },
  { code: 'ru', name: 'Russian', native: 'Русский', flag: '🇷🇺', dir: 'ltr' },
  { code: 'zh', name: 'Chinese', native: '中文', flag: '🇨🇳', dir: 'ltr' },
  { code: 'ja', name: 'Japanese', native: '日本語', flag: '🇯🇵', dir: 'ltr' },
  { code: 'ko', name: 'Korean', native: '한국어', flag: '🇰🇷', dir: 'ltr' },
  { code: 'tr', name: 'Turkish', native: 'Türkçe', flag: '🇹🇷', dir: 'ltr' },
  { code: 'id', name: 'Indonesian', native: 'Bahasa Indonesia', flag: '🇮🇩', dir: 'ltr' },
  { code: 'ms', name: 'Malay', native: 'Bahasa Melayu', flag: '🇲🇾', dir: 'ltr' },
  { code: 'th', name: 'Thai', native: 'ไทย', flag: '🇹🇭', dir: 'ltr' },
  { code: 'vi', name: 'Vietnamese', native: 'Tiếng Việt', flag: '🇻🇳', dir: 'ltr' },
  { code: 'tl', name: 'Filipino', native: 'Filipino', flag: '🇵🇭', dir: 'ltr' },
  { code: 'sw', name: 'Swahili', native: 'Kiswahili', flag: '🇰🇪', dir: 'ltr' },
  { code: 'ha', name: 'Hausa', native: 'Hausa', flag: '🇳🇬', dir: 'ltr' },
  { code: 'yo', name: 'Yoruba', native: 'Yorùbá', flag: '🇳🇬', dir: 'ltr' },
  { code: 'ig', name: 'Igbo', native: 'Igbo', flag: '🇳🇬', dir: 'ltr' },
  { code: 'am', name: 'Amharic', native: 'አማርኛ', flag: '🇪🇹', dir: 'ltr' },
  { code: 'fa', name: 'Persian', native: 'فارسی', flag: '🇮🇷', dir: 'rtl' },
  { code: 'ps', name: 'Pashto', native: 'پښتو', flag: '🇦🇫', dir: 'rtl' },
  { code: 'ne', name: 'Nepali', native: 'नेपाली', flag: '🇳🇵', dir: 'ltr' },
  { code: 'si', name: 'Sinhala', native: 'සිංහල', flag: '🇱🇰', dir: 'ltr' },
  { code: 'my', name: 'Myanmar', native: 'မြန်မာ', flag: '🇲🇲', dir: 'ltr' },
  { code: 'km', name: 'Khmer', native: 'ភាសាខ្មែរ', flag: '🇰🇭', dir: 'ltr' },
  { code: 'lo', name: 'Lao', native: 'ລາວ', flag: '🇱🇦', dir: 'ltr' },
  { code: 'ka', name: 'Georgian', native: 'ქართული', flag: '🇬🇪', dir: 'ltr' },
  { code: 'hy', name: 'Armenian', native: 'Հայերեն', flag: '🇦🇲', dir: 'ltr' },
  { code: 'he', name: 'Hebrew', native: 'עברית', flag: '🇮🇱', dir: 'rtl' },
  { code: 'el', name: 'Greek', native: 'Ελληνικά', flag: '🇬🇷', dir: 'ltr' },
  { code: 'it', name: 'Italian', native: 'Italiano', flag: '🇮🇹', dir: 'ltr' },
  { code: 'nl', name: 'Dutch', native: 'Nederlands', flag: '🇳🇱', dir: 'ltr' },
  { code: 'pl', name: 'Polish', native: 'Polski', flag: '🇵🇱', dir: 'ltr' },
  { code: 'uk', name: 'Ukrainian', native: 'Українська', flag: '🇺🇦', dir: 'ltr' },
  { code: 'ro', name: 'Romanian', native: 'Română', flag: '🇷🇴', dir: 'ltr' },
  { code: 'hu', name: 'Hungarian', native: 'Magyar', flag: '🇭🇺', dir: 'ltr' },
  { code: 'cs', name: 'Czech', native: 'Čeština', flag: '🇨🇿', dir: 'ltr' },
  { code: 'sv', name: 'Swedish', native: 'Svenska', flag: '🇸🇪', dir: 'ltr' },
  { code: 'da', name: 'Danish', native: 'Dansk', flag: '🇩🇰', dir: 'ltr' },
  { code: 'fi', name: 'Finnish', native: 'Suomi', flag: '🇫🇮', dir: 'ltr' },
  { code: 'no', name: 'Norwegian', native: 'Norsk', flag: '🇳🇴', dir: 'ltr' },
  { code: 'af', name: 'Afrikaans', native: 'Afrikaans', flag: '🇿🇦', dir: 'ltr' },
]

// Core UI translations for all languages
export const TRANSLATIONS: Record<string, Record<string, string>> = {
  en: {
    dashboard: 'Dashboard', memories: 'Memories', chat: 'Chat', mood: 'Mood', settings: 'Settings',
    profile: 'Profile', logout: 'Logout', login: 'Login', signup: 'Sign Up', save: 'Save', cancel: 'Cancel',
    delete: 'Delete', edit: 'Edit', add: 'Add', search: 'Search', loading: 'Loading...', back: 'Back',
    welcome: 'Welcome', home: 'Home', features: 'Features', personality: 'Personality', analytics: 'Analytics',
    'talk to clone': 'Talk to Clone', 'mood tracker': 'Mood Tracker', 'life goals': 'Life Goals',
    'time capsule': 'Time Capsule', 'legacy letters': 'Legacy Letters', 'family tree': 'Family Tree',
    'voice journal': 'Voice Journal', 'memory map': 'Memory Map', 'clone settings': 'Clone Settings',
    'soul sync': 'Soul Sync', 'time travel': 'Time Travel', 'death simulation': 'Death Simulation',
    'ghost mode': 'Ghost Mode', 'clone therapy': 'Clone Therapy', 'milestones': 'Milestones',
    'confessions': 'Confessions', 'dream lab': 'Dream Lab', 'mirror mode': 'Mirror Mode',
    'life story': 'Life Story', 'future self': 'Future Self', 'predictions': 'Predictions',
    'clone quiz': 'Clone Quiz', 'achievements': 'Achievements', 'idea generator': 'Idea Generator',
    'soul playlist': 'Soul Playlist', 'daily briefing': 'Daily Briefing', 'clone network': 'Clone Network',
    'photo memories': 'Photo Memories', 'emotion engine': 'Emotion Engine', 'heartbeat': 'Heartbeat',
    'astronaut mode': 'Astronaut Mode', 'vault': 'Memory Vault', 'memory dna': 'Memory DNA',
    'heir access': 'Heir Access', 'clone identity': 'Clone Identity', 'widget': 'Widget',
    'public profile': 'Public Profile', 'skills': 'Skill Transfer', 'last words': 'Last Words',
    'dead man switch': "Dead Man's Switch", 'mindfulness': 'Mindfulness', 'life score': 'Life Score',
    'dream mode': 'Dream Mode', 'memory stories': 'Memory Stories', 'memory milestones': 'Memory Milestones',
    'clone confessions': 'Clone Confessions', 'clone podcast': 'Clone Podcast',
    'referral': 'Refer & Earn', 'share': 'Share Clone', 'pricing': 'Pricing', 'language': 'Language',
    'your clone awaits': 'Your clone awaits', 'features count': 'features',
    'hey': 'Hey', 'good morning': 'Good morning', 'good afternoon': 'Good afternoon', 'good evening': 'Good evening',
    'type message': 'Type a message...', 'send': 'Send', 'new memory': 'New Memory',
    'how are you': 'How are you feeling?', 'select mood': 'Select your mood',
    'start quiz': 'Start Quiz', 'view profile': 'View Profile',
    'add person': 'Add Person', 'name': 'Name', 'relation': 'Relation', 'email': 'Email', 'phone': 'Phone',
    'full access': 'Full Access', 'partial access': 'Partial Access', 'chat only': 'Chat Only',
    'enable': 'Enable', 'disable': 'Disable', 'on': 'On', 'off': 'Off',
    'days': 'days', 'weeks': 'weeks', 'months': 'months', 'years': 'years',
    'today': 'Today', 'yesterday': 'Yesterday', 'tomorrow': 'Tomorrow',
    'no data': 'No data yet', 'try again': 'Try again', 'success': 'Success', 'error': 'Error',
    'confirm': 'Confirm', 'are you sure': 'Are you sure?', 'yes': 'Yes', 'no': 'No',
    'relationships & legacy': 'Relationships & Legacy', 'my people': 'My People', 'legacy': 'Legacy',
    'clone behavior': 'Clone Behavior', 'total': 'Total', 'close': 'Close', 'heirs': 'Heirs',
    'quick add the important people': 'Quick add the important people:', 'person': 'Person',
    'legacy access': 'Legacy Access', 'configure who accesses your clone': 'Configure who accesses your clone after you\'re gone',
    'inactivity timer': 'Inactivity Timer (days)', 'final message to all heirs': 'Final Message to All Heirs',
    'legacy message placeholder': 'When you read this, I\'ll be gone. But my clone remembers everything...',
    'designated heirs': 'Designated Heirs',
    'no heirs set': 'No heirs set. Go to My People tab and enable legacy access for someone.',
    'save legacy settings': 'Save Legacy Settings', 'save clone behavior': 'Save Clone Behavior',
    'language style': 'Language Style', 'catchphrases': 'Catchphrases', 'quirks & habits': 'Quirks & Habits',
    'full name': 'Full name', 'nickname': 'Nickname', 'relationship quality': 'Relationship Quality',
    'how you feel about them': 'How you feel about them',
    'feelings placeholder': 'She\'s my everything. Raised me alone.',
    'what they mean to you': 'What they mean to you', 'meaning placeholder': 'My rock, my safe place',
    'inside jokes / memories': 'Inside jokes / memories', 'inside jokes placeholder': 'We always joke about...',
    'what to tell them': 'What you want clone to tell them',
    'what to tell placeholder': 'Tell her I\'m sorry I didn\'t call more',
    'privacy level': 'Privacy Level', 'legacy access after death': 'Legacy Access After Death',
    'access level': 'Access Level',
    'entries': 'Entries', 'top category': 'Top Category', 'failed attempts': 'Failed Attempts',
    'add vault memory': 'Add Vault Memory', 'secret placeholder': 'Your secret is safe here...',
    'importance': 'Importance', 'mood optional': 'Mood (optional)', 'encrypt & save': 'Encrypt & Save',
    'vault empty': 'Your vault is empty', 'add your first secret': 'Add your first secret',
    'permanently destroy all vault data': 'Permanently destroy all vault data. This cannot be undone.',
    'destroy everything': 'Destroy Everything',
    'attempts remaining': 'attempts remaining', 'unlock': 'Unlock',
    'attempts remaining before self-destruct': 'attempts remaining before self-destruct',
    'back to dashboard': 'Back to Dashboard', 'create vault': 'Create Vault',
    'enter pin': 'Enter PIN', 'confirm pin': 'Confirm PIN', 'enter pin to unlock': 'Enter your PIN to unlock',
    'choose a pin': 'Choose a 4-6 digit PIN to protect your vault. This cannot be recovered.',
    'verifying identity': 'VERIFYING IDENTITY...', 'record your thoughts': 'Record your thoughts',
    'tap to record': 'Tap to record', 'your voice your thoughts': 'Your voice, your thoughts',
    'journal entries': 'Journal Entries', 'discard': 'Discard',
    'how well does your clone know you': 'How well does your clone know you?',
    'test how well your clone knows you': 'Test how well your AI clone knows you! 10 questions generated from your memories.',
    'generating questions': 'Generating Questions...',
    'questions are ai generated': 'Questions are AI-generated from your memories',
    'question': 'Question', 'of': 'of', 'score': 'Score', 'correct': 'Correct!', 'wrong': 'Wrong!',
    'legacy settings saved': 'Legacy settings saved!', 'clone behavior saved': 'Clone behavior saved!',
    'pin must be 4-6 digits': 'PIN must be 4-6 digits', 'pins do not match': 'PINs do not match',
    'last chance irreversible': 'Last chance. This is IRREVERSIBLE.',
    'microphone error': 'Could not access microphone. Please allow microphone access.',
    'results copied': 'Results copied to clipboard!',
    'dark mode': 'Dark Mode', 'notifications': 'Notifications', 'privacy': 'Privacy',
    'terms': 'Terms of Service', 'about': 'About', 'help': 'Help', 'feedback': 'Feedback',
    'memory artist': 'Memory Artist', 'create art': 'Create Art', 'style': 'Style', 'generate': 'Generate', 'gallery': 'Gallery',
    'memory auction': 'Memory Auction', 'bid': 'Bid', 'sell': 'Sell', 'buy': 'Buy', 'current bid': 'Current Bid',
    'constellation': 'Constellation', 'your stars': 'Your Stars', 'memories as stars': 'Memories as Stars',
    'encryption': 'Encryption', 'blockchain': 'Blockchain', 'secure': 'Secure', 'tamper proof': 'Tamper Proof',
    'marketplace': 'Marketplace', 'experiences': 'Experiences', 'browse': 'Browse',
    'unlocked': 'Unlocked', 'badges': 'Badges', 'xp': 'XP', 'level': 'Level',
    'memory museum': 'Memory Museum', 'exhibits': 'Exhibits', 'timeline': 'Timeline',
    'memory reels': 'Memory Reels', 'tiktok': 'TikTok', 'watch': 'Watch', 'like': 'Like',
    'clone dating': 'Clone Dating', 'find match': 'Find My Match', 'swipe': 'Swipe to Find a Date',
 'pass': 'Pass', 'match': 'Match', 'interests': 'Shared Interests', 'soul score': 'Soul Score',
    'anonymous': 'Confess Anonymously', 'post confession': 'Anonymous Confession',
 'locked': 'Locked', 'progress': 'Progress',
    'your future': 'Channeling the future', 'ai predicts': 'Generate Prediction', 'probability': 'Confidence',
    'clone poet': 'Clone Poet', 'poetry': 'Let your clone weave words from the threads of memory',
    'generate poem': 'Generate Poem',
    'episodes': 'AI-generated episodes', 'listen': 'Listen',
    'clone sleep': 'Clone Sleep', 'sleeping': 'Clone is dreaming', 'dreams': 'Dream Journal', 'wake up': 'Wake Up',
    'clone orchestra': 'Clone Orchestra', 'instruments': 'Select Clones (3-5)', 'compose': 'Start Composing', 'play': 'Play',
    'reincarnation': 'Digital Reincarnation', 'digital immortality': 'Evolution beyond mortality', 'rebirth': 'Rebirth', 'cycle': 'Cycle',
    'digital seance': 'Digital Seance', 'communicate': 'Communicate', 'spirits': 'Spirits', 'session': 'Session',
 'background': 'Background', 'processing': 'Processing', 'sleep': 'Sleep',
 'track': 'Track', 'achieve': 'Achieve', 'add goal': 'Add Goal',
 'heart rate': 'Heart Rate', 'camera': 'Camera', 'detection': 'Detection', 'bpm': 'BPM',
 'who gets': 'Who Gets Access', 'after you': 'After You', 'partial': 'Partial',
    'last breath': 'Last Breath', 'final moment': 'Final Moment', 'goodbye': 'Goodbye',
 'final message': 'Final Message', 'for the world': 'For the World', 'record': 'Record',
    'legacy tree': 'Legacy Tree', 'family memory': 'Family Memory', 'branches': 'Branches', 'roots': 'Roots', 'grow': 'Grow',
    'rate': 'Rate', 'balance': 'Balance', 'health': 'Health', 'career': 'Career', 'relationships': 'Relationships',
    'ai generated': 'AI Generated', 'chapters': 'Chapters', 'write story': 'Write Story',
    'personality genome': 'Personality Genome', 'strands': 'Strands', 'code': 'Code',
    'memory ghost': 'Memory Ghost', 'haunted': 'Haunted', 'forgotten': 'Forgotten', 'resurface': 'Resurface',
    'where memories': 'Where Memories Live', 'locations': 'Locations', 'explore': 'Explore',
    'memory palace': 'Memory Palace', 'rooms': 'Rooms', 'store': 'Store', 'navigate': 'Navigate',
    'memory replay': 'Memory Replay', 'relive': 'Relive', 'playback': 'Playback', 'moments': 'Moments',
 'who talks': "Who's Talking?", 'recognizes': 'Teach your clone to recognize different people and respond accordingly.', 'face': 'Sample messages',
    'clone level': 'Clone Level', 'experience': 'Earn XP', 'level up': 'Level Progression', 'rank': 'Rank',
    'clone passport': 'Clone Passport', 'travel stamps': 'Your digital travel journal', 'destinations': 'Countries',
    'clone social': 'Clone Social', 'feed': 'Feed', 'posts': 'Posts', 'followers': 'Followers', 'following': 'Trending',
    'therapy dog': 'Therapy Pet', 'virtual pet': 'Choose Your Companion', 'comfort': 'Comfort', 'fetch': 'Fetch',
    'cloud backup': 'Cloud Backup', 'backup': 'Backup', 'restore': 'Restore', 'sync': 'Auto-Backup',
 'morning': 'Good Morning', 'summary': 'Summary', 'schedule': 'Schedule',
    'dead man switch': "Dead Man's Switch", 'auto deliver': 'Enable Switch', 'inactive': 'Inactive', 'countdown': 'Countdown',
  },
  bn: {
    dashboard: 'ড্যাশবোর্ড', memories: 'স্মৃতি', chat: 'চ্যাট', mood: 'মেজাজ', settings: 'সেটিংস',
    profile: 'প্রোফাইল', logout: 'লগ আউট', login: 'লগ ইন', signup: 'সাইন আপ', save: 'সেভ', cancel: 'বাতিল',
    delete: 'মুছুন', edit: 'এডিট', add: 'যোগ করুন', search: 'খুঁজুন', loading: 'লোড হচ্ছে...', back: 'পিছনে',
    welcome: 'স্বাগতম', home: 'হোম', features: 'ফিচার', personality: 'ব্যক্তিত্ব', analytics: 'বিশ্লেষণ',





























  },
  hi: {
    dashboard: 'डैशबोर्ड', memories: 'यादें', chat: 'चैट', mood: 'मूड', settings: 'सेटिंग्स',
    profile: 'प्रोफ़ाइल', logout: 'लॉग आउट', login: 'लॉग इन', signup: 'साइन अप', save: 'सेव', cancel: 'रद्द',
    delete: 'हटाएं', edit: 'एडिट', add: 'जोड़ें', search: 'खोजें', loading: 'लोड हो रहा है...', back: 'पीछे',
    welcome: 'स्वागत है', home: 'होम', features: 'फ़ीचर', personality: 'व्यक्तित्व', analytics: 'विश्लेषण',




  },
  ar: {
    dashboard: 'لوحة التحكم', memories: 'الذكريات', chat: 'المحادثة', mood: 'المزاج', settings: 'الإعدادات',
    profile: 'الملف الشخصي', logout: 'تسجيل خروج', login: 'تسجيل دخول', signup: 'إنشاء حساب', save: 'حفظ', cancel: 'إلغاء',
    delete: 'حذف', edit: 'تعديل', add: 'إضافة', search: 'بحث', loading: 'جاري التحميل...', back: 'رجوع',
    welcome: 'مرحباً', home: 'الرئيسية', features: 'الميزات', personality: 'الشخصية', analytics: 'التحليلات',



  },
  es: {
    dashboard: 'Panel', memories: 'Recuerdos', chat: 'Chat', mood: 'Ánimo', settings: 'Ajustes',
    profile: 'Perfil', logout: 'Cerrar sesión', login: 'Iniciar sesión', signup: 'Registrarse', save: 'Guardar', cancel: 'Cancelar',
    delete: 'Eliminar', edit: 'Editar', add: 'Agregar', search: 'Buscar', loading: 'Cargando...', back: 'Atrás',
    welcome: 'Bienvenido', home: 'Inicio', features: 'Funciones', personality: 'Personalidad', analytics: 'Analíticas',



  },
  zh: {
    dashboard: '仪表板', memories: '记忆', chat: '聊天', mood: '心情', settings: '设置',
    profile: '个人资料', logout: '退出登录', login: '登录', signup: '注册', save: '保存', cancel: '取消',
    delete: '删除', edit: '编辑', add: '添加', search: '搜索', loading: '加载中...', back: '返回',
    welcome: '欢迎', home: '首页', features: '功能', personality: '性格', analytics: '分析',



  },
  ja: {
    dashboard: 'ダッシュボード', memories: 'メモリー', chat: 'チャット', mood: '気分', settings: '設定',
    profile: 'プロフィール', logout: 'ログアウト', login: 'ログイン', signup: 'サインアップ', save: '保存', cancel: 'キャンセル',
    delete: '削除', edit: '編集', add: '追加', search: '検索', loading: '読み込み中...', back: '戻る',
    welcome: 'ようこそ', home: 'ホーム', features: '機能', personality: '性格', analytics: '分析',



  },
  ko: {
    dashboard: '대시보드', memories: '추억', chat: '채팅', mood: '기분', settings: '설정',
    profile: '프로필', logout: '로그아웃', login: '로그인', signup: '회원가입', save: '저장', cancel: '취소',
    delete: '삭제', edit: '편집', add: '추가', search: '검색', loading: '로딩 중...', back: '뒤로',
    welcome: '환영합니다', home: '홈', features: '기능', personality: '성격', analytics: '분석',



  },
  fr: {
    dashboard: 'Tableau de bord', memories: 'Souvenirs', chat: 'Chat', mood: 'Humeur', settings: 'Paramètres',
    profile: 'Profil', logout: 'Déconnexion', login: 'Connexion', signup: "S'inscrire", save: 'Enregistrer', cancel: 'Annuler',
    delete: 'Supprimer', edit: 'Modifier', add: 'Ajouter', search: 'Rechercher', loading: 'Chargement...', back: 'Retour',
    welcome: 'Bienvenue', home: 'Accueil', features: 'Fonctionnalités', personality: 'Personnalité', analytics: 'Analyses',



  },
  de: {
    dashboard: 'Dashboard', memories: 'Erinnerungen', chat: 'Chat', mood: 'Stimmung', settings: 'Einstellungen',
    profile: 'Profil', logout: 'Abmelden', login: 'Anmelden', signup: 'Registrieren', save: 'Speichern', cancel: 'Abbrechen',
    delete: 'Löschen', edit: 'Bearbeiten', add: 'Hinzufügen', search: 'Suchen', loading: 'Laden...', back: 'Zurück',
    welcome: 'Willkommen', home: 'Startseite', features: 'Funktionen', personality: 'Persönlichkeit', analytics: 'Analysen',



  },
  ru: {
    dashboard: 'Панель', memories: 'Воспоминания', chat: 'Чат', mood: 'Настроение', settings: 'Настройки',
    profile: 'Профиль', logout: 'Выйти', login: 'Войти', signup: 'Регистрация', save: 'Сохранить', cancel: 'Отмена',
    delete: 'Удалить', edit: 'Редактировать', add: 'Добавить', search: 'Поиск', loading: 'Загрузка...', back: 'Назад',
    welcome: 'Добро пожаловать', home: 'Главная', features: 'Функции', personality: 'Личность', analytics: 'Аналитика',



  },
  tr: {
    dashboard: 'Kontrol Paneli', memories: 'Anılar', chat: 'Sohbet', mood: 'Ruh Hali', settings: 'Ayarlar',
    profile: 'Profil', logout: 'Çıkış', login: 'Giriş', signup: 'Kayıt', save: 'Kaydet', cancel: 'İptal',
    delete: 'Sil', edit: 'Düzenle', add: 'Ekle', search: 'Ara', loading: 'Yükleniyor...', back: 'Geri',
    welcome: 'Hoş geldiniz', home: 'Ana Sayfa', features: 'Özellikler', personality: 'Kişilik', analytics: 'Analitik',



  },
  id: {
    dashboard: 'Dasbor', memories: 'Kenangan', chat: 'Obrolan', mood: 'Suasana', settings: 'Pengaturan',
    profile: 'Profil', logout: 'Keluar', login: 'Masuk', signup: 'Daftar', save: 'Simpan', cancel: 'Batal',
    delete: 'Hapus', edit: 'Edit', add: 'Tambah', search: 'Cari', loading: 'Memuat...', back: 'Kembali',
    welcome: 'Selamat datang', home: 'Beranda', features: 'Fitur', personality: 'Kepribadian', analytics: 'Analitik',



  },
  th: {
    dashboard: 'แดชบอร์ด', memories: 'ความทรงจำ', chat: 'แชท', mood: 'อารมณ์', settings: 'การตั้งค่า',
    profile: 'โปรไฟล์', logout: 'ออกจากระบบ', login: 'เข้าสู่ระบบ', signup: 'สมัคร', save: 'บันทึก', cancel: 'ยกเลิก',


  },
  vi: {
    dashboard: 'Bảng điều khiển', memories: 'Ký ức', chat: 'Trò chuyện', mood: 'Tâm trạng', settings: 'Cài đặt',


  },
  sw: {
    dashboard: 'Dashibodi', memories: 'Kumbukumbu', chat: 'Mazungumzo', mood: 'Hali', settings: 'Mipangilio',


  },
  ur: {
    dashboard: 'ڈیش بورڈ', memories: 'یادیں', chat: 'چیٹ', mood: 'مزاج', settings: 'ترتیبات',


  },
  fa: {
    dashboard: 'داشبورد', memories: 'خاطرات', chat: 'گفتگو', mood: 'حال', settings: 'تنظیمات',


  },
  pt: {
    dashboard: 'Painel', memories: 'Memórias', chat: 'Bate-papo', mood: 'Humor', settings: 'Configurações',


  },
  it: {
    dashboard: 'Pannello', memories: 'Ricordi', chat: 'Chat', mood: 'Umore', settings: 'Impostazioni',


  },
  nl: {
    dashboard: 'Dashboard', memories: 'Herinneringen', chat: 'Chat', mood: 'Stemming', settings: 'Instellingen',


  },
  pl: {
    dashboard: 'Panel', memories: 'Wspomnienia', chat: 'Czat', mood: 'Nastrój', settings: 'Ustawienia',


  },
  uk: {
    dashboard: 'Панель', memories: 'Спогади', chat: 'Чат', mood: 'Настрій', settings: 'Налаштування',


  },
  ne: {
    dashboard: 'ड्यासबोर्ड', memories: 'सम्झना', chat: 'च्याट', mood: 'मूड', settings: 'सेटिङहरू',


  },
  ha: {
    dashboard: 'Dashboard', memories: 'Tunani', chat: 'Tattaunawa', mood: 'Yanayi', settings: 'Saiti',


  },
  am: {
    dashboard: 'ዳሽቦርድ', memories: 'ማስታወሻዎች', chat: 'ውይይት', mood: 'ስሜት', settings: 'ቅንብሮች',


  },
}

export function t(key: string, lang: string): string {
  return TRANSLATIONS[lang]?.[key] || TRANSLATIONS['en']?.[key] || key
}

export function getLanguage(code: string): Language | undefined {
  return LANGUAGES.find(l => l.code === code)
}
