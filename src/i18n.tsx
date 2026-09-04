import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'ru' | 'az';

const translations = {
  en: {
    nav: { 
      home: "Home", 
      about: "About Us",
      map: "On the Map",
      villas: "Villas",
      townhouses: "Townhouses",
      plans: "Plans",
      gallery: "Gallery",
      offers: "Special Offers",
      contact: "Schedule a Visit",
      golfTour: "Golf Car Tour",
      residentPortal: "Resident Portal" 
    },
    about: {
      title: "About Royal Park",
      subtitle: "A Sanctuary of Quiet Elegance in Baku",
      description1: "Royal Park is a residential community that began taking shape in 1994. It is primarily home to families who appreciate peace and quiet. People choose this place so their children can grow up in comfort and tranquility.",
      description2: "",
      feature1Title: "Organic Architecture",
      feature1Desc: "Facades engineered with natural stone and high-grade woods for lasting elegance.",
      feature2Title: "Absolute Privacy",
      feature2Desc: "24/7 security, controlled access, and thoughtful layouts ensuring private living.",
      feature3Title: "Green Oasis",
      feature3Desc: "Abundant gardens, clean microclimate, and peaceful walkways in the heart of Baku."
    },
    map: {
      title: "Royal Park on the Map",
      subtitle: "A Sanctuary of Silence with Seamless Connectivity to All of Baku",
      badge: "Baku • Yeni Yasamal",
      addressTitle: "Official Complex Address",
      addressVal: "Kənar dairəvi yol 10, Yeni Yasamal / AZ1070, Baku, Azerbaijan",
      openInGoogle: "Open in Google Maps",
      getDirections: "Get Directions",
      copyAddress: "Copy Address",
      copied: "Address Copied!",
      featuresTitle: "Location & Strategic Advantages",
      f1Title: "Direct Highway Access",
      f1Desc: "Situated along the Baku Outer Ring Road, enabling fast, jam-free transit to city avenues and airports.",
      f2Title: "Clean Elevated Air",
      f2Desc: "Elevated topography catching fresh breezes, completely sheltered from dense urban noise and smog.",
      f3Title: "24/7 Guarded Checkpoint",
      f3Desc: "Gated residential perimeter with round-the-clock physical security and authorized resident entry.",
      distancesTitle: "Estimated Travel Times",
      d1Name: "Flame Towers & City Center",
      d1Time: "15 min",
      d2Name: "Baku Seaside Boulevard",
      d2Time: "18 min",
      d3Name: "Heydar Aliyev Int. Airport",
      d3Time: "25 min",
      d4Name: "Yasamal Mall & 20 Yanvar",
      d4Time: "7 min",
      needAssistanceTitle: "Need navigation assistance?",
      needAssistanceDesc: "Our sales team is ready to guide your arrival or meet you at the entrance checkpoint.",
      callUs: "Call Sales Office",
      bookTour: "Schedule a Visit"
    },
    villas: {
      title: "Royal Park Villas",
      subtitle: "Independent Luxury & Unmatched Privacy",
      description: "Our standalone luxury villas offer expansive living spaces, private manicured gardens, multi-car parking, and panoramic windows designed to bring natural light into every room.",
      spec1: "Private Land Plot & Garden",
      spec2: "Spacious Multi-Level Architecture",
      spec3: "Custom Interior Layout Options",
      spec4: "Private Covered Parking & Driveway"
    },
    townhouses: {
      title: "Royal Park Townhouses",
      subtitle: "Modern Family Living in Harmony",
      description: "Designed for families seeking a vibrant community spirit combined with private outdoor space. Our townhouses feature private entryways, cozy green patios, and flexible multi-floor layouts.",
      spec1: "Private Back Patio & Lawn",
      spec2: "Ergonomic Multi-Story Living",
      spec3: "Private Entrance & Terrace",
      spec4: "Dedicated Parking Space"
    },
    plans: {
      title: "Floor Plans & Layouts",
      subtitle: "Explore our meticulously engineered residences",
      villasTab: "Villas",
      townhousesTab: "Townhouses",
      clickToEnlarge: "Click sketch to enlarge",
      villasDesc: "Spacious open floor layouts, high ceilings, private courtyard access, and optimized room distributions for standalone villas.",
      townhousesDesc: "Ergonomic multi-level townhouse layouts featuring private patios, integrated parking, and expansive living quarters."
    },
    gallery: {
      title: "Photo Gallery",
      subtitle: "Atmospheric views, architectural details, and peaceful streets",
      filterAll: "All Photos",
      filterStreets: "Streets & Grounds",
      filterArchitecture: "Architecture",
      filterAtmosphere: "Details & Atmosphere"
    },
    offers: {
      title: "Special Offers & Exclusive Terms",
      subtitle: "Favorable conditions and tailored financial terms for purchasing real estate",
      item1Title: "0% Interest Developer Installment",
      item1Desc: "Flexible direct installment plans up to 36 months without interest rates or bank surcharges.",
      item2Title: "Individual Layout Customization",
      item2Desc: "Free consultation and architectural adjustments to adapt internal walls during early construction.",
      item3Title: "100% Legal & Registration Support",
      item3Desc: "Comprehensive legal assistance and complimentary state title deed (Çıxarış) registration.",
      item4Title: "Early Reservation Bonus Package",
      item4Desc: "Exclusive bonuses on landscape design, smart home features, or turn-key finishing services.",
      item5Title: "Tailored Payment Schedules",
      item5Desc: "Custom payment structures adapted to your cash flow and financial preferences.",
      item6Title: "Full Concierge & Estate Management",
      item6Desc: "24/7 maintenance, security, landscaping, and property management provided on site.",
      ctaTitle: "Interested in exclusive purchase terms?",
      ctaBtn: "Request Personal Quotation"
    },
    hero: { subtitle: "Baku, Azerbaijan", title: "Royal Park" },
    footer: { desc: "", rights: "All rights reserved.", privacy: "Privacy Policy", terms: "Terms of Use", cookies: "Cookies" },
    legal: {
      title: "Legal Information",
      data_protection_title: "International Data Protection",
      data_protection_p1: "If you are accessing this website from outside Azerbaijan, please note that your information may be transferred and processed in Azerbaijan.",
      data_protection_p2: "We ensure that appropriate safeguards are in place to protect your data in accordance with international data protection standards.",
      rights_title: "Your Rights",
      rights_p1: "Depending on your location, you may have the right to:",
      rights_li1: "request access to your personal data",
      rights_li2: "request correction or deletion",
      rights_li3: "withdraw consent at any time",
      rights_p2: "To exercise your rights, please contact us at: ",
      cookies_title: "Cookies & Consent",
      cookies_p1: "By using this website, you consent to the use of cookies in accordance with this policy.",
      cookies_p2: "You may control or disable cookies through your browser settings.",
      cookies_p3: "Some features of the website may not function properly without cookies."
    },
    home: {
      atm_title: "The Atmosphere of Absolute Silence",
      atm_desc: "Discover a sanctuary in the heart of Baku. Royal Park is designed for those who appreciate the rare luxury of true quietness.",
      atm_btn: "Discover the Lifestyle",
      qual_title: "Uncompromising Quality",
      qual_desc: "Every detail in Royal Park is crafted with premium materials, ensuring a living experience that exceeds expectations.",
      f1_title: "Pure Environment", f1_desc: "Advanced air filtration and abundant green spaces.",
      f2_title: "Absolute Privacy", f2_desc: "State-of-the-art security and thoughtful architecture.",
      f3_title: "Organic Materials", f3_desc: "Built with natural stone, premium woods, and eco-friendly materials.",
      art_title: "The Art of Living",
      art_desc: "Every detail is crafted with the precision of an artist. We view our residences not just as living spaces, but as masterpieces of design and comfort.",
      art_btn: "View Gallery"
    },
    contact: {
      title: "Become part of Royal Park",
      desc: "Schedule a private viewing or request more information about Royal Park.",
      form_name: "Full Name",
      form_email: "Email Address",
      form_phone: "Phone Number",
      form_message: "Message",
      form_submit: "Send Inquiry",
      info_address: "Address",
      info_phone: "Phone",
      info_email: "Email",
      address_val: "Kənar dairəvi yol 10, Yeni Yasamal / AZ1070, Bakı, Azərbaycan"
    },
    residences: {
      clickToEnlarge: "Click to enlarge"
    }
  },
  ru: {
    nav: { 
      home: "Главная", 
      about: "О нас",
      map: "На карте",
      villas: "Виллы",
      townhouses: "Таунхаусы",
      plans: "Планы",
      gallery: "Фотогалерея",
      offers: "Особые условия",
      contact: "Запланировать визит", 
      golfTour: "Golf Car Tour",
      residentPortal: "Портал резидента" 
    },
    about: {
      title: "О Royal Park",
      subtitle: "Убежище тишины и элегантности в Баку",
      description1: "Royal Park — это городок, который начал формироваться с 1994 года. Здесь в основном живут семьи, ценящие тишину и спокойствие. Люди выбирают это место, чтобы их дети росли в комфорте и безопасности.",
      description2: "",
      feature1Title: "Органическая архитектура",
      feature1Desc: "Фасады из натурального камня и ценных пород дерева для долговечной эстетики.",
      feature2Title: "Абсолютная приватность",
      feature2Desc: "Круглосуточная охрана, закрытый доступ и продуманная планировка для уединенной жизни.",
      feature3Title: "Зеленый оазис",
      feature3Desc: "Обильные сады, чистый микроклимат и тихие прогулочные аллеи в сердце Баку."
    },
    map: {
      title: "Royal Park на карте",
      subtitle: "Уединенный оазис тишины с быстрым и удобным доступом ко всем ключевым районам Баку",
      badge: "Баку • Ясамал",
      addressTitle: "Официальный адрес комплекса",
      addressVal: "Kənar dairəvi yol 10, Yeni Yasamal / AZ1070, Баку, Азербайджан",
      openInGoogle: "Открыть в Google Maps",
      getDirections: "Построить маршрут",
      copyAddress: "Скопировать адрес",
      copied: "Адрес скопирован!",
      featuresTitle: "Преимущества расположения",
      f1Title: "Прямой выезд на кольцевую дорогу",
      f1Desc: "Расположение на Бакинской кольцевой дороге обеспечивает быстрый проезд без пробок в центр и в аэропорт.",
      f2Title: "Чистый воздух и микроклимат",
      f2Desc: "Комплекс расположен на возвышенности в окружении зелени, вдали от городского смога и суеты.",
      f3Title: "Охраняемый въезд 24/7",
      f3Desc: "Закрытая охраняемая территория с контролем доступа, физической охраной и видеонаблюдением.",
      distancesTitle: "Ориентировочное время в пути",
      d1Name: "Пламенные башни (Flame Towers) и Центр",
      d1Time: "15 мин",
      d2Name: "Приморский национальный бульвар",
      d2Time: "18 мин",
      d3Name: "Международный аэропорт им. Г. Алиева",
      d3Time: "25 мин",
      d4Name: "ТРЦ Yasamal Mall и метро 20 Января",
      d4Time: "7 мин",
      needAssistanceTitle: "Нужна помощь с маршрутом?",
      needAssistanceDesc: "Наши менеджеры с радостью подскажут лучший путь или встретят вас у въездного шлагбаума комплекса.",
      callUs: "Позвонить в офис продаж",
      bookTour: "Записаться на просмотр"
    },
    villas: {
      title: "Виллы Royal Park",
      subtitle: "Независимая роскошь и бескомпромиссная приватность",
      description: "Наши отдельно стоящие виллы предлагают просторные жилые зоны, приватные ухоженные сады, персональную парковку и панорамные окна, наполняющие дом естественным светом.",
      spec1: "Приватный земельный участок и сад",
      spec2: "Просторная многоуровневая архитектура",
      spec3: "Возможность индивидуальной планировки",
      spec4: "Персональная крытая парковка"
    },
    townhouses: {
      title: "Таунхаусы Royal Park",
      subtitle: "Современная семейная жизнь в гармонии",
      description: "Созданы для семей, которые ценят комьюнити и при этом стремятся к личному пространству. Наши таунхаусы отличаются отдельными входами, уютными зелеными двориками и функциональными этажными планировками.",
      spec1: "Приватный внутренний дворик",
      spec2: "Эргономичное многоуровневое пространство",
      spec3: "Отдельный вход и терраса",
      spec4: "Собственное парковочное место"
    },
    plans: {
      title: "Планы и планировки",
      subtitle: "Изучите детализированные проекты наших резиденций",
      villasTab: "Виллы",
      townhousesTab: "Таунхаусы",
      clickToEnlarge: "Нажмите на эскиз для увеличения",
      villasDesc: "Просторные планировки вилл с высокими потолками, выходом во внутренний двор и оптимальным распределением комнат.",
      townhousesDesc: "Эргономичные многоуровневые планировки таунхаусов с приватным двориком, встроенной парковкой и светлыми гостиными."
    },
    gallery: {
      title: "Фотогалерея",
      subtitle: "Атмосферные виды, архитектурные детали и тихие улицы Royal Park",
      filterAll: "Все фото",
      filterStreets: "Улицы и территория",
      filterArchitecture: "Архитектура",
      filterAtmosphere: "Детали и атмосфера"
    },
    offers: {
      title: "Специальные предложения и особые условия",
      subtitle: "Выгодные пункты и гибкие финансовые условия для покупки недвижимости",
      item1Title: "Беспроцентная рассрочка от застройщика",
      item1Desc: "Гибкая прямая рассрочка до 36 месяцев без процентов и скрытых банковских переплат.",
      item2Title: "Индивидуальная адаптация планировки",
      item2Desc: "Бесплатная консультация архитекторов и корректировка внутренних перегородок на этапе строительства.",
      item3Title: "Юридическое сопровождение 100%",
      item3Desc: "Полная правовая поддержка и бесплатная регистрация права собственности (Купчая / Çıxarış).",
      item4Title: "Бонусный пакет при раннем бронировании",
      item4Desc: "Эксклюзивные бонусы на ландшафтный дизайн, систему «умный дом» или чистовую отделку.",
      item5Title: "Персональный график платежей",
      item5Desc: "Индивидуальные финансовые схемы, адаптированные под ваши возможности и пожелания.",
      item6Title: "Сервис управляющей компании",
      item6Desc: "Круглосуточное обслуживание территории, охрана, уход за садом и консьерж-сервис.",
      ctaTitle: "Хотите узнать о персональных условиях?",
      ctaBtn: "Запросить индивидуальный расчет"
    },
    hero: { subtitle: "Баку, Азербайджан", title: "Royal Park" },
    footer: { desc: "", rights: "Все права защищены.", privacy: "Privacy Policy", terms: "Terms of Use", cookies: "Cookies" },
    legal: {
      title: "Правовая информация",
      data_protection_title: "Международная защита данных",
      data_protection_p1: "Если вы заходите на этот веб-сайт из-за пределов Азербайджана, обратите внимание, что ваша информация может передаваться и обрабатываться в Азербайджане.",
      data_protection_p2: "Мы гарантируем наличие соответствующих мер безопасности для защиты ваших данных в соответствии с международными стандартами защиты данных.",
      rights_title: "Ваши права",
      rights_p1: "В зависимости от вашего местоположения вы можете иметь право:",
      rights_li1: "запросить доступ к вашим личным данным",
      rights_li2: "запросить исправление или удаление",
      rights_li3: "отозвать согласие в любое время",
      rights_p2: "Чтобы воспользоваться своими правами, свяжитесь с нами по адресу: ",
      cookies_title: "Файлы cookie и согласие",
      cookies_p1: "Используя этот веб-сайт, вы соглашаетесь на использование файлов cookie в соответствии с настоящей политикой.",
      cookies_p2: "Вы можете управлять файлами cookie или отключать их в настройках вашего браузера.",
      cookies_p3: "Некоторые функции веб-сайта могут работать неправильно без файлов cookie."
    },
    home: {
      atm_title: "Атмосфера абсолютной тишины",
      atm_desc: "Откройте для себя убежище в самом сердце Баку. Royal Park создан для тех, кто ценит редкую роскошь настоящей тишины.",
      atm_btn: "Узнать больше",
      qual_title: "Бескомпромиссное качество",
      qual_desc: "Каждая деталь в Royal Park создана из премиальных материалов, обеспечивая уровень жизни, превосходящий ожидания.",
      f1_title: "Чистая среда", f1_desc: "Передовая фильтрация воздуха и обилие зеленых зон.",
      f2_title: "Абсолютная приватность", f2_desc: "Современная система безопасности и продуманная архитектура.",
      f3_title: "Органические материалы", f3_desc: "Построено с использованием натурального камня, ценных пород дерева и экологичных материалов.",
      art_title: "Искусство жизни",
      art_desc: "Каждая деталь продумана с точностью художника. Мы рассматриваем наши резиденции не просто как жилые пространства, а как шедевры дизайна и комфорта.",
      art_btn: "Смотреть галерею"
    },
    contact: {
      title: "Стать частью Royal Park",
      desc: "Запланируйте индивидуальный просмотр или запросите дополнительную информацию о Royal Park.",
      form_name: "Полное имя",
      form_email: "Email адрес",
      form_phone: "Номер телефона",
      form_message: "Сообщение",
      form_submit: "Отправить запрос",
      info_address: "Адрес",
      info_phone: "Телефон",
      info_email: "Email",
      address_val: "Kənar dairəvi yol 10, Yeni Yasamal / AZ1070, Bakı, Azərbaycan"
    },
    residences: {
      clickToEnlarge: "Нажмите, чтобы увеличить"
    }
  },
  az: {
    nav: { 
      home: "Ana Səhifə", 
      about: "Haqqımızda",
      map: "Xəritədə",
      villas: "Villalar",
      townhouses: "Taunhauslar",
      plans: "Planlar",
      gallery: "Qalereya",
      offers: "Xüsusi təkliflər",
      contact: "Görüş təyin edin", 
      golfTour: "Golf Car Tour",
      residentPortal: "Sakin portalı" 
    },
    about: {
      title: "Royal Park Haqqında",
      subtitle: "Bakıda Sakitlik və Zəriflik Sığınacağı",
      description1: "Royal Park 1994-cü ildən formalaşmağa başlayan bir şəhərcikdir. Burada əsasən sakitliyi sevən ailələr yaşayır. İnsanlar buranı, uşaqları rahat böyüsün deyə seçirlər.",
      description2: "",
      feature1Title: "Orqanik Memarlıq",
      feature1Desc: "Uzunömürlü estetika üçün təbii daş və yüksək keyfiyyətli ağac növləri ilə fasad işləməsi.",
      feature2Title: "Mütləq Məxfilik",
      feature2Desc: "24/7 mühafizə, nəzarət olunan giriş və sakit həyatı təmin edən düşünülmüş planlama.",
      feature3Title: "Yaşıl Oazis",
      feature3Desc: "Bakının mərkəzində zəngin bağlar, təmiz mikromühit və sakit gəzinti xiyabanları."
    },
    map: {
      title: "Xəritədə Royal Park",
      subtitle: "Bakının sakit və ekoloji cəhətdən təmiz guşəsində, əsas magistrallara rahat çıxışla əlverişli yerləşmə",
      badge: "Bakı • Yeni Yasamal",
      addressTitle: "Kompleksin Rəsmi Ünvanı",
      addressVal: "Kənar dairəvi yol 10, Yeni Yasamal / AZ1070, Bakı, Azərbaycan",
      openInGoogle: "Google Xəritədə Açın",
      getDirections: "Marşrut qurun",
      copyAddress: "Ünvanı kopyalayın",
      copied: "Ünvan kopyalandı!",
      featuresTitle: "Məkan və Strateji Üstünlüklər",
      f1Title: "Dairəvi yola birbaşa çıxış",
      f1Desc: "Bakı Kənar Dairəvi yolu üzərində yerləşərək tıxacsız şəhərin mərkəzinə və hava limanına sürətli çıxış təmin edir.",
      f2Title: "Təmiz hava və sakit mikromühit",
      f2Desc: "Şəhər səs-küyündən uzaq, təmiz dəniz mehinin duyulduğu yüksəklikdə, zəngin yaşıllıqlar əhatəsində.",
      f3Title: "24/7 Nəzarət-buraxılış məntəqəsi",
      f3Desc: "Yalnız sakinlər və onların dəvət etdiyi qonaqlar üçün mühafizə olunan, təhlükəsiz giriş qapısı.",
      distancesTitle: "Əsas Məkanlara Təxmini Məsafə",
      d1Name: "Alov Qüllələri və Şəhər Mərkəzi",
      d1Time: "15 dəq",
      d2Name: "Dənizkənarı Milli Park (Bulvar)",
      d2Time: "18 dəq",
      d3Name: "Heydər Əliyev Beynəlxalq Hava Limanı",
      d3Time: "25 dəq",
      d4Name: "Yasamal Mall və 20 Yanvar m.",
      d4Time: "7 dəq",
      needAssistanceTitle: "Ünvanı tapmaqda köməyə ehtiyacınız var?",
      needAssistanceDesc: "Satış komandamız kompleksə rahat gəlməyiniz üçün sizə bələdçilik etməyə və ya sizi qarşılamağa hazırdır.",
      callUs: "Satış ofisinə zəng edin",
      bookTour: "Baxış təyin edin"
    },
    villas: {
      title: "Royal Park Villaları",
      subtitle: "Müstəqil Lüks və Dəyişməz Məxfilik",
      description: "Bizim müstəqil lüks villalarımız geniş yaşayış sahələri, özəl baxımlı bağlar, çoxavtomobilli dayanacaq və evi təbii işıqla dolduran panoramik pəncərələr təklif edir.",
      spec1: "Xüsusi torpaq sahəsi və bağça",
      spec2: "Geniş çoxsəviyyəli memarlıq",
      spec3: "Fərdi daxili planlama imkanı",
      spec4: "Şəxsi örtülü dayanacaq"
    },
    townhouses: {
      title: "Royal Park Taunhausları",
      subtitle: "Harmoniyada Müasir Ailə Həyatı",
      description: "Qonşuluq ruhunu özəl açıq sahə ilə birləşdirmək istəyən ailələr üçün dizayn edilmişdir. Taunhauslarımız şəxsi girişləri, rahat yaşıl həyətləri və funksional mərtəbə planları ilə seçilir.",
      spec1: "Şəxsi arxa həyət və qazon",
      spec2: "Erqonomik çoxmərtəbəli yaşayış sahəsi",
      spec3: "Özəl giriş və teras",
      spec4: "Xüsusi avtodayanacaq sahəsi"
    },
    plans: {
      title: "Planlar və Layihələr",
      subtitle: "Rezidensiyalarımızın təfərrüatlı layihələrini kəşf edin",
      villasTab: "Villalar",
      townhousesTab: "Taunhauslar",
      clickToEnlarge: "Böyütmək üçün eskizə klikləyin",
      villasDesc: "Uca tavanlı, daxili həyətə çıxışı olan və otaqların optimal paylandığı geniş villa planları.",
      townhousesDesc: "Şəxsi həyəti, quraşdırılmış dayanacağı və işıqlı qonaq otaqları olan erqonomik taunhaus planları."
    },
    gallery: {
      title: "Foto Qalereya",
      subtitle: "Royal Park-ın atmosferik görüntüləri, memarlıq detalları və sakit küçələri",
      filterAll: "Bütün fotolar",
      filterStreets: "Küçələr və ərazi",
      filterArchitecture: "Memarlıq",
      filterAtmosphere: "Detallar və atmosfer"
    },
    offers: {
      title: "Xüsusi təkliflər və Xüsusi şərtlər",
      subtitle: "Daşınmaz əmlak əldə etmək üçün sərfəli bəndlər və elastik maliyyə şərtləri",
      item1Title: "Royal Parkdan 0% faizsiz hissə-hissə ödəniş",
      item1Desc: "Bank faizi və əlavə ödəniş olmadan 36 ayadək elastik birbaşa hissə-hissə ödəniş planları.",
      item2Title: "Fərdi planlaşdırma uyğunlaşdırılması",
      item2Desc: "Tikinti mərhələsində daxili arakəsmələrin pulsuz memarlıq məsləhəti və düzəlişi.",
      item3Title: "100% Hüquqi dəstək və Çıxarış",
      item3Desc: "Tam hüquqi yardım və mülkiyyət hüququnun (Çıxarış / Kupça) pulsuz qeydiyyatı.",
      item4Title: "Erkən bron zamanı bonus paketi",
      item4Desc: "Landşaft dizaynı, «ağıllı ev» sistemi və ya təmir işləri üçün eksklüziv bonuslar.",
      item5Title: "Şəxsi ödəniş qrafiki",
      item5Desc: "Maliyyə imkanlarınıza və istəklərinizə uyğunlaşdırılmış fərdi ödəniş sxemləri.",
      item6Title: "İdarəetmə şirkətinin xidməti",
      item6Desc: "Ərazinin 24/7 təmizliyi, təhlükəsizliyi, yaşıllıqlara qulluq və konsyerj xidməti.",
      ctaTitle: "Fərdi şərtlərlə maraqlanırsınız?",
      ctaBtn: "Fərdi hesablamanı tələb edin"
    },
    hero: { subtitle: "Bakı, Azərbaycan", title: "Royal Park" },
    footer: { desc: "", rights: "Bütün hüquqlar qorunur.", privacy: "Məxfilik Siyasəti", terms: "İstifadə Şərtləri", cookies: "Kuki Faylları" },
    legal: {
      title: "Hüquqi Məlumat",
      data_protection_title: "Məlumatların Beynəlxalq Qorunması",
      data_protection_p1: "Əgər bu veb-sayta Azərbaycandan kənardan daxil olursunuzsa, nəzərə alın ki, məlumatlarınız Azərbaycana ötürülə və orada emal edilə bilər.",
      data_protection_p2: "Məlumatlarınızın beynəlxalq standartlara uyğun qorunmasını təmin etmək üçün müvafiq təhlükəsizlik tədbirləri görürük.",
      rights_title: "Sizin Hüquqlarınız",
      rights_p1: "Yerləşdiyiniz yerdən asılı olaraq aşağıdakı hüquqlara malik ola bilərsiniz:",
      rights_li1: "şəxsi məlumatlarınıza çıxış tələb etmək",
      rights_li2: "məlumatların düzəldilməsini və ya silinməsini tələb etmək",
      rights_li3: "istənilən vaxt razılığınızı geri götürmək",
      rights_p2: "Hüquqlarınızdan istifadə etmək üçün bizimlə əlaqə saxlayın: ",
      cookies_title: "Kuki Faylları və Razılıq",
      cookies_p1: "Bu veb-saytdan istifadə etməklə, siz bu siyasətə uyğun olaraq kuki fayllarının istifadəsinə razılıq verirsiniz.",
      cookies_p2: "Brauzerinizin parametrləri vasitəsilə kuki fayllarını idarə edə və ya söndürə bilərsiniz.",
      cookies_p3: "Kuki faylları olmadan veb-saytın bəzi funksiyaları düzgün işləməyə bilər."
    },
    home: {
      atm_title: "Mütləq Sükut Atmosferi",
      atm_desc: "Bakının qəlbində əsl sığınacaq kəşf edin. Royal Park əsl sükutun nadir lüksünü qiymətləndirənlər üçün dizayn edilmişdir.",
      atm_btn: "Həyat Tərzini Kəşf Edin",
      qual_title: "Güzəştsiz Keyfiyyət",
      qual_desc: "Royal Park-da hər bir detal, gözləntiləri aşan yaşayış təcrübəsini təmin etmək üçün premium materiallarla hazırlanmışdır.",
      f1_title: "Təmiz Mühit", f1_desc: "Qabaqcıl hava filtrasiyası və geniş yaşıl sahələr.",
      f2_title: "Mütləq Məxfilik", f2_desc: "Müasir təhlükəsizlik sistemi və düşünülmüş memarlıq.",
      f3_title: "Orqanik Materiallar", f3_desc: "Təbii daş, premium ağac növləri və ekoloji təmiz materiallarla inşa edilmişdir.",
      art_title: "Yaşamaq Sənəti",
      art_desc: "Hər bir detal sənətkar dəqiqliyi ilə işlənmişdir. Biz rezidensiyalarımıza sadəcə yaşayış məkanı kimi deyil, dizayn və rahatlığın şah əsəri kimi baxırıq.",
      art_btn: "Qalereyaya Baxın"
    },
    contact: {
      title: "Royal Park-ın bir hissəsi olun",
      desc: "Özəl baxış təyin edin və ya Royal Park haqqında daha ətraflı məlumat əldə edin.",
      form_name: "Ad və Soyad",
      form_email: "E-poçt ünvanı",
      form_phone: "Telefon nömrəsi",
      form_message: "Mesajınız",
      form_submit: "Sorğunu Göndər",
      info_address: "Ünvan",
      info_phone: "Telefon",
      info_email: "E-poçt",
      address_val: "Kənar dairəvi yol 10, Yeni Yasamal / AZ1070, Bakı, Azərbaycan"
    },
    residences: {
      clickToEnlarge: "Böyütmək üçün klikləyin"
    }
  }
};

type I18nContextType = {
  lang: Language;
  setLang: (lang: Language) => void;
  t: typeof translations.en;
};

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const I18nProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLang] = useState<Language>('az');
  const t = translations[lang];

  React.useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) throw new Error('useI18n must be used within I18nProvider');
  return context;
};
