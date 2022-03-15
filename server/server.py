# Copyright (c) Microsoft Corporation.
# Licensed under the MIT License.

#!/usr/bin/env python
# coding:utf-8

import tornado.ioloop
import tornado.web
from tornado.options import define, options, parse_command_line

from url import url

define('port', default=8005, help='run on th given port', type=int)
define('debug', default=False, help='run in debug mode')

def main():
    parse_command_line()
    app = tornado.web.Application(
        handlers=url,
        debug=options.debug,
    )
    app.listen(options.port)
    print(f'Development server is running at http://127.0.0.1:{options.port}/')
    print('Quit the server with Control-C')
    tornado.ioloop.IOLoop.instance().start()


if __name__ == '__main__':
    main()
