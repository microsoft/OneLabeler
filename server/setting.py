from tornado.options import define

define("port", default=8005, help="run on th given port", type=int)
