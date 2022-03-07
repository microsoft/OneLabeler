# Setup and development

- [Setup and development](#setup-and-development)
  - [First-time setup](#first-time-setup)
    - [Notes](#notes)
  - [Installation](#installation)
    - [Launches the backend for development](#launches-the-backend-for-development)
    - [Run unit tests](#run-unit-tests)
    - [Lints files](#lints-files)
    - [Install a new dependency](#install-a-new-dependency)

## First-time setup

Make sure you have the following installed:

- [Python 3.9](https://www.python.org/downloads/)
- [pipenv](https://github.com/pypa/pipenv)
  - for package management

### Notes

- why require Python 3.9
  - cv2 package supports Python version <= 3.9 as of 2021/09/27 ([reference](https://github.com/opencv/opencv-python#supported-python-versions))
  - tensorflow supports Python version <= 3.9, as of 2021/09/27 ([reference](https://www.tensorflow.org/install/pip))

## Installation

Note that OpenCV needs to be installed separately at <https://github.com/opencv/opencv/releases>.

```bash
# Enter the directory for the backend
cd .\server\

# Install dependencies declared in Pipfile by pipenv
pipenv install --dev
```

### Launches the backend for development

```bash
cd .\server\

# Launch the virtual environment
# (as the dependencies are stored in the virtual environment by pipenv on installation)
pipenv shell

# Launch the backend server
python server.py
```

### Run unit tests

```bash
cd .\server\

# Launch the virtual environment
pipenv shell

pytest ...
```

### Lints files

```bash
cd .\server\

# Launch the virtual environment
pipenv shell

pylint .\handlers\
```

### Install a new dependency

Install a deployment dependency:

```bash
cd .\server\

pipenv install packagename
```

Install a development dependency:

```bash
cd .\server\

pipenv install packagename --dev
```
