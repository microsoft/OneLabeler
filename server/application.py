import os

import tornado.web

from url import url

setting = dict(
    static_path=os.path.join(os.path.dirname(__file__), "../"),
    template_path=os.path.join(os.path.dirname(__file__), "../front")
)

application = tornado.web.Application(
    handlers=url,
    debug=True,
    **setting
)
