-- Вставляем категории услуг
INSERT INTO service_categories (name) VALUES
('Авто'),
('Дом'),
('Красота'),
('Здоровье'),
('Риелтор'),
('Обучение'),
('Фото и видеосъемка'),
('Няни, Сиделки'),
('Уход за животными'),
('Компьютерная помощь'),
('Аренда оборудования'),
('Деловые услуги'),
('Уборка'),
('Праздники, мероприятия'),
('Искусство');

-- Вставляем подкатегории для Авто
INSERT INTO service_subcategories (category_id, name) 
SELECT id, unnest(ARRAY[
    'Автосервис',
    'Аренда авто',
    'Личный водитель',
    'Трансфер',
    'Эвакуатор',
    'Вскрытие автозамков',
    'Детейлинг, Тюнинг'
]) FROM service_categories WHERE name = 'Авто';

-- Вставляем подкатегории для Дом
INSERT INTO service_subcategories (category_id, name) 
SELECT id, unnest(ARRAY[
    'Ремонт квартир и домов под ключ',
    'Дизайн интерьеров',
    'Сантехник',
    'Электрик',
    'Сборка и ремонт мебели',
    'Окна и балконы',
    'Плиточник',
    'Поклейка обоев и малярные работы',
    'Потолки',
    'Полы и напольные покрытия',
    'Штукатурные работы',
    'Двери',
    'Плиточные работы',
    'Столярные и плотницкие работы',
    'Гипсокартонные работы',
    'Высотные работы',
    'Изоляция и утепление',
    'Ремонт бытовой техники',
    'Монтаж и установка бытовой техники'
]) FROM service_categories WHERE name = 'Дом';

-- Вставляем подкатегории для Красота
INSERT INTO service_subcategories (category_id, name) 
SELECT id, unnest(ARRAY[
    'Маникюр, педикюр',
    'Услуги парикмахера',
    'Ресницы, брови',
    'Перманентный макияж',
    'Косметология',
    'Эпиляция',
    'Макияж',
    'СПА-услуги, массаж',
    'Тату, пирсинг',
    'Наращивание волос'
]) FROM service_categories WHERE name = 'Красота';

-- Вставляем подкатегории для Здоровье
INSERT INTO service_subcategories (category_id, name) 
SELECT id, unnest(ARRAY[
    'Психология',
    'Диетология',
    'Фитнес, йога',
    'Стоматология',
    'Подология'
]) FROM service_categories WHERE name = 'Здоровье';

-- Вставляем подкатегории для Риелтор
INSERT INTO service_subcategories (category_id, name) 
SELECT id, unnest(ARRAY[
    'Аренда посуточно',
    'Длительная аренда'
]) FROM service_categories WHERE name = 'Риелтор';

-- Вставляем подкатегории для Обучение
INSERT INTO service_subcategories (category_id, name) 
SELECT id, unnest(ARRAY[
    'Репетитор',
    'Иностранные языки',
    'IT, бизнес',
    'Дизайн, рисование',
    'Красота, здоровье',
    'Вождение',
    'Спорт, танцы',
    'Музыка, театр'
]) FROM service_categories WHERE name = 'Обучение';

-- Вставляем подкатегории для Деловые услуги
INSERT INTO service_subcategories (category_id, name) 
SELECT id, unnest(ARRAY[
    'Охрана, безопасность',
    'Бухгалтерия, финансы',
    'Консультации по недвижимости',
    'Маркетинг и продвижение',
    'Юридические услуги',
    'IT, дизайн, тексты',
    'Полиграфия, наружная реклама'
]) FROM service_categories WHERE name = 'Деловые услуги';

-- Вставляем подкатегории для Уборка
INSERT INTO service_subcategories (category_id, name) 
SELECT id, unnest(ARRAY[
    'Генеральная уборка',
    'Мойка окон',
    'Чистка ковров',
    'Чистка мягкой мебели',
    'Дезинфекция, дезинсекция',
    'Химчистка, стирка'
]) FROM service_categories WHERE name = 'Уборка';

-- Вставляем подкатегории для Праздники, мероприятия
INSERT INTO service_subcategories (category_id, name) 
SELECT id, unnest(ARRAY[
    'Организация и проведение мероприятий',
    'Организация досуга и отдыха'
]) FROM service_categories WHERE name = 'Праздники, мероприятия';

-- Вставляем подкатегории для Искусство
INSERT INTO service_subcategories (category_id, name) 
SELECT id, unnest(ARRAY[
    'Музыка, стихи, песни на заказ',
    'Услуги художников',
    'Кастомизация',
    'Рукоделие на заказ'
]) FROM service_categories WHERE name = 'Искусство';

-- Добавляем новые поля в таблицу services для связи с категориями
ALTER TABLE services ADD COLUMN IF NOT EXISTS category_id INTEGER REFERENCES service_categories(id);
ALTER TABLE services ADD COLUMN IF NOT EXISTS subcategory_id INTEGER REFERENCES service_subcategories(id);
ALTER TABLE services ADD COLUMN IF NOT EXISTS title VARCHAR(255);

-- Создаём индексы для новых полей
CREATE INDEX IF NOT EXISTS idx_services_category_id ON services(category_id);
CREATE INDEX IF NOT EXISTS idx_services_subcategory_id ON services(subcategory_id);