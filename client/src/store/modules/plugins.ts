// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import type { Store } from 'vuex';
import type { WorkflowNode } from '@/commons/types';
import { updatedTaskWindowsByNodes } from './actions';
import type { IState as IRootState } from './state';
import type { IState as IWorkflowState } from './workflow/state';
import * as types from './mutation-types';
import * as workflowTypes from './workflow/mutation-types';

type IState = IRootState & { workflow: IWorkflowState };

const plugin = (store: Store<IState>): void => {
  store.subscribe(async (mutation, state: IState) => {
    if (mutation.type === types.SET_DATA_OBJECTS) {
      const { dataObjects } = state;
      if (dataObjects !== null) {
        const THRESHOLD = 2000;
        const nDataObjects = await dataObjects.count();
        if (nDataObjects >= THRESHOLD) {
          const collection = await dataObjects.slice(undefined, THRESHOLD);
          const uuids = collection.map((d) => d.uuid);
          store.commit(types.SET_SCOPE_UUIDS, uuids);
        } else {
          store.commit(types.SET_SCOPE_UUIDS, null);
        }
      }
    }
    if (mutation.type === `workflow/${workflowTypes.SET_NODES}`) {
      // Setting the nodes may change the label tasks
      // and thus changing the default labels.
      const { labels } = state;
      if (labels !== null) {
        store.commit(types.SET_LABELS, labels.shallowCopy());
      }
    }
    if (mutation.type === `workflow/${workflowTypes.SET_NODES}`) {
      const nodes = state.workflow.nodes as WorkflowNode[];
      updatedTaskWindowsByNodes(store, nodes);
    }
  });
};

const plugins = [plugin];

export default plugins;
