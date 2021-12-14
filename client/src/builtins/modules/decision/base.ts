import { ModuleType } from '@/commons/types';
import type { IModule } from '@/commons/types';

export default {
  inputs: ['stop'],
  outputs: [],
  id: 'BaseConditionalBranching',
  label: 'Base Conditional Branching',
  type: ModuleType.Decision,
  isBuiltIn: true,
  isServerless: true,
  params: {
    criteria: {
      value: 'stop == true ?',
      label: 'Branching Criteria',
      options: [{
        label: 'stop == true ?',
        value: 'stop == true ?',
      }],
    },
  },
  run: (inputs: { stop: boolean }): boolean => inputs.stop,
} as IModule;
