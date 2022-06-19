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
- [Repository of Documentation Website](https://github.com/microsoft/OneLabeler-doc)

## Citation

If you use this software, please cite it as follows:

*Yu Zhang, Yun Wang, Haidong Zhang, Bin Zhu, Siming Chen, and Dongmei Zhang. 2022. OneLabeler: A Flexible System for Building Data Labeling Tools. In CHI Conference on Human Factors in Computing Systems (CHI '22). Association for Computing Machinery, New York, NY, USA, Article 93, 1–22. https://doi.org/10.1145/3491102.3517612*
