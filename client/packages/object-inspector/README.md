# object-inspector

Vue component used as an js/json object inspector/viewer.
This package is based on [vue-object-inspector](https://github.com/vikyd/vue-object-inspector) and rewritten to build in typescript support.

> Nodes will not be rendered if parent is collapsed.

## Usage

In Vue component:

```vue
<template>
  <div>
    <VObjectInspector :data="data" />
  </div>
</template>

<script>
import VObjectInspector from 'object-inspector'

export default {
  name: 'your-component',
  components: {
    VObjectInspector,
  },
  data() {
    return {
      data: {
        a: 1,
        b: 'abc',
        c: [1, 2, 3],
        d: { x1: 1, x2: 2 },
      },
    }
  },
}
</script>
```

## Vue `props`

### `data`

- what: JavaScript variable to inspect
- type: Any
- required: true

### `name`

- what: root variables prefix name
- type: String | null
- required: false
- default: null

### `expandLevel`

- what: an integer specifying to which level the tree should be initially expanded
- type: Integer
- required: false
- default: `0`

### `expandPaths`

- what: an array containing all the paths that should be expanded when the component is initialized
- type: String[]
- mandatory: false
- details: syntax like [JSONPath](https://goessner.net/articles/JsonPath/)
- default: `[]`
- examples:
  - `['$']`: expand root node, `$` always refers to the root node
  - `['$.myKey']`: expand to `myKey` node (will also expand all parent nodes)
    - this is different from [react-inspector](https://github.com/storybookjs/react-inspector)
  - `['$.myKey.myArr']`: expand to `myArr` node (will also expand all parent nodes)
  - `['$.a', '$.b']`: expand first level nodes `a` and `b`
  - `['$.1']`: expand by array index
  - `['$.*']`: wildcard, expand all level 2 nodes, equivalent to `:expandLevel="2"`
  - `['$.*.*']`: wildcard, expand all level 3 nodes, equivalent to `:expandLevel="3"`

### `expandPaths` vs `expandPaths`

Both are reactive.

In most case, don't use both at the same time.

One of them changes, only the changed one will take effect and ignore the other one.

If want to expand all level, change `expandLevel` to a very big number.

If want to collapse all level, change `expandLevel` to 0.

If already change expand by hand, change the `expandLevel` to a negative number, then change it back in `$nextTick`.

### `showNonEnumerable`

- what: show non-enumerable properties, like `__proto__`, `length`, `constructor` ...
- type: Boolean
- mandatory: false
- default: `false`

### `sortObjectKeys`

- what: sort object keys like [Array.sort()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort)
- type: Boolean | Function
- mandatory: false
- default: no sort
- examples:
  - `true`: keys of objects are sorted in alphabetical order except for arrays
  - function in Vue component methods:
    ```js
    reverseSortFunc(a, b) {
      return b > a ? 1 : -1
    }
    ```

### `objectMaxProperties`

- what: max count object properties should be list in preview label
- type: Integer
- mandatory: false
- default: `5`

### `arrayMaxProperties`

- what: max count array properties should be list in preview label
- type: Integer
- mandatory: false
- default: `10`

### `darkTheme`

- what: use light or dark theme
- type: Boolean
- mandatory: false
- default: `false`

## Development

```sh
# Install dependencies
npm install

# Compiles and hot-reloads for development
npm run serve

# Compiles and minifies for production
npm run build
```

## Storybook Preview

After `npm install`, you can also run this command to see lots of live examples.

```sh
npm run storybook
```

See `stories` folder for source code of examples.

## Thanks

- [vue-object-inspector](https://github.com/vikyd/vue-object-inspector)
- [react-inspector](https://github.com/storybookjs/react-inspector)
