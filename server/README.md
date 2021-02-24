# Server

server for vue-tornado-project

## Development

Run the server:

```
python .\server.py
```

## Deployment

### Back End

- method 1: Microsoft Azure server
    1. create a virtual machine on Microsoft Azure
        - select a Windows server
    2. distribution
        - copy the back end of the system to the virtual machine
    3. install packages
        - install all the required package for the back end
    4. modify firewall setting on the server
        - in the firewall setting in the control panel, add the rule that open the port the server is working at
    5. modify network security setting in Azure
        - in the azure control panel, in the setting of the virtual machine, select network, in the import rules, add permission to the 80 port
    6. start the server

## Document Generation

1. goto \docs directory
2. run '.\make html'

## Files

- ".pylintrc": parameter settings for pylint
