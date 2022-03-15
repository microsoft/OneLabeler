// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import checkNodeIdsUnique from './node-ids-unique';
import checkEdgeVertexIdsExist from './edge-vertex-ids-exist';
import checkOneInitializationNode from './one-initialization-node';
import checkOneExitNode from './one-exit-node';
import checkNodeDegrees from './node-degrees';
import checkNodeReachedByInitialization from './node-reached-by-initialization';
import checkNodeReachesExit from './node-reaches-exit';
import checkNoSelfLoops from './no-self-loops';
import checkHasLabeling from './has-labeling';
import checkModuleInputsInitialized from './module-inputs-initialized';
import checkModuleNoRedundancy from './module-no-redundancy';
import checkModuleImplemented from './module-implemented';
import checkIterativeSampling from './iterative-sampling';
import checkIterativeTraining from './iterative-training';

export default [
  // 1. Basic data structure rules
  // 1.1. All the nodes have unique id
  checkNodeIdsUnique,
  // 1.2. All the edge sources and targets are existing nodes
  checkEdgeVertexIdsExist,

  // 5. The workflow involves labeling
  checkHasLabeling,

  // 2. Ensuring the graph a valid flowchart
  // 2.1. Contains one initialization node
  checkOneInitializationNode,
  // 2.2. Contains one exit node
  checkOneExitNode,

  // 6. All the nodes are implemented
  checkModuleImplemented,

  // 2.3. Indegree and outdegree requirements
  checkNodeDegrees,
  // 2.4. All the nodes can be reached from start node
  checkNodeReachedByInitialization,
  // 2.5. All the nodes can reach the exit node
  checkNodeReachesExit,
  // 2.6. No self loops
  checkNoSelfLoops,

  // 3. Modules' inputs are initialized before used
  checkModuleInputsInitialized,

  // 4. Modules are not redundant
  checkModuleNoRedundancy,

  // 7. It is recommended to have a data object selection module
  // in a loop.
  checkIterativeSampling,

  // 8. Models are recommended to be iteratively updated
  // when used in loops.
  checkIterativeTraining,
];
