# README

This folder contains the template of a data type implementation, including

1. **index.ts**: the entry point of the data type implementation
2. **BaseDisplay.vue**: the Vue component implementing how a single instance of the data object should render in the interface
3. **BaseDisplay.stories.ts**: the Storybook declaration for running BaseDisplay.vue in isolation

If you want to customize how the data objects are imported/exported, edit *handleImport*/*handleExport* in **index.ts**.<br>
If you want to customize how a data object should be displayed imported/exported, edit **BaseDisplay.vue**.
