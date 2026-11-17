import { VideoShowcase } from '../types';

// Retain the exported name for compatibility with the old project.
export const SAMPLE_15SEC_SHOWCASE: VideoShowcase = {
  id: 'showcase_15sec_test',
  title: 'Национальный костюм: детали ансамбля',
  subtitle: 'Демонстрационный видеопоказ', culture: 'Азербайджан',
  durationSec: 10, costumeId: 'karabakh_banoo',
  videoUrl: '/media/karabakh-demo.mp4', posterUrl: '/media/karabakh-poster.jpg',
  isTest15Sec: true,
  chapters: [
    { id: 'chapter_head', title: 'Головной убор и украшение', startSec: 0, durationSec: 4 },
    { id: 'chapter_chest', title: 'Нагрудное украшение', startSec: 4, durationSec: 2 },
    { id: 'chapter_sleeve', title: 'Рукав и отделка', startSec: 6, durationSec: 2 },
    { id: 'chapter_skirt', title: 'Ткань и силуэт', startSec: 8, durationSec: 2 },
  ],
  hotspots: [
    { id: 'demo_head', timeSec: 0.5, visibleDurationSec: 3.1, xPercent: 49, yPercent: 17,
      title: 'Налобное украшение', partName: 'Головной убор',
      description: 'Посмотрите, как декоративные подвески обрамляют лицо и дополняют головной убор.\n\nЭто пример интерактивной метки. В студии проекта редактор может заменить этот текст описанием конкретного украшения, его материала и истории.',
      trajectory: [{ timeSec: 0.5, xPercent: 49, yPercent: 18 }, { timeSec: 1.4, xPercent: 50, yPercent: 15 }, { timeSec: 2.8, xPercent: 50, yPercent: 17 }, { timeSec: 3.6, xPercent: 50, yPercent: 17 }] },
    { id: 'demo_necklace', timeSec: 4.1, visibleDurationSec: 1.5, xPercent: 52, yPercent: 40,
      title: 'Нагрудное украшение', partName: 'Ювелирные детали',
      description: 'В этом фрагменте хорошо видны декоративные элементы и подвески нагрудного украшения. Камера позволяет рассмотреть их вблизи.\n\nАвтор экспоната может указать название, происхождение и технику исполнения в этом окне.',
      trajectory: [{ timeSec: 4.1, xPercent: 52, yPercent: 46 }, { timeSec: 5, xPercent: 53, yPercent: 37 }, { timeSec: 5.6, xPercent: 52, yPercent: 29 }] },
    { id: 'demo_sleeve', timeSec: 6.1, visibleDurationSec: 1.5, xPercent: 35, yPercent: 53,
      title: 'Рукав и декоративная отделка', partName: 'Крой и ткань',
      description: 'Контраст ткани, фактура рукава и декоративная отделка формируют многослойность образа.\n\nДля вашей коллекции здесь можно добавить рассказ о крое, вышивке и особенностях выбранного предмета.',
      trajectory: [{ timeSec: 6.1, xPercent: 34, yPercent: 50 }, { timeSec: 7.6, xPercent: 42, yPercent: 47 }] },
    { id: 'demo_fabric', timeSec: 8.1, visibleDurationSec: 1.9, xPercent: 52, yPercent: 48,
      title: 'Ткань и нижняя отделка', partName: 'Силуэт костюма',
      description: 'Последний фрагмент показывает рисунок ткани, вертикальные складки и отделку по нижнему краю.\n\nНажатие на метку останавливает видео, чтобы описание можно было спокойно прочитать. Продолжить просмотр можно кнопкой «Смотреть».',
      trajectory: [{ timeSec: 8.1, xPercent: 52, yPercent: 40 }, { timeSec: 9.9, xPercent: 52, yPercent: 50 }] },
  ],
};
