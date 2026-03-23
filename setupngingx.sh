#!/bin/bash

set -e

APP_NAME="silly-lobster-climb"
APP_PORT=8080
NGINX_CONF="/etc/nginx/sites-available/$APP_NAME"

echo "🚀 Starting setup..."

# 1. Install PM2
echo "📦 Installing PM2..."
npm install -g pm2

# 2. Install dependencies (if not already)
echo "📦 Installing npm dependencies..."
npm install

# 3. Build app
echo "🏗️ Building app..."
npm run build

# 4. Stop existing PM2 app (if exists)
echo "🧹 Cleaning previous PM2 process..."
pm2 delete $APP_NAME || true

# 5. Run preview in background
echo "▶️ Starting app with PM2..."
pm2 start "npm run preview -- --host 0.0.0.0" --name $APP_NAME

# 6. Save PM2 process
pm2 save

# 7. Enable PM2 startup
echo "⚙️ Enabling PM2 startup..."
pm2 startup systemd -u $USER --hp $HOME

# 8. Install Nginx
echo "🌐 Installing Nginx..."
sudo apt update
sudo apt install -y nginx

# 9. Create Nginx config
echo "📝 Configuring Nginx..."
sudo bash -c "cat > $NGINX_CONF" <<EOL
server {
    listen 80;

    location / {
        proxy_pass http://127.0.0.1:$APP_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
    }
}
EOL

# 10. Enable config
echo "🔗 Enabling Nginx config..."
sudo ln -sf $NGINX_CONF /etc/nginx/sites-enabled/

# 11. Remove default config (optional but recommended)
sudo rm -f /etc/nginx/sites-enabled/default

# 12. Test Nginx
echo "🧪 Testing Nginx..."
sudo nginx -t

# 13. Restart Nginx
echo "🔄 Restarting Nginx..."
sudo systemctl restart nginx

echo "✅ DONE!"
echo "🌐 Access your app via: http://YOUR_VPS_IP or TAILSCALE_IP"
