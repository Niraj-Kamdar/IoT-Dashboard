let adbtn = document.getElementById("controller");
let form = document.getElementById("form");
let submit = document.querySelector("button[type=submit]");
let accgraphlink = document.getElementById("accgraphlink");
let html = document.getElementById("html");
let gyrographlink = document.getElementById("gyrographlink");
let tempgraphlink = document.getElementById("tempgraphlink");
let homelink = document.getElementById("homelink");
let gpio = document.getElementById("gpio"); //alt + shift +c to comment all console
//alt + shift +d to delete all console and alt + shift +d to uncomment all console
//select element and then alt+ ctrl + l to console that name
let device = document.getElementById("device");
let switches = document.getElementById("switches");
let gpioErrorMsg = document.getElementById("gpioError");
let deviceErrorMsg = document.getElementById("deviceError");
let rmBtn = document.getElementById("rmBtn");
let delBtn = document.getElementById("delBtn");
let selAllBtn = document.getElementById("selAllBtn");
let sensorData = document.getElementById("sensorData");
// let links = document.getElementsByClassName("navlinks");
// let activelink = document.getElementsByClassName("active");
let accelerometer = document.getElementById("acc");
let gyroscope = document.getElementById("gyro");
let temperature = document.getElementById("temp");
let home = document.getElementById("home");
// let clientName = document.getElementById("clientName");
let embedacc = document.getElementById("embedacc");
let embedgyro = document.getElementById("embedgyro");
let embedtemp = document.getElementById("embedtemp");
let onOff = document.getElementsByClassName("onoffswitch-checkbox");
let trSwitch = document.getElementsByClassName("trSwitch");
//let menu = document.getElementById("menu");
let clients = document.getElementById("clients");
let stats = document.getElementById("stats");
let dataDisplay = document.getElementById("dataDisplay");
let packet = document.getElementById("packet");
let bytes = document.getElementById("bytes");
let color = document.getElementById("color");
let chooseColor = document.getElementById("chooseColor");
let cancel = document.getElementById("cancel");
let onOff2 = [];
let gpioEntry = [];
let accx, accy, accz, gyrox, gyroy, gyroz, temp;
let controlColor = 0;
//let entries = {};
const socket = io.connect("http://localhost:5000"); // change address according to server

// let acc = {
//   X : 6,
//   Y : 7,
//   Z : 8
// }
// acc = JSON.stringify(acc);
// let gyro = {
//   X : 5,
//   Y : 4,
//   Z : 3
// }
// gyro = JSON.stringify(gyro);
// let temp = 29;
// let str = {
//   Accelerometer : acc,
//   Gyroscope : gyro,
//   Temperature : temp
// }
// str = JSON.stringify(str);
// //fetch('192.168.137.1:5000/data').then( response=>response.json()).then(data=>renderData(data)).catch(err=>console.log(err));
// str = JSON.parse(str);

function renderData(data) {
  let temp2 = data.temperature.temperature;
  sensorData.innerHTML =
    "" +
    "<tr class='hover bottom2'>" +

    "<td><p class='left'>Accelerometer</p></td>" +
    "<td>" +
    "<table class='subtable data'>" +
    "<tr>" +
    "<td>X</td>" +
    "<td>=</td>" +
    "<td id='acc.x'>" +
    Number(data.acc.x).toFixed(2) +
    "</td>" +
    "</tr>" +
    "<tr>" +
    "<td>Y</td>" +
    "<td>=</td>" +
    "<td id='acc.y'>" +
    Number(data.acc.y).toFixed(2) +
    "</td>" +
    "</tr>" +
    "<tr>" +
    "<td>Z</td>" +
    "<td>=</td>" +
    "<td id='acc.z'>" +
    Number(data.acc.z).toFixed(2) +
    "</td>" +
    "</tr>" +
    "</table>" +
    "</td>" +
    "</tr>" +
    "<tr class='hover bottom2'>" +
    "<td><p class='left'>GyroScope</p></td>" +
    "<td>" +
    "<table class='subtable data'>" +
    "<tr>" +
    "<td>X</td>" +
    "<td>=</td>" +
    "<td id='gyro.x'>" +
    Number(data.gyro.x).toFixed(2) +
    "</td>" +
    "</tr>" +
    "<tr>" +
    "<td>Y</td>" +
    "<td>=</td>" +
    "<td id='gyro.y'>" +
    Number(data.gyro.y).toFixed(2) +
    "</td>" +
    "</tr>" +
    "<tr>" +
    "<td>Z</td>" +
    "<td>=</td>" +
    "<td id='gyro.z'>" +
    Number(data.gyro.z).toFixed(2) +
    "</td>" +
    "</tr>" +
    "</table>" +
    "</td>" +
    "</tr>" +
    "<tr class='hover'>" +
    "<td><p class='left'>Temperature</p></td>" +
    "<td class='data' id='temp2'>" +
    Number(temp2).toFixed(2) +
    "</td>" +
    "</tr>";
  accx = document.getElementById("acc.x");
  accy = document.getElementById("acc.y");
  accz = document.getElementById("acc.z");
  gyrox = document.getElementById("gyro.x");
  gyroy = document.getElementById("gyro.y");
  gyroz = document.getElementById("gyro.z");
  temp = document.getElementById("temp2");
}

form.addEventListener("submit", function(event) {
  let gpioError = 0;
  let deviceError = 0;
  let gpioData = Number(gpio.value);
  let deviceData = device.value;

  let validNum = [
    1,
    2,
    3,
    4,
    5,
    6,
    7,
    8,
    9,
    10,
    11,
    12,
    13,
    14,
    15,
    16,
    17,
    18,
    19,
    20,
    21,
    22,
    23,
    24,
    25,
    26,
    27
  ];
  let index = validNum.indexOf(gpioData);
  if (index === -1 || gpioEntry.indexOf(gpioData) !== -1) {
    gpioError = 1;
    gpioErrorMsg.innerHTML = "enter valid integer";
    gpioErrorMsg.classList.add("alert");
    gpioErrorMsg.classList.add("alert-danger");
  } else {
    gpioError = 0;

    gpioErrorMsg.innerHTML = "";
    gpioErrorMsg.classList.remove("alert");
    gpioErrorMsg.classList.remove("alert-danger");
  }
  if (!deviceData.match(/(^[a-zA-Z]{1}[a-zA-Z0-9]+$|^[a-zA-Z]{1}$)/g)) {
    deviceError = 1;
    deviceErrorMsg.innerHTML = "first character should be alphabet";
    deviceErrorMsg.classList.add("alert");
    deviceErrorMsg.classList.add("alert-danger");
  } else {
    deviceErrorMsg.innerHTML = "";
    deviceErrorMsg.classList.remove("alert");
    deviceErrorMsg.classList.remove("alert-danger");
  }
  if (gpioError || deviceError) {
    event.preventDefault();
    return;
  }

  addSwitch(deviceData);
  // addEntry(deviceData);

  let display = delBtn.style.display;
  if (display === "block") {
    tr.firstChild.style.display = "block";
    tr.firstChild.classList.add("curve");
    tr.firstChild.nextSibling.classList.remove("curve");
  }
  form.className = form.className.replace(/\btrans\b/g, "");
  form.style.opacity = "0";
  form.style.display = "none";
  form.style.top = "0";
  form.style.height = "0";
  let data = {
    room: clients.value,
    gpio: gpioData,
    device: deviceData
  };
  gpioEntry.push(gpioData);
  data = JSON.stringify(data);
  socket.emit("addSwitch", data);
  event.preventDefault();
});

function addSwitch(data, state) {
  let tr = document.createElement("tr");
  tr.innerHTML =
    "<td class='cheUnche'><img src='static/unchecked.png' /></td>" +
    "<td class='right curve'>" +
    data +
    "</td>" +
    "<td>" +
    "<div class='onoffswitch'>" +
    "<label class='onoffswitch-label'>" +
    "<input type='checkbox' name='onoffswitch' class='onoffswitch-checkbox' checked>" +
    "<span class='onoffswitch-inner'></span>" +
    "<span class='onoffswitch-switch'></span>" +
    "</label>" +
    "</div>" +
    "</td>";
  switches.appendChild(tr);
  onOff2 = Array.from(onOff);
  tr.classList.add("trSwitch");
  // console.log(trSwitch);
  //   tr.addEventListener('change',function(event){ if(event.target.checked===true){

  //       //entries[tr.firstChild.nextSibling.innerHTML] = "ON";
  //       //localStorage.setItem("data",JSON.stringify(entries));
  //   }
  //   else {
  //      // entries[tr.firstChild.nextSibling.innerHTML] = "OFF";
  //       //localStorage.setItem("data",JSON.stringify(entries));
  //   }

  // });
  let rightTd = tr.firstChild.nextSibling.nextSibling;
  let checkbox = rightTd.firstChild.firstChild.firstChild;
  if (state !== undefined) {
    if (state === "OFF") {
      checkbox.checked = false;
    } else {
      checkbox.checked = true;
    }
  } else {
    checkbox.checked = false;
  }
}

// function addEntry(data) {
//   entries[data] = "OFF";
//   localStorage.setItem("data",JSON.stringify(entries));
// }

function createList(data) {
  for (let i = 0; i < data.length; i++) {
    let temp = document.createElement("option");
    //temp.classList.add("dropdown-item");
    temp.innerHTML = data[i];
    clients.appendChild(temp);
    //menu.appendChild(temp);
  }
  clients.addEventListener("change", function() {
    controlColor = 0;
    socket.emit("username", clients.value);
    if (clients.value.indexOf("photon") >= 0) controlColor = 1;
  });
  //clients.value = clients.firstChild.nextSibling.innerHTML;
  //console.log(clients.firstChild);
}

adbtn.addEventListener("click", function() {
  form.className = "trans";
  form.style.height = "auto";
  form.style.display = "block";
});

rmBtn.addEventListener("click", function() {
  delBtn.style.display = "block";
  selAllBtn.style.display = "block";
  let options = document.getElementsByClassName("cheUnche");
  let len = options.length || 0;
  for (let i = 0; i < len; i++) {
    options[i].style.display = "block";
    options[i].classList.add("curve");
    options[i].nextSibling.classList.remove("curve");
  }
  rmBtn.style.display = "none";
});

switches.addEventListener("click", function(e) {
  let target = e.target;
  // console.log(target);
  let src = target.getAttribute("src");
  if (src === "static/checked.png") {
    target.setAttribute("src", "static/unchecked.png");
    target.parentNode.parentNode.classList.remove("checked");
  } else if (src === "static/unchecked.png") {
    target.setAttribute("src", "static/checked.png");
    target.parentNode.parentNode.classList.add("checked");
  }
  let checked = target.checked;

  let index = onOff2.indexOf(target);

  if (checked !== undefined) {
    let data = {
      room: clients.value,
      device: target.parentNode.parentNode.parentNode.previousSibling.innerHTML,
      gpio: gpioEntry[index],
      state: checked,
      location: index
    };
    //console.log(data,gpioEntry);
    data = JSON.stringify(data);

    socket.emit("onOff", data);
  }
});

delBtn.addEventListener("click", function() {
  let rm = document.querySelectorAll(".checked");
  let indices = [];
  let entries = [];
  let arr = Array.from(trSwitch);
  let len = rm.length;
  for (let i = 0; i < len; i++) {
    // console.log(rm[i].firstChild.nextSibling);
    //  delete entries[rm[i].firstChild.nextSibling.innerHTML];
    // localStorage.setItem("data",JSON.stringify(entries));
    indices.push(arr.indexOf(rm[i]));
    gpioEntry.splice(arr.indexOf(rm[i]) - i, 1);
    entries.push(rm[i].innerText.trim());
    rm[i].parentNode.removeChild(rm[i]);
  }
  let data = {
    room: clients.value,
    indices: indices,
    entries: entries
  };
  data = JSON.stringify(data);
  socket.emit("delete", data);
  let remain = document.getElementsByClassName("cheUnche");
  len = remain.length;
  for (let i = 0; i < len; i++) {
    remain[i].style.display = "none";
    remain[i].classList.remove("curve");
    remain[i].nextSibling.classList.add("curve");
  }
  delBtn.style.display = "none";
  selAllBtn.style.display = "none";
  rmBtn.style.display = "block";
});

/*(function() {

    let ui =  JSON.parse(localStorage.getItem("data"));
    if(ui!==null){
    for(let key in ui) {
      addSwitch(key,ui[key]);
      entries[key]=ui[key];
    }
  }
}());*/
selAllBtn.addEventListener("click", function() {
  let len = trSwitch.length;

  for (let i = 0; i < len; i++) {
    let target = trSwitch[i].firstChild.firstChild;
    let src = target.getAttribute("src");

    if (src === "static/checked.png") {
      target.setAttribute("src", "static/unchecked.png");
      target.parentNode.parentNode.classList.remove("checked");
    } else if (src === "static/unchecked.png") {
      target.setAttribute("src", "static/checked.png");
      target.parentNode.parentNode.classList.add("checked");
    }
  }
});

accgraphlink.addEventListener("click", function() {
  if (accelerometer.style.display !== "block") {
    home.style.display = "none";
    gyroscope.style.display = "none";
    temperature.style.display = "none";
    accelerometer.style.display = "block";
    dataDisplay.style.display = "none";
    document.body.classList.remove("background");
    socket.emit("getaccel");
  }
});

gyrographlink.addEventListener("click", function() {
  if (gyroscope.style.display !== "block") {
    home.style.display = "none";
    gyroscope.style.display = "block";
    temperature.style.display = "none";
    accelerometer.style.display = "none";
    dataDisplay.style.display = "none";
    document.body.classList.remove("background");
    socket.emit("getgyro");
  }
});

tempgraphlink.addEventListener("click", function() {
  if (temperature.style.display !== "block") {
    home.style.display = "none";
    gyroscope.style.display = "none";
    temperature.style.display = "block";
    accelerometer.style.display = "none";
    dataDisplay.style.display = "none";
    document.body.classList.remove("background");
    socket.emit("gettemp");
  }
});

homelink.addEventListener("click", function() {
  home.style.display = "block";
  gyroscope.style.display = "none";
  temperature.style.display = "none";
  accelerometer.style.display = "none";
  dataDisplay.style.display = "none";
  document.body.classList.add("background");
});

stats.addEventListener("click", function() {
  home.style.display = "none";
  gyroscope.style.display = "none";
  temperature.style.display = "none";
  accelerometer.style.display = "none";
  dataDisplay.style.display = "block";
  document.body.classList.add("background");
});

socket.on("switching", function(data) {
  data = JSON.parse(data);
  onOff2[data.location].checked = data.state;
});

socket.on("adding", function(data) {
  data = JSON.parse(data);
  addSwitch(data.device);
});

socket.on("deleting", function(data) {
  data = JSON.parse(data);
  data = data.indices;
  for (let i = 0; i < data.length; i++) {
    trSwitch[data[i] - i].parentNode.removeChild(trSwitch[data[i] - i]);
  }
});

socket.on("data", function(data) {
  data = JSON.parse(data);
  //	menu.innerHTML = "";
  switches.innerHTML = "";
  sensorData.innerHTML = "";
  adbtn.style.display = rmBtn.style.display = "none";
  createList(data);
});

socket.on("load", function(data) {
  if (controlColor) chooseColor.style.display = "block";
  else chooseColor.style.display = "none";
  data = JSON.parse(data);
  adbtn.style.display = rmBtn.style.display = "block";
  switches.innerHTML = "";
  sensorData.innerHTML = "";
  let obj = {
    acc: data.Accelerometer,
    gyro: data.Gyroscope,
    temperature: data.Temperature
  };
  let Switches = data.control_data;
  let sensordata = obj;
  renderData(sensordata);
  for (key of Switches) {
    addSwitch(key.switch, key.state);
    gpioEntry.push(key.gpio);
  }
});

socket.on("sensorData", function(data) {
  data = JSON.parse(data);
  let sensortype = data.sensor;
  if (sensortype === "Accelerometer") {
    accx.innerHTML = Number(data.x).toFixed(2);
    accy.innerHTML = Number(data.y).toFixed(2);
    accz.innerHTML = Number(data.z).toFixed(2);
  } else if (sensortype === "Gyroscope") {
    gyrox.innerHTML = Number(data.x).toFixed(2);
    gyroy.innerHTML = Number(data.y).toFixed(2);
    gyroz.innerHTML = Number(data.z).toFixed(2);
  } else {
    temp.innerHTML = Number(data.temperature).toFixed(2);
  }
  let packets = data.packet;
  let byte = data.byte;
  packet.innerHTML = Number(packet.innerHTML) + packets;
  bytes.innerHTML = Number(bytes.innerHTML) + packets * byte;
});

socket.on("sendaccel", function(data) {
  embedacc.src = data;
  //embedacc.style.height = `${screen.height}px`;
  // embedacc.style.width = `${80}%`;
});

socket.on("sendgyro", function(data) {
  embedgyro.src = data;
  //embedgyro.style.height = `${screen.height}px`;
  // embedgyro.style.width = `${80}%`;
});

socket.on("sendtemp", function(data) {
  embedtemp.src = data;
  // embedtemp.style.height = `${screen.height}px`;
  // embedtemp.style.width = `${80}%`;
});

color.addEventListener("change", function(event) {
  socket.emit("color", event.target.value);
});

cancel.addEventListener("click", function() {
  form.className = form.className.replace(/\btrans\b/g, "");
  form.style.opacity = "0";
  form.style.display = "none";
  form.style.top = "0";
  form.style.height = "0";
});
