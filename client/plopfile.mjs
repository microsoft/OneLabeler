export default (plop) => {
  plop.load('plop-pack-remove');
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
};
