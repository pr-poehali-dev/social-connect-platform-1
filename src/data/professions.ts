export interface Profession {
  value: string;
  label: string;
  categoryIds: number[];
  subcategoryIds: number[];
}

export const PROFESSIONS: Profession[] = [
  // Авто (cat 1)
  { value: 'auto_mechanic', label: 'Автомеханик', categoryIds: [1], subcategoryIds: [1] },
  { value: 'driver', label: 'Водитель', categoryIds: [1], subcategoryIds: [3, 4] },
  { value: 'tow_truck', label: 'Эвакуаторщик', categoryIds: [1], subcategoryIds: [5] },
  { value: 'locksmith_auto', label: 'Автослесарь', categoryIds: [1], subcategoryIds: [6] },
  { value: 'detailing', label: 'Детейлер', categoryIds: [1], subcategoryIds: [7] },

  // Дом (cat 2)
  { value: 'renovation', label: 'Строитель / Ремонтник', categoryIds: [2], subcategoryIds: [8] },
  { value: 'interior_designer', label: 'Дизайнер интерьеров', categoryIds: [2], subcategoryIds: [9] },
  { value: 'plumber', label: 'Сантехник', categoryIds: [2], subcategoryIds: [10] },
  { value: 'electrician', label: 'Электрик', categoryIds: [2], subcategoryIds: [11] },
  { value: 'furniture_assembler', label: 'Сборщик мебели', categoryIds: [2], subcategoryIds: [12] },
  { value: 'window_installer', label: 'Монтажник окон', categoryIds: [2], subcategoryIds: [13] },
  { value: 'tiler', label: 'Плиточник', categoryIds: [2], subcategoryIds: [14, 20] },
  { value: 'painter', label: 'Маляр / Штукатур', categoryIds: [2], subcategoryIds: [15, 18] },
  { value: 'ceiling', label: 'Потолочник', categoryIds: [2], subcategoryIds: [16] },
  { value: 'floor', label: 'Укладчик полов', categoryIds: [2], subcategoryIds: [17] },
  { value: 'carpenter', label: 'Столяр / Плотник', categoryIds: [2], subcategoryIds: [21] },
  { value: 'drywall', label: 'Гипсокартонщик', categoryIds: [2], subcategoryIds: [22] },
  { value: 'high_altitude', label: 'Промышленный альпинист', categoryIds: [2], subcategoryIds: [23] },
  { value: 'insulation', label: 'Изолировщик / Утеплитель', categoryIds: [2], subcategoryIds: [24] },
  { value: 'appliance_repair', label: 'Мастер по ремонту бытовой техники', categoryIds: [2], subcategoryIds: [25, 26] },

  // Красота (cat 3)
  { value: 'nail_tech', label: 'Мастер маникюра / педикюра', categoryIds: [3], subcategoryIds: [27] },
  { value: 'hairdresser', label: 'Парикмахер', categoryIds: [3], subcategoryIds: [28, 36] },
  { value: 'lash_brow', label: 'Мастер по ресницам и бровям', categoryIds: [3], subcategoryIds: [29] },
  { value: 'pmu', label: 'Мастер перманентного макияжа', categoryIds: [3], subcategoryIds: [30] },
  { value: 'cosmetologist', label: 'Косметолог', categoryIds: [3], subcategoryIds: [31] },
  { value: 'epilation', label: 'Мастер эпиляции', categoryIds: [3], subcategoryIds: [32] },
  { value: 'makeup_artist', label: 'Визажист', categoryIds: [3], subcategoryIds: [33] },
  { value: 'masseur', label: 'Массажист / СПА-специалист', categoryIds: [3, 4], subcategoryIds: [34] },
  { value: 'tattoo', label: 'Тату-мастер / Пирсер', categoryIds: [3], subcategoryIds: [35] },

  // Здоровье (cat 4)
  { value: 'psychologist', label: 'Психолог', categoryIds: [4], subcategoryIds: [37] },
  { value: 'nutritionist', label: 'Диетолог', categoryIds: [4], subcategoryIds: [38] },
  { value: 'fitness_trainer', label: 'Фитнес-тренер / Инструктор йоги', categoryIds: [4, 6], subcategoryIds: [39, 50] },
  { value: 'dentist', label: 'Стоматолог', categoryIds: [4], subcategoryIds: [40] },
  { value: 'podologist', label: 'Подолог', categoryIds: [4], subcategoryIds: [41] },

  // Риелтор (cat 5)
  { value: 'realtor', label: 'Риелтор', categoryIds: [5], subcategoryIds: [42, 43] },

  // Обучение (cat 6)
  { value: 'tutor', label: 'Репетитор', categoryIds: [6], subcategoryIds: [44] },
  { value: 'language_teacher', label: 'Преподаватель иностранных языков', categoryIds: [6], subcategoryIds: [45] },
  { value: 'it_teacher', label: 'IT / Бизнес-тренер', categoryIds: [6], subcategoryIds: [46] },
  { value: 'design_teacher', label: 'Преподаватель дизайна / рисования', categoryIds: [6], subcategoryIds: [47] },
  { value: 'beauty_teacher', label: 'Преподаватель в сфере красоты', categoryIds: [6], subcategoryIds: [48] },
  { value: 'driving_instructor', label: 'Инструктор по вождению', categoryIds: [6], subcategoryIds: [49] },
  { value: 'sport_dance_coach', label: 'Тренер по спорту / танцам', categoryIds: [6], subcategoryIds: [50] },
  { value: 'music_teacher', label: 'Преподаватель музыки / театра', categoryIds: [6], subcategoryIds: [51] },

  // Фото и видеосъемка (cat 7)
  { value: 'photographer', label: 'Фотограф', categoryIds: [7], subcategoryIds: [] },
  { value: 'videographer', label: 'Видеограф', categoryIds: [7], subcategoryIds: [] },

  // Няни, Сиделки (cat 8)
  { value: 'nanny', label: 'Няня', categoryIds: [8], subcategoryIds: [] },
  { value: 'caregiver', label: 'Сиделка', categoryIds: [8], subcategoryIds: [] },

  // Уход за животными (cat 9)
  { value: 'pet_care', label: 'Грумер / Зооняня', categoryIds: [9], subcategoryIds: [] },
  { value: 'vet', label: 'Ветеринар', categoryIds: [9], subcategoryIds: [] },

  // Компьютерная помощь (cat 10)
  { value: 'it_support', label: 'IT-специалист / Компьютерный мастер', categoryIds: [10], subcategoryIds: [] },

  // Аренда оборудования (cat 11)
  { value: 'equipment_rental', label: 'Аренда оборудования', categoryIds: [11], subcategoryIds: [] },

  // Деловые услуги (cat 12)
  { value: 'security', label: 'Охранник / Телохранитель', categoryIds: [12], subcategoryIds: [52] },
  { value: 'accountant', label: 'Бухгалтер / Финансист', categoryIds: [12], subcategoryIds: [53] },
  { value: 'real_estate_consultant', label: 'Консультант по недвижимости', categoryIds: [12], subcategoryIds: [54] },
  { value: 'marketer', label: 'Маркетолог / SMM-специалист', categoryIds: [12], subcategoryIds: [55] },
  { value: 'lawyer', label: 'Юрист', categoryIds: [12], subcategoryIds: [56] },
  { value: 'it_designer', label: 'IT / Дизайнер / Копирайтер', categoryIds: [12], subcategoryIds: [57] },
  { value: 'print_ads', label: 'Полиграфист / Рекламщик', categoryIds: [12], subcategoryIds: [58] },

  // Уборка (cat 13)
  { value: 'cleaner', label: 'Клинер / Уборщик', categoryIds: [13], subcategoryIds: [59, 60, 61, 62, 63, 64] },

  // Праздники, мероприятия (cat 14)
  { value: 'event_organizer', label: 'Организатор мероприятий', categoryIds: [14], subcategoryIds: [65, 66] },
  { value: 'animator', label: 'Аниматор / Ведущий', categoryIds: [14], subcategoryIds: [65, 66] },

  // Искусство (cat 15)
  { value: 'musician', label: 'Музыкант / Поэт', categoryIds: [15], subcategoryIds: [67] },
  { value: 'artist', label: 'Художник', categoryIds: [15], subcategoryIds: [68] },
  { value: 'customizer', label: 'Кастомайзер', categoryIds: [15], subcategoryIds: [69] },
  { value: 'handmade', label: 'Мастер handmade', categoryIds: [15], subcategoryIds: [70] },

  // Прочее
  { value: 'other', label: 'Другое', categoryIds: [], subcategoryIds: [] },
];

export const getProfessionByValue = (value: string): Profession | undefined =>
  PROFESSIONS.find((p) => p.value === value);

export const getProfessionsByCategory = (categoryId: number): Profession[] =>
  PROFESSIONS.filter((p) => p.categoryIds.includes(categoryId));

export const getProfessionsBySubcategory = (subcategoryId: number): Profession[] =>
  PROFESSIONS.filter((p) => p.subcategoryIds.includes(subcategoryId));

export const getServiceCategoriesForProfession = (professionValue: string): number[] =>
  getProfessionByValue(professionValue)?.categoryIds ?? [];

export const getServiceSubcategoriesForProfession = (professionValue: string): number[] =>
  getProfessionByValue(professionValue)?.subcategoryIds ?? [];

export default PROFESSIONS;
