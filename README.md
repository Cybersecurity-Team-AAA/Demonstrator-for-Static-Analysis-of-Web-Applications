# Demonstrator for Static Analysis of Web Applications
Project for the Security Verification and Testing course of Politecnico di Torino

## Folders structure
- documentation: contains the description of the projet, including the static analysis tools report
- exploits: contains the script used to execute the exploits
- web-app-secure: contains the source code of the secure web applications
- web-app-vulnerable: contains the source code of the vulnerable web applications


## Requirements
- Ubuntu 20.04.5 LTS
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
3. Install nvm
```
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.0/install.sh | bash
```
4. Restart the terminal
```
source .bashrc
```
6. Install node.js version 21
```
nvm install 21
```
7. Install dependencies
```
# Run in web-app-vulnerable/server
sudo npm install

# Run in web-app-vulnerable/client
sudo npm install

# Run in web-app-secure/server
sudo npm install

# Run in web-app-secure/client
sudo npm install
```

## Start the vulnerable web application
```
# Run in web-app-vulnerable/server
npm start

# Run in web-app-vulnerable/client
npm start
```
## Start the secure web application 
```
# Run in web-app-secure/server
npm start

#in web-app-secure/client
npm start
```
To do only the first start: <br/>
- Navigate to https://localhost:3001/ <br/>
- Click advanced
- Click accept the risk and continue
