import sqlite3
from flask import Flask, render_template, jsonify, request, json
from flask_socketio import SocketIO, send, emit, join_room
import paho.mqtt.publish as publish
import time
import datetime
import pygal
from random import random
# import json
# import eventlet
# eventlet.monkey_patch()

app = Flask(__name__)
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0
app.config['SECRET_KEY'] = 'Brainiac'
app.jinja_env.auto_reload = True
app.config['TEMPLATES_AUTO_RELOAD'] = True
socketio = SocketIO(app, ping_timeout=600)
connected = False
clients = ["raspberrypi", "client1", "client2", "client3"]


@socketio.on("connect")
def connection():
    global connected
    connected = True
    print("Client has been connected.")
    print(request.sid)
    # with open("clients.json", 'r') as f:
    #     clients = json.load(f)
    socketio.emit('data', json.dumps(clients), room=request.sid)
    print("hi")


@socketio.on('username')
def receive_username(username):
    join_room(username)
    control_data = []
    # send(username + ' has entered the room.', room=username)
    print('user is viewing {}'.format(username))
    with sqlite3.connect("mydata.db") as conn:
        conn.row_factory = sqlite3.Row
        c = conn.cursor()
        sensor_data = {}
        adata = read_db(c, username, "Accelerometer")
        gdata = read_db(c, username, "Gyroscope")
        temp = read_db(c, username, "Temperature")
        sensor_data['Accelerometer'] = adata
        sensor_data['Gyroscope'] = gdata
        sensor_data['Temperature'] = temp
    with sqlite3.connect("client.db") as conn:
        conn.row_factory = sqlite3.Row
        c = conn.cursor()
        c.execute('SELECT switch, gpio, state FROM {}'.format(username))
        for i in c.fetchall():
            control_data.append(dict(i))
    sensor_data['control_data'] = control_data
    data = json.dumps(sensor_data)
    print(data)
    socketio.emit('load', data, room=username)


@socketio.on('onOff')
def action(json_data):
    data = json.loads(json_data)
    username = data['room']
    device = data['device']
    gpio = data['gpio']
    state = data['state']
    del data['room']
    host = "piserver.local"
    topic = "Project/{}".format(username)
    payload = json.dumps(data)
    publish.single(topic, payload, hostname=host,
                   auth={"username": "alpha", "password": "flash"})
    with sqlite3.connect("mydata.db") as conn:
        c = conn.cursor()
        unix = int(time.time())
        date = datetime.datetime.fromtimestamp(unix)
        date = str(date.strftime('%Y-%m-%d %H:%M:%S'))
        db = "INSERT INTO switchData(id, datestamp, client, switch, gpio, state)\
              VALUES (?, ?, ?, ?, ?, ?)"
        c.execute("SELECT MAX(id) FROM switchData WHERE client=?", (username,))
        t = c.fetchone()
        if t[0]:
            n = t[0] + 1
            c.execute(db, (n, date, username, device, gpio, state))
        else:
            c.execute(db, (1, date, username, device, gpio, state))
        conn.commit()

    with sqlite3.connect("client.db") as conn:
        c = conn.cursor()
        update = 'UPDATE {0} SET state =  ? WHERE gpio = ?'.format(username)
        c.execute(update, (state, gpio))
        conn.commit()

    socketio.emit('switching', json_data, room=username)


@socketio.on('addSwitch')
def add_switch(json_data):
    data = json.loads(json_data)
    username = data['room']
    with sqlite3.connect("client.db") as conn:
        c = conn.cursor()
        add = "INSERT INTO {} (switch, gpio, state) VALUES (?, ?, ?)".format(
            username)
        c.execute(add, (data["device"], data["gpio"], False))
        conn.commit()
    socketio.emit('adding', json_data, room=username,
                  broadcast=True, include_self=False)


@socketio.on('delete')
def delete_switch(json_data):
    data = json.loads(json_data)
    print(data)
    username = data['room']
    array = data['entries']
    with sqlite3.connect('client.db') as conn:
        c = conn.cursor()
        for i in array:
            print(username, i)
            delete = "DELETE FROM {0} WHERE switch=?".format(username)
            c.execute(delete, ((i,)))
            conn.commit()
    socketio.emit('deleting', json_data, room=username,
                  broadcast=True, include_self=False)


@socketio.on('getaccel')
def plot_accel():
    graph = pygal.Line()
    graph.title = 'Change in magnitude of Accelerometer data'
    graph.x_labels = list(range(1, 11))
    try:
        with sqlite3.connect("mydata.db") as conn:
            c = conn.cursor()
            for client in clients:
                data = "SELECT MAX(id) FROM accelData WHERE client=?"
                c.execute(data, ((client,)))
                n = c.fetchone()[0]
                data = "SELECT x,y,z FROM accelData WHERE id BETWEEN ? AND ? AND client=?"
                c.execute(data, (n-9, n, client,))
                values = c.fetchall()
                print(values)
                val = []

                def func(x, y, z): return (x**2 + y**2 + z**2)**0.5
                for x, y, z in values:
                    val.append(func(x, y, z))
                graph.add(client,  val)
    except Exception as e:
        print(e)
        return
    graph_data = graph.render_data_uri()
    socketio.emit('sendaccel', graph_data, broadcast=True)


@socketio.on('getgyro')
def plot_gyro():
    graph = pygal.Line()
    graph.title = 'Change in magnitude of Gyroscope data'
    graph.x_labels = list(range(1, 11))
    with sqlite3.connect("mydata.db") as conn:
        c = conn.cursor()
        for client in clients:
            data = "SELECT MAX(id) FROM gyroData WHERE client=?"
            c.execute(data, ((client,)))
            n = c.fetchone()[0]
            data = "SELECT x,y,z FROM gyroData WHERE id BETWEEN ? AND ? AND client=?"
            c.execute(data, (n-9, n, client,))
            values = c.fetchall()
            val = []

            def func(x, y, z): return (x**2 + y**2 + z**2)**0.5
            for x, y, z in values:
                val.append(func(x, y, z))
            print(val)
            graph.add(client,  val)
    graph_data = graph.render_data_uri()
    socketio.emit('sendgyro', graph_data, broadcast=True)


@socketio.on('gettemp')
def plot_temp():
    graph = pygal.Line()
    graph.title = 'Change in magnitude of Temperature data'
    graph.x_labels = list(range(1, 11))
    with sqlite3.connect("mydata.db") as conn:
        c = conn.cursor()
        for client in clients:
            data = "SELECT MAX(id) FROM tempData WHERE client=?"
            c.execute(data, ((client,)))
            n = c.fetchone()[0]
            data = "SELECT temperature FROM tempData WHERE id BETWEEN ? AND ? AND client=?"
            c.execute(data, (n-9, n, client,))
            values = c.fetchall()
            val = []
            for i in values:
                val.append(i[0])
            print(val)
            graph.add(client,  val)
    graph_data = graph.render_data_uri()
    socketio.emit('sendtemp', graph_data, broadcast=True)


def send_sensor_data(data, username):
    print("i am websocket: " + data)
    try:
        socketio.emit("sensorData", data, room=username)
    except Exception as e:
        print(e)


def send_graph_data(data):
    # try:
    if data['sensor'] == "Accelerometer":
        plot_accel()
    elif data['sensor'] == "Gyroscope":
        plot_gyro()
    else:
        plot_temp()
    # except Exception as e:
    #     print(e)


@app.route('/')
def index():
    return render_template("index.html")


def read_db(c, cname, table):
    if table == "Accelerometer":
        c.execute('SELECT MAX(id),x,y,z FROM accelData WHERE client=?',
                  (cname,))
        data = dict(c.fetchone())
        del(data['MAX(id)'])
        return data
    elif table == "Gyroscope":
        c.execute('SELECT MAX(id),x,y,z FROM gyroData WHERE client=?',
                  (cname,))
        data = dict(c.fetchone())
        del(data['MAX(id)'])
        return data
    elif table == "Temperature":
        c.execute('SELECT MAX(id),temperature FROM tempData WHERE client=?',
                  (cname,))
        data = dict(c.fetchone())
        del(data['MAX(id)'])
        return data


if __name__ == '__main__':

    socketio.run(app, debug=True)
