// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import fs from 'fs';
import path from 'path';

/** Copy all the files from src to dest. */
const copyDir = async (src, dest) => {
  await fs.promises.mkdir(dest, { recursive: true });
  const entries = await fs.promises.readdir(src, { withFileTypes: true });
  await Promise.all(entries.map((entry) => {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    return entry.isDirectory()
      ? copyDir(srcPath, destPath)
      : fs.promises.copyFile(srcPath, destPath);
  }));
};

/** Recursively list all the files in a folder. */
const listFiles = (folderPath) => {
  const entryPaths = fs.readdirSync(folderPath).map((entry) => path.join(folderPath, entry));
  const filePaths = entryPaths.filter((entryPath) => fs.statSync(entryPath).isFile());
  const dirPaths = entryPaths.filter((entryPath) => !filePaths.includes(entryPath));
  const dirFiles = dirPaths.reduce((prev, curr) => prev.concat(listFiles(curr)), []);
  return [...filePaths, ...dirFiles];
};

/** Get the filename with extension name trimmed. */
const trimExt = (filename) => (
  filename.replace(/\.[^/.]+$/, '')
);

/** The commands for copying a data type into the builtins. */
const copyDataTypeCommands = (plop, name, base) => {
  const camelCaseName = plop.getHelper('camelCase')(name);
  return [
    // Copy data type.
    {
      type: 'copyMany',
      dest: `src/builtins/data-types/${name}`,
      src: base,
    },
    // Import the data type.
    {
      type: 'modify',
      path: 'src/builtins/data-types/index.ts',
      pattern: 'export default [',
      template: `import ${camelCaseName} from './${name}';\n\nexport default [`,
    },
    // Export the data type.
    {
      type: 'modify',
      path: 'src/builtins/data-types/index.ts',
      pattern: /] as/,
      template: `  ${camelCaseName},\n] as`,
    },
  ];
};

/** The commands for copying a label task type into the builtins. */
const copyLabelTaskTypeCommands = (plop, name, base) => {
  const camelCaseName = plop.getHelper('camelCase')(name);
  return [
    // Copy label task type.
    {
      type: 'copyMany',
      dest: `src/builtins/label-task-types/${name}`,
      src: base,
    },
    // Import the label task type.
    {
      type: 'modify',
      path: 'src/builtins/label-task-types/index.ts',
      pattern: 'export default [',
      template: `import ${camelCaseName} from './${name}';\n\nexport default [`,
    },
    // Export the label task type.
    {
      type: 'modify',
      path: 'src/builtins/label-task-types/index.ts',
      pattern: /] as/,
      template: `  ${camelCaseName},\n] as`,
    },
  ];
};

/** The commands for copying a module into the builtins. */
const copyModuleCommands = (plop, name, base) => {
  const isDirectory = fs.lstatSync(base).isDirectory();
  const camelCaseName = plop.getHelper('camelCase')(name);

  return [
    // Copy module.
    isDirectory
      ? {
        type: 'copyMany',
        dest: `src/builtins/modules/${name}`,
        src: base,
      }
      : {
        type: 'add',
        destination: `src/builtins/modules/${name}.ts`,
        templateFile: base,
      },
    // Import the module.
    {
      type: 'modify',
      path: 'src/builtins/modules/index.ts',
      pattern: 'export default [',
      template: `import ${camelCaseName} from './${name}';\n\nexport default [`,
    },
    // Export the module.
    {
      type: 'modify',
      path: 'src/builtins/modules/index.ts',
      pattern: /] as/,
      template: `  ${camelCaseName},\n] as`,
    },
  ];
};

/** The commands for copying a workflow template into the builtins. */
const copyWorkflowCommands = (plop, name, base) => {
  const camelCaseName = plop.getHelper('camelCase')(name);
  const kebabCaseName = plop.getHelper('kebabCase')(name);
  return [
    // Copy workflow template.
    {
      type: 'add',
      path: `src/builtins/workflow-templates/templates/${kebabCaseName}.ts`,
      templateFile: base,
    },
    // Import the template.
    {
      type: 'modify',
      path: 'src/builtins/workflow-templates/index.ts',
      pattern: 'export default [',
      template: `import ${camelCaseName} from './templates/${kebabCaseName}';\n\nexport default [`,
    },
    // Export the template.
    {
      type: 'modify',
      path: 'src/builtins/workflow-templates/index.ts',
      pattern: /];/,
      template: `  ${camelCaseName},\n];`,
    },
  ];
};

export default (plop) => {
  plop.load('plop-pack-remove');

  // copyMany is similar to plop's builtin addMany
  // except that copyMany copies trivially.
  plop.setActionType('copyMany', async (answers, config) => {
    const { src, dest } = config;
    await copyDir(src, dest);
    return `Copy files:\n -> ${listFiles(dest).join('\n -> ')}`;
  });

  plop.setWelcomeMessage('what customization do you want?');
  plop.setGenerator('new data type', {
    description: 'customize data type',
    prompts: [{
      type: 'input',
      name: 'name',
      message: 'data type name',
    }],
    actions: [
      // Copy base data type.
      {
        type: 'addMany',
        destination: 'src/builtins/data-types/{{kebabCase name}}',
        base: 'src/cli-templates/data-type/',
        templateFiles: 'src/cli-templates/data-type/**',
      },
      // Insert data type name to index .type.
      {
        type: 'modify',
        path: 'src/builtins/data-types/{{kebabCase name}}/index.ts',
        pattern: /type: '.*'/,
        template: "type: '{{pascalCase name}}'",
      },
      // Insert data type name to index .label.
      {
        type: 'modify',
        path: 'src/builtins/data-types/{{kebabCase name}}/index.ts',
        pattern: /label: '.*'/,
        template: "label: '{{lowerCase name}}'",
      },
      // Insert data type name to stories .title.
      {
        type: 'modify',
        path: 'src/builtins/data-types/{{kebabCase name}}/BaseDisplay.stories.ts',
        pattern: /title: 'DataType\/.*'/,
        template: "title: 'DataType/{{camelCase name}}'",
      },
      // Import the data type.
      {
        type: 'modify',
        path: 'src/builtins/data-types/index.ts',
        pattern: 'export default [',
        template: "import {{camelCase name}} from './{{kebabCase name}}';\n\nexport default [",
      },
      // Export the data type.
      {
        type: 'modify',
        path: 'src/builtins/data-types/index.ts',
        pattern: /] as/,
        template: '  {{camelCase name}},\n] as',
      },
    ],
  });
  plop.setGenerator('new label task type', {
    description: 'customize label task type',
    prompts: [{
      type: 'input',
      name: 'name',
      message: 'label task type name',
    }],
    actions: [
      // Copy base label task type.
      {
        type: 'addMany',
        destination: 'src/builtins/label-task-types/{{kebabCase name}}',
        base: 'src/cli-templates/label-task-type/',
        templateFiles: 'src/cli-templates/label-task-type/**',
      },
      // Import the label task type.
      {
        type: 'modify',
        path: 'src/builtins/label-task-types/index.ts',
        pattern: 'export default [',
        template: "import {{camelCase name}} from './{{kebabCase name}}';\n\nexport default [",
      },
      // Export the label task type.
      {
        type: 'modify',
        path: 'src/builtins/label-task-types/index.ts',
        pattern: /] as/,
        template: '  {{camelCase name}},\n] as',
      },
    ],
  });
  plop.setGenerator('new module', {
    description: 'customize module',
    prompts: [{
      type: 'input',
      name: 'name',
      message: 'module name',
    }, {
      type: 'list',
      name: 'type',
      message: 'module type',
      choices: ['interface', 'algorithm'],
    }],
    actions: [
      // Copy base module.
      {
        type: 'addMany',
        destination: 'src/builtins/modules/{{kebabCase name}}',
        base: 'src/cli-templates/module-{{type}}/',
        templateFiles: 'src/cli-templates/module-{{type}}/**',
      },
      // Import the module.
      {
        type: 'modify',
        path: 'src/builtins/modules/index.ts',
        pattern: 'export default [',
        template: "import {{camelCase name}} from './{{kebabCase name}}';\n\nexport default [",
      },
      // Export the template.
      {
        type: 'modify',
        path: 'src/builtins/modules/index.ts',
        pattern: /] as/,
        template: '  {{camelCase name}},\n] as',
      },
    ],
  });
  plop.setGenerator('new workflow template', {
    description: 'customize workflow template',
    prompts: [{
      type: 'input',
      name: 'name',
      message: 'template name',
    }],
    actions: [
      // Copy base template.
      {
        type: 'add',
        path: 'src/builtins/workflow-templates/templates/{{kebabCase name}}.ts',
        templateFile: 'src/cli-templates/workflow-template/base.ts',
      },
      // Import the template.
      {
        type: 'modify',
        path: 'src/builtins/workflow-templates/index.ts',
        pattern: 'export default [',
        template: "import {{camelCase name}} from './templates/{{kebabCase name}}';\n\nexport default [",
      },
      // Export the template.
      {
        type: 'modify',
        path: 'src/builtins/workflow-templates/index.ts',
        pattern: /];/,
        template: '  {{camelCase name}},\n];',
      },
    ],
  });
  plop.setGenerator('remove data type', {
    description: 'delete existing data type',
    prompts: [{
      type: 'input',
      name: 'name',
      message: 'data type name',
    }],
    actions: (data) => {
      const camelCaseName = plop.getHelper('camelCase')(data.name);
      const kebabCaseName = plop.getHelper('kebabCase')(data.name);

      return [
        // Remove the folder.
        {
          type: 'remove',
          path: 'src/builtins/data-types/{{kebabCase name}}',
        },
        // Remove the import.
        {
          type: 'modify',
          path: 'src/builtins/data-types/index.ts',
          pattern: `import ${camelCaseName} from './${kebabCaseName}';`,
          template: '',
        },
        // Remove the export.
        {
          type: 'modify',
          path: 'src/builtins/data-types/index.ts',
          pattern: `  ${camelCaseName},`,
          template: '',
        },
      ];
    },
  });
  plop.setGenerator('remove label task type', {
    description: 'delete existing label task type',
    prompts: [{
      type: 'input',
      name: 'name',
      message: 'label task type name',
    }],
    actions: (data) => {
      const camelCaseName = plop.getHelper('camelCase')(data.name);
      const kebabCaseName = plop.getHelper('kebabCase')(data.name);

      return [
        // Remove the folder.
        {
          type: 'remove',
          path: 'src/builtins/label-task-types/{{kebabCase name}}',
        },
        // Remove the import.
        {
          type: 'modify',
          path: 'src/builtins/label-task-types/index.ts',
          pattern: `import ${camelCaseName} from './${kebabCaseName}';`,
          template: '',
        },
        // Remove the export.
        {
          type: 'modify',
          path: 'src/builtins/label-task-types/index.ts',
          pattern: `  ${camelCaseName},`,
          template: '',
        },
      ];
    },
  });
  plop.setGenerator('remove module', {
    description: 'delete existing module',
    prompts: [{
      type: 'input',
      name: 'type',
      message: 'module type',
    }, {
      type: 'input',
      name: 'name',
      message: 'module name',
    }],
    actions: (data) => {
      const { type, name } = data;
      const camelCaseName = plop.getHelper('camelCase')(name);

      const dirPath = `src/builtins/modules/${type}/${name}`;
      const isDirectory = fs.existsSync(dirPath)
        && fs.lstatSync(dirPath).isDirectory();

      return [
        // Remove the file.
        isDirectory
          ? { type: 'remove', path: dirPath }
          : { type: 'remove', path: `${dirPath}.ts` },
        // Remove the import.
        {
          type: 'modify',
          path: 'src/builtins/modules/index.ts',
          pattern: `import ${camelCaseName} from './${type}/${name}';`,
          template: '',
        },
        // Remove the export.
        {
          type: 'modify',
          path: 'src/builtins/workflow-templates/index.ts',
          pattern: `  ${camelCaseName},`,
          template: '',
        },
      ];
    },
  });
  plop.setGenerator('remove workflow template', {
    description: 'delete existing workflow template',
    prompts: [{
      type: 'input',
      name: 'name',
      message: 'template name',
    }],
    actions: (data) => {
      const { name } = data;
      const camelCaseName = plop.getHelper('camelCase')(name);
      const kebabCaseName = plop.getHelper('kebabCase')(name);

      return [
        // Remove the file.
        {
          type: 'remove',
          path: 'src/builtins/workflow-templates/templates/{{kebabCase name}}.ts',
        },
        // Remove the import.
        {
          type: 'modify',
          path: 'src/builtins/workflow-templates/index.ts',
          pattern: `import ${camelCaseName} from './templates/${kebabCaseName}';`,
          template: '',
        },
        // Remove the export.
        {
          type: 'modify',
          path: 'src/builtins/workflow-templates/index.ts',
          pattern: `  ${camelCaseName},`,
          template: '',
        },
      ];
    },
  });
  plop.setGenerator('clean', {
    description: 'delete all the built-ins',
    prompts: [],
    actions: () => [
      // Remove the folder.
      {
        type: 'remove',
        path: 'src/builtins/',
      },
      // Copy cleaned folder.
      {
        type: 'addMany',
        destination: 'src/builtins/',
        base: 'src/cli-templates/builtins/',
        templateFiles: 'src/cli-templates/builtins/**',
      },
    ],
  });
  plop.setGenerator('load project', {
    description: 'load modules and templates from a project',
    prompts: [{
      type: 'input',
      name: 'path',
      message: 'project path',
    }],
    actions: (data) => {
      const base = data.path;
      let commands = [];
      const contents = fs.readdirSync(base);

      if (contents.includes('data-types')) {
        const names = fs.readdirSync(`${base}/data-types`);
        names.forEach((name) => {
          commands = [
            ...commands,
            ...copyDataTypeCommands(plop, name, `${base}/data-types/${name}`),
          ];
        });
      }
      if (contents.includes('label-task-types')) {
        const names = fs.readdirSync(`${base}/label-task-types`);
        names.forEach((name) => {
          commands = [
            ...commands,
            ...copyLabelTaskTypeCommands(plop, name, `${base}/label-task-types/${name}`),
          ];
        });
      }
      if (contents.includes('modules')) {
        const names = fs.readdirSync(`${base}/modules`);
        names.forEach((name) => {
          commands = [
            ...commands,
            ...copyModuleCommands(plop, trimExt(name), `${base}/modules/${name}`),
          ];
        });
      }
      if (contents.includes('workflow-templates')) {
        const names = fs.readdirSync(`${base}/workflow-templates`);
        names.forEach((name) => {
          commands = [
            ...commands,
            ...copyWorkflowCommands(
              plop,
              trimExt(name),
              `${base}/workflow-templates/${name}`,
            ),
          ];
        });
      }
      return commands;
    },
  });
};
