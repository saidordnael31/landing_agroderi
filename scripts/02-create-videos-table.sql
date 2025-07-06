-- Cria a tabela para armazenar os vídeos do funil
CREATE TABLE IF NOT EXISTS funnel_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  step INT NOT NULL,
  language VARCHAR(5) NOT NULL,
  video_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  -- Garante que haja apenas um vídeo por etapa e idioma
  UNIQUE(step, language)
);
