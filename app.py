from flask import Flask, render_template, jsonify

app = Flask(__name__, template_folder='./')
app.config["DEBUG"] = True
from flask_socketio import SocketIO
app = Flask(__name__)
socketio = SocketIO(app)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/update-fraetimes', methods=['POST'])
def update_frame_times():
    # 处理更新帧时间的逻辑
    return jsonify(success=True)

@socketio.on('connect_event')
def connected_msg():
    socketio.emit('refresh')
   


if __name__ == '__main__':
    socketio.run(app, debug=True)