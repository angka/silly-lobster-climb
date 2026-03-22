# Welcome to EMR Contact Lens 

version alpha 1.00
i build this application because i don't know any medical record that suits me. 

installation:
i've tried only on linux ubuntu 24.04
with minimum spesification ram 4Gb. if you have less than 4gb, there is a chance failure to start supabase. 

- docker
- node.js minimum (node v.20) and (npm v.10) 
- supabase
- nginx
- pm2
- tailscale (make sure you already sign up at tailscale.com (free)) 
- this app

i have bash file to autoinstall and auto configure this installation on other git rep
you can clone this repo:
https://github.com/angka/angka

clone that, and make it executable with chmod +x, then execute it following this order
1. setupnode.sh
- after supabase started
check in the terminal $ supabase status
cocopynon key/publishable key and database url to outside like nano/notepad
- at tailscale installation it gave the link, open that link and login with your account, it will be connected. later we will using tailscale ip to connect the app for security reason, your device must use tailscale too, so the app cannot be visited if you are not connected to tailscale network with your account.
- 

2. setupapp.sh
this clone repositories, and the script prompt us to insert anon key and database url to  .env file during running the script

4. setupngingx.sh
run this script under app name folder, it will build app, run it on background using pm2, and install nginx, so you can visit the app with tailscale ip without writing port



