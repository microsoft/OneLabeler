import json
import nltk
import tornado.httpserver
import tornado.ioloop
import tornado.options
import tornado.web
import uuid
from typing import List

def predict(data_object: dict) -> List[dict]:
    """ Create default spans by detecting nouns. """
    sentence = data_object['content']
    pos_tag = nltk.pos_tag(sentence.split())
    start = 0
    end = 0
    spans = []
    for i, (segment, tag) in enumerate(pos_tag):
        start = end + 1 if i != 0 else end
        end = start + len(segment)
        # filter tags that are not nouns
        if tag not in ['NN', 'NNP', 'NNS']:
            continue
        spans.append({
            'text': segment,
            'start': start,
            'end': end,
            'category': 'subject',
            'uuid': str(uuid.uuid4()),
        })
    return spans

class DefaultLabelingHandler(tornado.web.RequestHandler):
    def post(self):
        self.set_header('Access-Control-Allow-Origin', '*')
        data_objects = json.loads(self.request.body)['dataObjects']
        labels = [{ 'spans': predict(d) } for d in data_objects]
        self.write({ 'labels': labels })

def main():
    tornado.options.parse_command_line()
    http_server = tornado.httpserver.HTTPServer(tornado.web.Application(
        handlers=[(r'/defaultLabels', DefaultLabelingHandler)],
        debug=True,
    ))
    http_server.listen(8007)
    print('Custom default labeling service is running at http://localhost:8007/defaultLabels')
    tornado.ioloop.IOLoop.instance().start()


if __name__ == "__main__":
    main()
