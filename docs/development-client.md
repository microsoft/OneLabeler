# Setup and development

- [Setup and development](#setup-and-development)
  - [First-time setup](#first-time-setup)
  - [Installation](#installation)
    - [Compiles and hot-reloads for development](#compiles-and-hot-reloads-for-development)
    - [Compiles and minifies for production](#compiles-and-minifies-for-production)
    - [Run unit tests](#run-unit-tests)
    - [Run end-to-end tests](#run-end-to-end-tests)
    - [Lints and fixes files](#lints-and-fixes-files)
    - [Install a new dependency](#install-a-new-dependency)
    - [Customize configuration](#customize-configuration)
    - [Note](#note)

## First-time setup

Make sure you have the following installed:

- [Node](https://nodejs.org/en/) (at least the latest LTS (14.15.3 as of 2020/12/29))
  - for compilation
- [NPM](https://www.npmjs.com/get-npm) (at least 6.14.9 (automatically installed when installing Node))
  - for package management
- [Vue CLI](https://cli.vuejs.org/)
  - for compilation (otherwise the scripts with "vue-cli-service" cannot run)

## Installation

```bash
# Enter the directory for the frontend
cd .\client\

# Install dependencies from package.json
npm install
```

### Compiles and hot-reloads for development

Run web dev:

```bash
cd .\client\

# Launch the dev server
npm run serve
```

Run desktop dev:

```bash
cd .\client\

# Launch the dev server
npm run serve:electron
```

### Compiles and minifies for production

Build web distribution:

```bash
cd .\client\

npm run build
```

Build desktop distribution:

```bash
cd .\client\

npm run build:electron
```

### Run unit tests

```bash
cd .\client\

npm run test:unit
```

### Run end-to-end tests

```bash
cd .\client\

npm run test:e2e
```

### Lints and fixes files

Linting:

```bash
cd .\client\

npm run lint
```

Automatic code formatting with eslint:

```bash
cd .\client\

eslint --fix "client/src/**/*.{js,vue}"
```

### Install a new dependency

Install a deployment dependency:

```bash
cd .\client\

npm install packagename --save
```

Install a development dependency:

```bash
cd .\client\

npm install packagename --save-dev
```

### Customize configuration

See [Configuration Reference](https://cli.vuejs.org/config/).

### Note

If electron fail to install (e.g., with error message "Failed at the electron@x.y.z postinstall script"), check if there are network issues
