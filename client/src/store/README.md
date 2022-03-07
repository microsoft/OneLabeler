# Implementation Notes

## Vuex

1. mutations should never import getters
2. actions may import getters
3. actions of the root store should not import action of sub modules
    - calling the action would fail because the root store cannot see the mutation types of sub modules
