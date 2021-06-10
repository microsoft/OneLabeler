# Setup and development

- [Setup and development](#setup-and-development)
  - [First-time setup](#first-time-setup)
    - [Notes](#notes)
  - [Installation](#installation)
    - [Launches the backend for development](#launches-the-backend-for-development)
    - [Run unit tests](#run-unit-tests)
    - [Lints files](#lints-files)

## First-time setup

Make sure you have the following installed:

- [Python 3.7](https://www.python.org/downloads/)

### Notes

- cv2 package doesn't exist on Python version >= 3.8, as of 2020/03/17, thus needs to use python version <= 3.7
- tensorflow package doesn't exist on Python version >= 3.9, as of 2020/03/17, thus needs to use python version <= 3.7

## Installation

Note that OpenCV needs to be installed separately at https://github.com/opencv/opencv/releases.

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
