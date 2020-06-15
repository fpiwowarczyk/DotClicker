var wsUri = "ws://localhost:8888/ws";
var output;
var canvas,ctx;
var X,Y;
var messageCounter=0;
var rectWidth=150,rectHeight=75;
var gX=150,gY=75,gLen=0;

var colors =['blue','green','yellow','magenta','red']

 // Game init
function init()
{
  output = document.getElementById("output");
  game();
  initCanvas();

}

function game()
{
  websocket = new WebSocket(wsUri);
  websocket.onopen = function(e) { onOpen(e) };
  websocket.onclose = function(e) { onClose(e) };
  websocket.onmessage = function(e) { onMessage(e) };
  websocket.onerror = function(e) { onError(e) };

  document.onmousedown=getCursorXY;
  
}
 // Base functions ===========
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
  console.log(e);
  if (e.data instanceof ArrayBuffer)
  { 
    messageCounter=messageCounter+1;
    document.getElementById("message counter").value=messageCounter;
    view = new Int16Array(e.data);
    gX=view[0];
    gY=view[1];
    view= new Float32Array(e.data);
    gLen=view[1];
    circleDraw(gX,gY,colors[gX%5]);
  } else if (!(e.data instanceof Blob)){
    writeToScreen("PLAYER "+e.data);
  }
}


function onError(e)
{
  writeToScreen('<span style="color: red;">ERROR:</span> ' + e.data);
}

//=====================================

function initCanvas(){
  canvas= document.getElementById("canvas");
  canvas.width = window.innerWidth-50;
  canvas.height = window.innerHeight;
  console.log(canvas.width);
  console.log(canvas.height);
  ctx=canvas.getContext("2d");
}
function rectDraw(pX,pY,nX,nY){
  ctx.fillStyle=colors["white"];
  ctx.fillRect(pX-110,pY-240,rectWidth,rectHeight+20);
  
  ctx.fillStyle=colors["red"];
  ctx.fillRect(nX-110,nY-240,rectWidth,rectHeight);
}

function circleDraw(X,Y,color){
  ctx.beginPath();
  ctx.arc(X,Y,50,0,2*Math.PI);
  ctx.strokeStyle = color;
  ctx.stroke();

}

function getCursorXY(e){
  X=(window.Event)?e.pageX:event.clientX+(document.documentElement.scrollLeft? document.documentElement.scrollLeft:document.bodyscrollLeft);
  Y=(window.Event)?e.pageY:event.clientY+(document.documentElement.strollTop?document.documentElement.scrollTop:document.body.scrollTop);
  console.log(X);
  console.log(Y);
  sendCoords(X,Y);
}

function sendCoords(X,Y){
  websocket.binaryType="arraybuffer";
  var buffer = new ArrayBuffer(8);
  var bufferView = new DataView(buffer);
  bufferView.setInt16(1,canvas.width);
  bufferView.setInt16(5,canvas.height);
  websocket.send(buffer);
}
/*function makeMessage(Player,X,Y){
  websocket.binaryType="arraybuffer";
  var buffer = new ArrayBuffer(12);
  var bufferView = new DataView(buffer);
  bufferView.setInt16(1,Player);
  bufferView.setInt16(5,X);
  bufferView.setInt16(9,Y);
}*/
function writeToScreen(message)
{
  var pre = document.createElement("p");
  pre.style.wordWrap = "break-word";
  pre.innerHTML = message;
  output.appendChild(pre);
}
window.addEventListener("load", init, false);