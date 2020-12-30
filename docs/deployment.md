# Deployment

## Run Production Frontend

1. npm run build
2. run 'python -m http.server 8080' in the root of the ./dist folder
3. launch the server

## Deploy Frontend

- method 1: github gh-pages
    1. compilation
        - compile the distribution version of the front end
    2. distribution
        - store the distribution version of the front end files at the gh-pages branch with index exposed at the root of the file structure

- method 2: IIS service on a Microsoft Azure server
    1. create a virtual machine on Microsoft Azure
        - select a Windows server
    2. compilation
        - compile the distribution version of the front end
    3. distribution
        - copy the distribution version of the front end files to the virtual machine
    4. start IIS service
        - in the server manager panel of the virtual machine, add role to the server, and select Web Server (IIS)
    5. register website in the IIS service
        - in the IIS manager panel, in the website list, add the website to be deployed, let it work on the 80 port
    6. modify network security setting in Azure
        - in the Azure control panel, in the setting of the virtual machine, select network, in the in port rules, add permission to the 80 port
