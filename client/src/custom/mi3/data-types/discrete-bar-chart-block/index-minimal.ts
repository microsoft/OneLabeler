/* eslint-disable */
import Vue from 'vue';
import axios from 'axios';

const getBase64 = (file) => new Promise((resolve) => {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = () => resolve(reader.result);
});
const URL = 'http://localhost:8005/imgproc/discreteBarChart/candidateBlocks';
const preprocess = (img) => axios.post(URL, JSON.stringify({ img }));

export default {
  type: 'MI3-block',
  tasks: ['Classification'],
  importType: 'File',
  handleImport: async (file, storage) => {
    const img = await getBase64(file);
    const dataObjects = (await preprocess(img))
      .data.blocks.map((d) => ({ ...d, src: img }));
    storage.upsertBulk(dataObjects);
  },
  display: Vue.extend({
    functional: true,
    props: ['dataObject'],
    // TODO: transform the svg to move the polygon to center;
    render: (h, { props }) => (
      h('div', {}, [
        h(
          'svg',
          { attrs: { width: 0, height: 0 }, style: { width: '100%', height: '100%' } },
          [
            h('image', { attrs: { href: props.dataObject.src } }),
            h('polygon', { attrs: { points: props.dataObject.contour
              .map((d) => d[0].map((x) => x + 0.5).join(',')).join(' ') } }),
          ],
        )
      ])
    ),
  }),
};
