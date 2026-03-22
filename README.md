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
- this app

i have bash file to autoinstall and auto configure this installation on other git rep
you can clone this repo:
https://github.com/angka/angka

clone that, and make it executable with chmod +x, then execute it following this order
1. setupnode.sh
after supabase started
check in the terminal $ supabase status
copy anon key/publishable key and database url to outside like nano/notepad

2. setupapp.sh
insert anon key and database url to  .env file

3. setupngingx.sh




