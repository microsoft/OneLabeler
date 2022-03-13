# OneLabeler

OneLabeler is a system for building data labeling tools.
It provides visual programming interface where the developer can compose modules into a data labeling tool.

Its documentation can be found at <https://microsoft.github.io/OneLabeler-doc>.

⚠️OneLabeler is currently under active development and may not be bug-free.

## Build the Tool

Before starting, make sure you have installed [Node.js](https://nodejs.org/).

Build the visual programming interface as a website:

```bash
cd ./client
npm install
npm run build
```

This will generate the interface as website in the `./client/dist` folder.


Build the visual programming interface as a desktop application:

```bash
cd ./client
npm install
npm run build:electron
```

This will generate the interface as an installer named `one-labeler Setup ${version}.exe` in the `./client/dist_electron` folder.

## Resources

- [Introduction](https://microsoft.github.io/OneLabeler-doc/#what-is-onelabeler)
- [Examples](https://microsoft.github.io/OneLabeler-doc/gallery.html)
