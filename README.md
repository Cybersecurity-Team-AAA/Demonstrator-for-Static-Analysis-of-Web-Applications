# Demonstrator for Static Analysis of Web Applications
The web appplication is a demonstrator of the use of static analysis tools for web applications for Security Verification and Testing course of Politecnico di Torino,
based on a React front-end and an Express back-end

## Folders structure
- documentation: contains the description of the projet, including the static analysis tools report
- exploits: contains the script used to execute the exploits
- web-app-secure: contains the source code of the secure web applications
- web-app-vulnerable: contains the source code of the vulnerable web applications


## Requirements
- Ubuntu (tested on 22.04, 24.04)
- Firefox Browser

## Installation
1. Install npm
```
sudo apt install npm
```
2. Install curl
```
sudo apt install curl
```
3. Install nvm (installer manager for node)
```
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.0/install.sh | bash
```
4. Update the bash PATHs
```
source ~/.bashrc
```
6. Install node.js version 21
```
nvm install 21
```
7. Install dependencies
```
# Run in web-app-vulnerable/server
npm install

# Run in web-app-vulnerable/client
npm install

# Run in web-app-secure/server
npm install

# Run in web-app-secure/client
npm install
```

## Start the vulnerable web application
```
# Run in web-app-vulnerable/server
npm start

# Run in web-app-vulnerable/client
npm start
```
And you can enter the webapp by visiting http://localhost:3000
## Start the secure web application 
```
# Run in web-app-secure/server
npm start

#in web-app-secure/client
npm start
```
In order to let the browser trust the self-signed certificate, the following steps need to be followed (just once, on first start): <br/>
- Navigate to https://localhost:3001/ <br/>
- Click "advanced"
- Click "accept the risk and continue"

After this, you can finally enter the webapp by visiting http://localhost:3000
