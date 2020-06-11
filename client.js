var wsUri = "ws://localhost:8888/ws";
var wsUriecho="ws://echo.websocket.org";
var output;
var input;
var X,Y,len;






var msg = {
  type: "message",
  text: "Hello world",
  id: 101,
  date: Date.now()
};

function init()
{
  output = document.getElementById("output");
  testWebSocket();
  if(window.Event){
    document.captureEvents(Event.MOUSEMOVE);
  }
  document.onmousedown=getCursorXY

}

function getCursorXY(e){
  X=document.getElementById('cursorX').value=(window.Event)?e.pageX:event.clientX+(document.documentElement.scrollLeft? document.documentElement.scrollLeft:document.bodyscrollLeft);
  Y=document.getElementById('cursorY').value=(window.Event)?e.pageY:event.clientY+(document.documentElement.strollTop?document.documentElement.scrollTop:document.body.scrollTop);
  sendCoords(X,Y);
}

function testWebSocket()
{
  websocket = new WebSocket(wsUri);
  websocket.onopen = function(e) { onOpen(e) };
  websocket.onclose = function(e) { onClose(e) };
  websocket.onmessage = function(e) { onMessage(e) };
  websocket.onerror = function(e) { onError(e) };
}
function sendMessage()
{
  input =document.getElementById("message").value;
  doSend(input);
}
function onOpen(e)
{
  console.log(e.type);
  writeToScreen("CONNECTED");
}

function onClose(e)
{
  writeToScreen("DISCONNECTED");
}

function onMessage(e)
{
  var msg = new ArrayBuffer(2);
  var msgView = new DataView(msg);
  msgView.getInt16(0,e.data);
  console.log(msg);
  writeToScreen('<span style="color: blue;">RESPONSE: ' + /*JSON.parase(e.data)*/msg[0]+'</span>');
}

function onError(e)
{
  writeToScreen('<span style="color: red;">ERROR:</span> ' + e.data);
}

function doSend(message)
{
  writeToScreen("Text message: " + message);
  websocket.send(message);
}

function sendCoords(X,Y){
  websocket.binaryType="arraybuffer";
  var buffer = new ArrayBuffer(8);
  var bufferView = new DataView(buffer);
  bufferView.setInt16(1,X);
  bufferView.setInt16(5,Y)
  websocket.send(buffer);
}


function writeToScreen(message)
{
  var pre = document.createElement("p");
  pre.style.wordWrap = "break-word";
  pre.innerHTML = message;
  output.appendChild(pre);
}

window.addEventListener("load", init, false);