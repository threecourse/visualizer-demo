import json
import os
import tornado.escape
import tornado.ioloop
import tornado.web
from tornado.options import define, options, parse_command_line
from problem.problem import Problem
from problem.solve import Solver

define("port", default=8888, help="run on the given port", type=int)


class RequestHandler(tornado.web.RequestHandler):

    def get(self):
        self.render("index.html")

    def post(self):
        # データの受取
        input = tornado.escape.json_decode(self.request.body)
        seed = int(input["seed"])

        # pythonで作成したデータを渡す
        # データの
        problem = Problem(seed)
        commands, cells_list = Solver().solve(problem)
        cells = json.dumps(problem.cells.tolist())
        commands = json.dumps(commands)
        self.write({"cells": cells, "commands": commands,
                    "sy": problem.start_y, "sx": problem.start_x})


class Application(tornado.web.Application):

    def __init__(self):
        handlers = [
            (r"/", RequestHandler),
        ]

        settings = dict(
            template_path=os.path.join(os.path.dirname(__file__), "templates"),
            static_path=os.path.join(os.path.dirname(__file__), "static"),
            cookie_secret=os.environ.get("SECRET_TOKEN", "__TODO:_GENERATE_YOUR_OWN_RANDOM_VALUE_HERE__"),
            debug=True,
        )

        super(Application, self).__init__(handlers, **settings)


def main():
    parse_command_line()
    app = Application()
    port = int(os.environ.get("PORT", 8888))
    app.listen(port)
    print("Run server on port: {}".format(port))
    tornado.ioloop.IOLoop.current().start()


if __name__ == "__main__":
    main()
