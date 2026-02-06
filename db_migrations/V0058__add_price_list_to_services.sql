-- Add price_list column to services table
ALTER TABLE t_p19021063_social_connect_platf.services 
ADD COLUMN IF NOT EXISTS price_list JSONB DEFAULT NULL;

COMMENT ON COLUMN t_p19021063_social_connect_platf.services.price_list IS 'Прайс-лист услуг в формате JSON: [{"service": "Название", "price": "Цена", "time": "Время"}]';