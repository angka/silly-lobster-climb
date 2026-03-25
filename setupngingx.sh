#!/bin/bash

set -e

APP_NAME="silly-lobster-climb"
APP_PORT=8080
NGINX_CONF="/etc/nginx/sites-available/$APP_NAME"

echo "🚀 Starting setup..."

# --- Initialize Supabase
supabase init

echo "🐳 Starting Supabase..."
supabase start

echo "✅ DONE! Supabase is running locally."
echo "👉 Access Studio: http://localhost:54323"

# --- ENV SETUP ---
echo "⚙️ Setting up environment variables..."

# Ask user input
read -p "Enter VITE_SUPABASE_URL: " SUPABASE_URL
read -p "Enter VITE_SUPABASE_ANON_KEY: " SUPABASE_KEY

# Create .env if not exist
if [ ! -f ".env" ]; then
  echo "📄 Creating new .env file..."
  touch .env
fi

# Function to set or update env variable
set_env() {
  KEY=$1
  VALUE=$2

  if grep -q "^$KEY=" .env; then
    sed -i "s|^$KEY=.*|$KEY=$VALUE|" .env
  else
    echo "$KEY=$VALUE" >> .env
  fi
}

# Apply values
set_env "VITE_SUPABASE_URL" "$SUPABASE_URL"
set_env "VITE_SUPABASE_ANON_KEY" "$SUPABASE_KEY"

echo "✅ .env configured:"
grep VITE_SUPABASE .env

# Install PM2
echo "📦 Installing PM2..."
npm install -g pm2

# Install dependencies (if not already)
echo "📦 Installing npm dependencies..."
npm install

# Build app
echo "🏗️ Building app..."
npm run build

# Stop existing PM2 app (if exists)
echo "🧹 Cleaning previous PM2 process..."
pm2 delete $APP_NAME || true

# Run preview in background
echo "▶️ Starting app with PM2..."
pm2 start "npm run preview -- --host 0.0.0.0" --name $APP_NAME

# Save PM2 process
pm2 save

# Enable PM2 startup
echo "⚙️ Enabling PM2 startup..."
pm2 startup systemd -u $USER --hp $HOME

# Install Nginx
echo "🌐 Installing Nginx..."
sudo apt update
sudo apt install -y nginx

# Create Nginx config
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

# Enable config
echo "🔗 Enabling Nginx config..."
sudo ln -sf $NGINX_CONF /etc/nginx/sites-enabled/

# Remove default config (optional but recommended)
sudo rm -f /etc/nginx/sites-enabled/default

# Test Nginx
echo "🧪 Testing Nginx..."
sudo nginx -t

# Restart Nginx
echo "🔄 Restarting Nginx..."
sudo systemctl restart nginx

echo "✅ DONE!"
echo "🌐 Access your app via: http://YOUR_VPS_IP or TAILSCALE_IP"
