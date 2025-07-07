#!/bin/bash
# Script para configurar VPS Ubuntu 22.04 para Agroderi

echo "🚀 Configurando VPS para Agroderi..."

# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Instalar PM2 (gerenciador de processos)
sudo npm install -g pm2

# Instalar Nginx
sudo apt install nginx -y

# Instalar PostgreSQL (se não usar Supabase)
sudo apt install postgresql postgresql-contrib -y

# Instalar Certbot (SSL gratuito)
sudo apt install certbot python3-certbot-nginx -y

# Criar usuário para deploy
sudo adduser --disabled-password --gecos "" agroderi
sudo usermod -aG sudo agroderi

# Configurar firewall
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw --force enable

# Criar diretórios
sudo mkdir -p /var/www/agroderi
sudo chown agroderi:agroderi /var/www/agroderi

echo "✅ VPS configurado! Próximo passo: fazer deploy da aplicação"
