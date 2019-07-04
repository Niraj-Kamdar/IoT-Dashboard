# -*- coding: utf-8 -*-
"""
Created on Thu Mar 28 21:59:54 2019

@author: niraj kamdar
"""
# sid INT
# sid INT
# sid INT
# sid INT

import sqlite3
import time
import datetime
import paho.mqtt.client as mqtt
import json
import myapp
import threading
from sys import getsizeof as size


def packet_bytes(c, u, m):
    print(size(c) + size(u) + size(m))
    return size(c) + size(u) + size(m)


def mpu_data_entry(s, d):
    unix = int(time.time())
    date = datetime.datetime.fromtimestamp(unix)
    date = str(date.strftime('%Y-%m-%d %H:%M:%S'))
    x = d['x']
    y = d['y']
    z = d['z']
    cname = d['client']
    # print(x, y, z)
    with sqlite3.connect("mydata.db") as conn:
        c = conn.cursor()
        if s == "Accelerometer":
            db = "INSERT INTO accelData (id, datestamp, client, x, y, z)\
                  VALUES (?, ?, ?, ?, ?, ?)"
            c.execute("SELECT MAX(id) FROM accelData WHERE client=?", (cname,))
            t = c.fetchone()
            if t[0]:
                n = t[0] + 1
                c.execute(db, (n, date, cname, x, y, z))
            else:
                c.execute(db, (1, date, cname, x, y, z))
            conn.commit()
        elif s == "Gyroscope":
            db = "INSERT INTO gyroData (id, datestamp, client, x, y, z)\
                  VALUES (?, ?, ?, ?, ?, ?)"
            c.execute("SELECT MAX(id) FROM gyroData WHERE client=?", (cname,))
            t = c.fetchone()
            if t[0]:
                n = t[0] + 1
                c.execute(db, (n, date, cname, x, y, z))
            else:
                c.execute(db, (1, date, cname, x, y, z))
            conn.commit()
    return


def temp_data_entry(temp):
    unix = int(time.time())
    date = datetime.datetime.fromtimestamp(unix)
    date = str(date.strftime('%Y-%m-%d %H:%M:%S'))
    db = "INSERT INTO tempData (id, datestamp, client, temperature)\
          VALUES (?, ?, ?, ?)"
    with sqlite3.connect("mydata.db") as conn:
        c = conn.cursor()
        c.execute("SELECT MAX(id) FROM tempData WHERE client=?",
                  (temp["client"],))
        t = c.fetchone()
        if t[0]:
            n = t[0] + 1
            c.execute(db, (n, date, temp["client"], temp["temperature"]))
        else:
            c.execute(db, (1, date, temp["client"], temp["temperature"]))
        conn.commit()
    # print("hi")
    return


def on_connect(client, userdata, flags, rc):
    print("Connected with result code "+str(rc))

    client.subscribe("Project/#")


def on_message(client, userdata, msg):
    data = msg.payload.decode()
    data = json.loads(data)
    data['byte'] = packet_bytes(client, userdata, msg)
    # print(msg.topic + " = " + data)
    print(data)
    if(msg.topic == "Project/ad"):
        # data = json.loads(data)
        username = data['client']
        mpu_data_entry("Accelerometer", data)
        data["sensor"] = "Accelerometer"
        myapp.send_graph_data(data)
        data = json.dumps(data)
        myapp.send_sensor_data(data, username)
    elif(msg.topic == "Project/gd"):
        # data = json.loads(data)
        username = data['client']
        mpu_data_entry("Gyroscope", data)
        data["sensor"] = "Gyroscope"
        myapp.send_graph_data(data)
        data = json.dumps(data)
        myapp.send_sensor_data(data, username)
    elif(msg.topic == "Project/temp"):
        # data = json.loads(data)
        username = data['client']
        # print(data)
        try:
            temp_data_entry(data)
        except Exception as e:
            print(e)
        data["sensor"] = "Temperature"
        myapp.send_graph_data(data)
        data = json.dumps(data)
        myapp.send_sensor_data(data, username)


def run_web_app():
    myapp.socketio.run(myapp.app)


if __name__ == "__main__":

    # following is for data logging in mydata.db
    conn = sqlite3.connect("mydata.db")
    c = conn.cursor()

    c.execute("CREATE TABLE IF NOT EXISTS accelData(id INT,\
               datestamp TEXT, client TEXT, x REAL, y REAL, z REAL)")

    c.execute("CREATE TABLE IF NOT EXISTS gyroData(id INT,\
               datestamp TEXT, client TEXT, x REAL, y REAL, z REAL)")

    c.execute("CREATE TABLE IF NOT EXISTS tempData(id INT,\
               datestamp TEXT, client TEXT, temperature REAL)")

    c.execute("CREATE TABLE IF NOT EXISTS switchData(id INT,\
               datestamp TEXT, client TEXT, switch TEXT, gpio INT, state INT)")

    conn.commit()
    c.close()
    conn.close()

    # following is for switch management of different client in client.db
    conn = sqlite3.connect("client.db")
    c = conn.cursor()
    for client in myapp.clients:
        creation = ("CREATE TABLE IF NOT EXISTS " +
                    "{0}(switch TEXT, gpio INT, state TEXT)".format(client))
        c.execute(creation)
    conn.commit()
    c.close()
    conn.close()

    webapp_thread = threading.Thread(target=run_web_app)
    webapp_thread.start()

    while not myapp.connected:
        print("waiting for client to connect")
        time.sleep(1)

    print("Connected...")
    time.sleep(3)

    client = mqtt.Client()
    client.username_pw_set("alpha", "flash")
    client.on_connect = on_connect
    client.on_message = on_message

    client.connect("piserver.local", port=1883)
    client.loop_start()
