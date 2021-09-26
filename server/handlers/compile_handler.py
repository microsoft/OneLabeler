import json
import subprocess

import dotenv
import tornado.web

class CompileHandler(tornado.web.RequestHandler):
    """
    The handler for image labeling.
    """

    def post(self):
        self.set_header('Access-Control-Allow-Origin', '*')
        json_data = json.loads(self.request.body)
        workflow = json_data['workflow']
        
        client_codebase_path = '../client'
        
        env_file = dotenv.find_dotenv(f'{client_codebase_path}/.env')
        
        old_title = dotenv.get_key(env_file, 'VUE_APP_TITLE')
        old_default_workflow = dotenv.get_key(env_file, 'VUE_APP_DEFAULT_WORKFLOW')
        old_user_type = dotenv.get_key(env_file, 'VUE_APP_USER_TYPE')
        
        dotenv.set_key(env_file, 'VUE_APP_TITLE', 'MyLabeler')
        dotenv.set_key(env_file, 'VUE_APP_DEFAULT_WORKFLOW', json.dumps(workflow))
        dotenv.set_key(env_file, 'VUE_APP_USER_TYPE', 'ANNOTATOR')

        try:
            subprocess.check_call('npm run electron:build', shell=True, cwd=client_codebase_path)
        except:
            print('compile failed')

        dotenv.set_key(env_file, 'VUE_APP_TITLE', old_title)
        dotenv.set_key(env_file, 'VUE_APP_DEFAULT_WORKFLOW', old_default_workflow)
        dotenv.set_key(env_file, 'VUE_APP_USER_TYPE', old_user_type)

        path = f'{client_codebase_path}/dist_electron/one-labeler Setup 0.1.0.exe'

        with open(path, 'rb') as f:
            self.write(f.read())
