from flask import Flask, render_template, make_response, url_for, request, jsonify
import json
# import webview
# import sys
# import threading

app = Flask(__name__)


@app.route('/post_data', methods=['GET', 'POST'])
def post_data():
	if request.method == 'POST':
		data = request.data
		data = data.decode("utf-8")
		data = json.loads(data)
		print(data["Nodes"])
		return "render_template('index.html')"


@app.route('/')
def index():
	return render_template('index.html')


def start_server():
	app.run(port=7000, debug=True)


if __name__ == "__main__":
	start_server()
	# t = threading.Thread(target=start_server)
	# t.daemon = True
	# t.start()
	# webview.create_window("A Star", "http://127.0.0.1:7000/")
	# sys.exit()
 