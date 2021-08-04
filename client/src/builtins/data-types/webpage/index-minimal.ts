/* eslint-disable */
import Vue from 'vue';

const parseJsonFile = (file) => new Promise((resolve) => {
  const reader = new FileReader();
  reader.onload = (event) => resolve(JSON.parse(event.target.result));
  reader.readAsText(file);
});

export default {
  type: 'Webpage',
  tasks: ['Classification', 'MultiLabelClassification', 'FreeformText'],
  importType: 'File',
  handleImport: async (file, storage) => {
    (await parseJsonFile(file)).forEach((src, i) => (
      storage.upsert({ uuid: String(i), src })
    ));
  },
  handleExport: (dataObjects, labels) => {
    const uuid2idxInLabels: Record<string, number> = {};
    labels.forEach((d, i) => (uuid2idxInLabels[d.uuid] = i));
    return dataObjects.map((d) => {
      const partial = { uuid: d.uuid, src: d.src };
      const idx = uuid2idxInLabels[d.uuid];
      return idx ? { ...labels[idx], ...partial } : partial;
    });
  },
  display: Vue.extend({
    functional: true,
    props: ['dataObject', 'width', 'height'],
    render: (h, { props }) => (
      h('iframe', { attrs: { ...props, src: props.dataObject.src } })
    ),
  }),
};
