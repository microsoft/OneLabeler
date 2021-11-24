import { io, Socket } from 'socket.io-client';
import type { Store } from 'vuex';
import type { IState } from '@/store/modules/state';

const SOCKET_SERVER_URL = 'http://localhost:5000';
const NAMESPACE = 'client';

/** The socket for communicating with jupyter notebook API server. */
class JupyterSocket {
  socket: Socket | null;

  constructor() {
    this.socket = null;
  }

  connect(): void {
    if (this.socket !== null) {
      this.socket.connect();
    } else {
      this.socket = io(`${SOCKET_SERVER_URL}/${NAMESPACE}`);
    }
  }

  close(): void {
    if (this.socket === null) return;
    this.socket.close();
  }

  /** Get the round-trip delay between the client and socket server (unit being ms). */
  async getLatency(): Promise<number> {
    const { socket } = this;
    if (socket.disconnected) return Infinity;
    const startTime = Date.now();
    return new Promise((resolve) => {
      socket.emit('roundtrip', () => {
        const latency = Date.now() - startTime;
        resolve(latency);
      });
    });
  }

  bindStore(store: Store<IState>): void {
    const { socket } = this;

    socket.on('jupyter:startNewProject', async (dataObjects) => {
      await store.state.labels.deleteAll();
      await store.state.statuses.deleteAll();
      await store.state.dataObjects.deleteAll();
      await store.state.dataObjects.upsertBulk(dataObjects);
      store.commit('SET_DATA_OBJECTS', store.state.dataObjects.shallowCopy());
      store.commit('SET_LABELS', store.state.labels.shallowCopy());
      store.commit('SET_STATUSES', store.state.statuses.shallowCopy());
      store.commit('SET_QUERY_UUIDS', []);
    });

    socket.on('jupyter:getDataObjects', async (callback) => {
      callback(await store.state.dataObjects?.getAll());
    });

    socket.on('jupyter:setDataObjects', async (newValue) => {
      const { dataObjects } = store.state;
      await dataObjects.deleteAll();
      await dataObjects.upsertBulk(newValue);
      store.commit('SET_DATA_OBJECTS', dataObjects.shallowCopy());
    });

    socket.on('jupyter:getLabels', async (callback) => {
      callback(await store.state.labels?.getAll());
    });

    socket.on('jupyter:setLabels', async (newValue) => {
      const { labels } = store.state;
      await labels.deleteAll();
      await labels.upsertBulk(newValue);
      store.commit('SET_LABELS', labels.shallowCopy());
    });
  }
}

const socket = new JupyterSocket();

export default socket;
