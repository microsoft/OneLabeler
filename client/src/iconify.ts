import { addCollection } from '@iconify/vue2';

const init = (): void => {
  addCollection({
    prefix: 'mdi',
    icons: {
      'dock-window': {
        body: '<path d="M18 18v2H4a2 2 0 0 1-2-2V8h2v10M22 6v8a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2m-2 0H8v8h12z" fill="currentColor"/>',
      },
      'dock-left': {
        body: '<path d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2m0 14H9V6h11z" fill="currentColor"/>',
      },
      'dock-bottom': {
        body: '<path d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2m0 9H4V6h16z" fill="currentColor"/>',
      },
      'dock-right': {
        body: '<path d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2m-5 14H4V6h11z" fill="currentColor"/>',
      },
      'application-variable': {
        body: '<path d="M21 2H3c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2M7.4 20C5.9 18.6 5 16.6 5 14.5s.9-4.1 2.4-5.5l1.6.6c-1.3 1.1-2 3-2 4.9s.7 3.7 2 4.9l-1.6.6m5.3-2l-.8-2l-1.4 2H9l2.3-3.1L10 12h1.3l.8 2l1.4-2H15l-2.2 3l1.3 3h-1.4m3.9 2l-1.6-.6c1.3-1.2 2-3 2-4.9s-.7-3.7-2-4.9l1.6-.6c1.5 1.4 2.4 3.4 2.4 5.5s-.9 4.1-2.4 5.5M21 7H3V4h18v3z" fill="currentColor"/>',
      },
    },
    width: 24,
    height: 24,
  });
};

export default init;
