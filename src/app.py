from flask import Flask, render_template, make_response, url_for, request, jsonify
import json
import os
from Astar import *
import os, webview, threading

app = Flask(__name__)


@app.context_processor
def override_url_for():
	return dict(url_for=dated_url_for)


def dated_url_for(endpoint, **values):
	if endpoint == 'static':
		filename = values.get('filename', None)
		if filename:
			file_path = os.path.join(app.root_path, endpoint, filename)
			values['q'] = int(os.stat(file_path).st_mtime)
	return url_for(endpoint, **values)


@app.route('/post_data', methods=['GET', 'POST'])
def post_data():
	if request.method == 'POST':
		data = request.data
		data = data.decode("utf-8")
		data = json.loads(data)
		# Start the function
		init_astar(data)
		start_node, end_node = get_start_end(data)
		shortest_path, cost = astar(start_node, end_node)
		json_result = {
			'path' : shortest_path,
			'cost' : cost
		}
		return jsonify(json_result)
	else:
		return "No post method!"


@app.route('/')
def index():
	return render_template('index.html')


def start_server():
	app.run(port=7000, debug=True)


if __name__ == "__main__":
	start_server()
