# Setup and development

- [Setup and development](#setup-and-development)
  - [First-time setup](#first-time-setup)
  - [Installation](#installation)
    - [Compiles and hot-reloads for development](#compiles-and-hot-reloads-for-development)
    - [Compiles and minifies for production](#compiles-and-minifies-for-production)
    - [Run unit tests](#run-unit-tests)
    - [Run end-to-end tests](#run-end-to-end-tests)
    - [Lints and fixes files](#lints-and-fixes-files)
    - [Customize configuration](#customize-configuration)

## First-time setup

Make sure you have the following installed:

- [Node](https://nodejs.org/en/) (at least the latest LTS (14.15.3 as of 2020/12/29))
- [NPM](https://www.npmjs.com/get-npm) (at least 6.14.9 (automatically installed when installing Node))
- [Vue CLI](https://cli.vuejs.org/)

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
npm run electron:serve
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

npm run electron:build
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

### Customize configuration

See [Configuration Reference](https://cli.vuejs.org/config/).
