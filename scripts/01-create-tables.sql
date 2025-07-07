-- Criação das tabelas do banco de dados Agroderi
-- Execute este script no Supabase SQL Editor

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela de usuários
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  cpf VARCHAR(14),
  role VARCHAR(20) DEFAULT 'buyer' CHECK (role IN ('admin', 'viewer', 'buyer', 'affiliate')),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'pending', 'blocked')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de afiliados
CREATE TABLE IF NOT EXISTS affiliates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  affiliate_code VARCHAR(20) UNIQUE NOT NULL,
  tier VARCHAR(20) DEFAULT 'standard' CHECK (tier IN ('standard', 'premium')),
  total_sales DECIMAL(12,2) DEFAULT 0,
  total_commission DECIMAL(12,2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('active', 'pending', 'blocked')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de investimentos
CREATE TABLE IF NOT EXISTS investments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  plan_id VARCHAR(50) NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  bonus DECIMAL(12,2) DEFAULT 0,
  affiliate_bonus DECIMAL(12,2) DEFAULT 0,
  affiliate_id UUID REFERENCES affiliates(id),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  purchase_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  unlock_date TIMESTAMP WITH TIME ZONE NOT NULL,
  withdrawal_requested BOOLEAN DEFAULT FALSE,
  withdrawal_date TIMESTAMP WITH TIME ZONE,
  payment_method VARCHAR(50),
  transaction_id VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de comissões
CREATE TABLE IF NOT EXISTS commissions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  affiliate_id UUID REFERENCES affiliates(id) ON DELETE CASCADE,
  investment_id UUID REFERENCES investments(id) ON DELETE CASCADE,
  amount DECIMAL(12,2) NOT NULL,
  percentage DECIMAL(5,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled')),
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  paid_at TIMESTAMP WITH TIME ZONE,
  payment_method VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de missões/airdrops
CREATE TABLE IF NOT EXISTS missions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_email VARCHAR(255) NOT NULL,
  wallet_address VARCHAR(100) NOT NULL,
  steps_completed JSONB DEFAULT '[]',
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'paid')),
  reward_amount DECIMAL(12,2) DEFAULT 50,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_affiliates_code ON affiliates(affiliate_code);
CREATE INDEX IF NOT EXISTS idx_affiliates_user_id ON affiliates(user_id);
CREATE INDEX IF NOT EXISTS idx_investments_user_id ON investments(user_id);
CREATE INDEX IF NOT EXISTS idx_investments_affiliate_id ON investments(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_investments_status ON investments(status);
CREATE INDEX IF NOT EXISTS idx_commissions_affiliate_id ON commissions(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_commissions_status ON commissions(status);
CREATE INDEX IF NOT EXISTS idx_missions_email ON missions(user_email);
CREATE INDEX IF NOT EXISTS idx_missions_status ON missions(status);
