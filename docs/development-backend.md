# Setup and development

- [Setup and development](#setup-and-development)
  - [First-time setup](#first-time-setup)
  - [Installation](#installation)
    - [Launches the backend for development](#launches-the-backend-for-development)
    - [Run unit tests](#run-unit-tests)
    - [Lints files](#lints-files)

## First-time setup

Make sure you have the following installed:

- [Python 3.6](https://www.python.org/downloads/)

## Installation

```bash
# Enter the directory for the backend
cd .\server\

# Install dependencies from requirements file requirements.txt
pip install -r requirements.txt
```

### Launches the backend for development

```bash
cd .\server\

# Launch the backend server
python server.py
```

### Run unit tests

```bash
cd .\server\

pytest ...
```

### Lints files

Linting:

```bash
cd .\server\

pylint .\handlers\
```
