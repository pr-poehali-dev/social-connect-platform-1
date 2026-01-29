-- Добавляем тип 'live' в список разрешенных типов диалогов
ALTER TABLE t_p19021063_social_connect_platf.conversations 
DROP CONSTRAINT IF EXISTS conversations_type_check;

ALTER TABLE t_p19021063_social_connect_platf.conversations 
ADD CONSTRAINT conversations_type_check 
CHECK (type IN ('personal', 'group', 'deal', 'live'));