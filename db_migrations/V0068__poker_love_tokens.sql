ALTER TABLE t_p19021063_social_connect_platf.poker_rooms 
ADD COLUMN IF NOT EXISTS buy_in INTEGER NOT NULL DEFAULT 100;

ALTER TABLE t_p19021063_social_connect_platf.poker_players
ADD COLUMN IF NOT EXISTS love_invested NUMERIC NOT NULL DEFAULT 0;