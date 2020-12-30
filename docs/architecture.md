# Architecture

- [Architecture](#architecture)
  - [`.vscode`](#vscode)
  - [`client`](#client)
    - [`plugins`](#plugins)
    - [`public`](#public)
    - [`src`](#src)
      - [`commons`](#commons)
      - [`components`](#components)
      - [`services`](#services)
      - [`store`](#store)
      - [`style`](#style)
  - [`docs`](#docs)
  - [`server`](#server)
    - [`handlers`](#handlers)

The architecture is inspired by [vue-enterprise-boilerplate](https://github.com/chrisvfritz/vue-enterprise-boilerplate)

## `.vscode`

Settings and extensions specific to this project, for Visual Studio Code.

## `client`

The frontend of the system.

### `plugins`

The manually managed libraries.

### `public`

The frontend static assets.

### `src`

The frontend source files.

#### `commons`

The frontend shared utility functions and global constants.

#### `components`

The components of the frontend interface.

#### `services`

The APIs for frontend-backend communication.

#### `store`

The global state management.

#### `style`

The frontend global styling.

## `docs`

The documentation for the project.

## `server`

The backend of the system.

### `handlers`

The HTTP request handlers.
