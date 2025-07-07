#!/bin/bash
# Script de deploy automático

echo "🚀 Iniciando deploy do Agroderi..."

# Variáveis
APP_DIR="/var/www/agroderi"
REPO_URL="https://github.com/seu-usuario/agroderi.git"

# Parar aplicação
pm2 stop agroderi || true

# Backup da versão anterior
if [ -d "$APP_DIR" ]; then
    sudo mv $APP_DIR $APP_DIR.backup.$(date +%Y%m%d_%H%M%S)
fi

# Clonar repositório
sudo git clone $REPO_URL $APP_DIR
cd $APP_DIR

# Instalar dependências
sudo npm ci --production

# Build da aplicação
sudo npm run build

# Configurar permissões
sudo chown -R agroderi:agroderi $APP_DIR

# Iniciar aplicação
pm2 start scripts/pm2-ecosystem.json

# Salvar configuração PM2
pm2 save
pm2 startup

echo "✅ Deploy concluído!"
echo "🌐 Acesse: https://agroderi.com.br"
