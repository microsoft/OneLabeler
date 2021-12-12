export default (plop) => {
  plop.setGenerator('data type', {
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
        pattern: /] as/gi,
        template: '  {{camelCase name}},\n] as',
      },
    ],
  });
  plop.setGenerator('label task type', {
    description: 'label task type',
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
        pattern: /] as/gi,
        template: '  {{camelCase name}},\n] as',
      },
    ],
  });
  plop.setGenerator('workflow template', {
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
        path: 'src/builtins/workflow-templates/templates/{{name}}.ts',
        templateFile: 'src/cli-templates/workflow-template/base.ts',
      },
      // Import the template.
      {
        type: 'modify',
        path: 'src/builtins/workflow-templates/index.ts',
        pattern: 'export default [',
        template: "import {{camelCase name}} from './templates/{{name}}';\n\nexport default [",
      },
      // Export the template.
      {
        type: 'modify',
        path: 'src/builtins/workflow-templates/index.ts',
        pattern: /];/gi,
        template: '  {{camelCase name}},\n];',
      },
    ],
  });
};
