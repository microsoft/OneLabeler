# Copyright (c) Microsoft Corporation.
# Licensed under the MIT License.

import json

import socketio
import tornado.ioloop
from tornado.options import define, options, parse_command_line
import tornado.web


define('port', default=5000, help='run on th given port', type=int)
define('debug', default=False, help='run in debug mode')

sio = socketio.AsyncServer(async_mode='tornado',
                           cors_allowed_origins='http://localhost:8080')

client_sids = []


@sio.event(namespace='/client')
async def connect(sid, environ, auth):
    global client_sids
    client_sids = [*client_sids, sid]
    print(f'connected auth={auth} sid={sid}')
    print(f'all connected clients:', client_sids)


@sio.event(namespace='/client')
def disconnect(sid):
    global client_sids
    client_sids.remove(sid)
    print(f'disconnected sid={sid}')
    print(f'remaining connected clients:', client_sids)

@sio.event(namespace='/client')
def roundtrip(sid):
    pass

class JupyterHandler(tornado.web.RequestHandler):
    """
    The handler for handling request from jupyter notebook.
    """

    async def get(self, key: str):
        self.set_header('Access-Control-Allow-Origin', '*')

        if key not in ['dataObjects', 'labels']:
            # The service is not found.
            self.send_error(404)
            return

        if key == 'dataObjects':
            if len(client_sids) == 0:
                self.write({'data': None, 'message': 'NO_CLIENT'})
                return
            if len(client_sids) >= 2:
                self.write({'data': None, 'message': 'MULTIPLE_CLIENTS'})
                return

            client_sid = client_sids[0]
            data = await sio.call('jupyter:getDataObjects',
                                  to=client_sid, namespace='/client')
            self.write({'data': data, 'message': 'SUCCESS'})

        if key == 'labels':
            if len(client_sids) == 0:
                self.write({'data': None, 'message': 'NO_CLIENT'})
                return
            if len(client_sids) >= 2:
                self.write({'data': None, 'message': 'MULTIPLE_CLIENTS'})
                return

            client_sid = client_sids[0]
            data = await sio.call('jupyter:getLabels',
                                  to=client_sid, namespace='/client')
            self.write({'data': data, 'message': 'SUCCESS'})

    async def put(self, key: str):
        self.set_header('Access-Control-Allow-Origin', '*')

        if key not in ['dataObjects', 'labels']:
            # The service is not found.
            self.send_error(404)
            return

        if key == 'dataObjects':
            data = json.loads(self.request.body)
            await sio.emit('jupyter:setDataObjects', data, namespace='/client')

        if key == 'labels':
            data = json.loads(self.request.body)
            await sio.emit('jupyter:setLabels', data, namespace='/client')

    async def post(self, key: str):
        self.set_header('Access-Control-Allow-Origin', '*')

        if key not in ['startNewProject']:
            # The service is not found.
            self.send_error(404)
            return

        if key == 'startNewProject':
            data = json.loads(self.request.body)
            await sio.emit('jupyter:startNewProject', data, namespace='/client')


def main():
    parse_command_line()
    app = tornado.web.Application(
        handlers=[
            (r'/socket.io/', socketio.get_tornado_handler(sio)),
            (r'/jupyter/(.*)', JupyterHandler),
        ],
        debug=options.debug,
    )
    app.listen(options.port)
    print(f'Development server is running at http://127.0.0.1:{options.port}/')
    print('Quit the server with Control-C')
    tornado.ioloop.IOLoop.current().start()


if __name__ == "__main__":
    main()
