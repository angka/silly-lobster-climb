# EMR Contact Lens 

version alpha 1.00
i build this application because i don't know any medical record that suits me. 

installation:
i've tried only on linux ubuntu 24.04
with minimum spesification ram 4Gb. if you have less than 4gb, there is a chance failure to start supabase (yeahh it need a lot of ram). 
this repositories still have default url/anon key for development purpose. you need change this for your database (will ask during installation) 

software needed
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
- configure the supabase in supabase studio (http://yourip:54323) open sql editor and copy command from SUPABASE_SETUP.sql provided in this repositories, run it, and done. 

2. setupapp.sh
the script prompt us to insert anon key and database url to  .env file during running the script

3. setupngingx.sh
run this script within app folder (silly-lobster-climb), it will build the app, run it on background using pm2, and install nginx, so you can visit the app with tailscale ip without using any spesific port.

after complete the process, open it by access your tailscale ip, you need to create first admin account by sign up new account, username must admin@gmail.com and password you can create by yourself. i set that account under name of it if new registration under that name always became administrator. 

 command maybe you need
$ pm2 list #to check pm2 running app use
$ supabase status #to check supabase url/anon key
$ git pull origin master #to pull/update this repositories

feature
1. user
   default user and admin, 
3. patient list
4. admin management
5. fitting for RGP and Rose K2
6. follow up session
7. print out as pdf

