# Architecture

- [Architecture](#architecture)
  - [`.vscode`](#vscode)
  - [`client`](#client)
    - [`nginx`](#nginx)
    - [`public`](#public)
    - [`src`](#src)
      - [`commons`](#commons)
      - [`components`](#components)
    - [`plugins`](#plugins)
      - [`services`](#services)
      - [`store`](#store)
      - [`style`](#style)
    - [`tests`](#tests)
      - [`e2e`](#e2e)
      - [`unit`](#unit)
  - [`db`](#db)
  - [`docs`](#docs)
  - [`server`](#server)
    - [`handlers`](#handlers)

The architecture is inspired by [vue-enterprise-boilerplate](https://github.com/chrisvfritz/vue-enterprise-boilerplate)

## `.vscode`

Development settings and extensions specific to this project, for Visual Studio Code.

## `client`

The frontend of the system.

### `nginx`

The nginx server for serving the client at deployment.

### `public`

The frontend static assets.

### `src`

The frontend source files.

#### `commons`

The frontend shared utility functions and global constants.

#### `components`

The components of the frontend interface.

### `plugins`

The manually managed libraries.

#### `services`

The APIs for frontend-backend communication.

#### `store`

The global state management.

#### `style`

The frontend global styling.

### `tests`

The tests.

#### `e2e`

The end to end tests.

#### `unit`

The unit tests.

## `db`

The database resource server of the system.

## `docs`

The documentation for the project.

## `server`

The algorithm server of the system.

### `handlers`

The HTTP request handlers.
