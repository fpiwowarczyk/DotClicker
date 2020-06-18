var wsUri = "ws://localhost:8888/ws";
var output;
var canvas,ctx;
var X,Y;
var messageCounter=0;

var colors ={'blue':'rgba(0,0,255,0.5)',
'green':'rgba(0,255,0,0.5)',
'grey':'rgba(100,100,100,0.5)',
'red':'rgba(255,0,0,0.5)',
'someRandom':'rgba(150,100,200,0.5)',
'white':'rgba(255,255,255,1)',
'black':'rgba(0,0,0,0.3)'};
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
  websocket.binaryType="arraybuffer";
  websocket.onopen = function(e) { onOpen(e) };
  websocket.onclose = function(e) { onClose(e) };
  websocket.onmessage = function(e) { onMessage(e) };
  websocket.onerror = function(e) { onError(e) };
  
  document.onmousedown=getCursorXY;
  
}
 // Base functions ===========
function onOpen(e)
{
  writeToScreen("CONNECTED");
}


function onClose(e)
{
  writeToScreen("DISCONNECTED");
}


function onMessage(e)
{
  console.log(e.data);
  if (e.data instanceof ArrayBuffer)
  { 
    
    view = new Int16Array(e.data);
    task=view[0]
    gX=view[1];
    gY=view[2];
    if(task==1)
    {
      circleDraw(gX-10,gY-160,colors['green'],colors['black']);
    } else if(task ==2){
      textDraw(gX-90,gY-220);
      rectDraw(gX-61,gY-211,colors['blue'])
    }
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
  ctx=canvas.getContext("2d");
}
function rectDraw(x,y,color){
  ctx.fillStyle=color
  ctx.fillRect(x,y,102,102);
  
}

function textDraw(x,y,text){
  ctx.font="30px Arial";
  ctx.fillStyle=colors['red'];
  ctx.fillText("Hello World",x,y);
}

function circleDraw(X,Y,colorfill,colorborder){
  ctx.beginPath();
  ctx.arc(X,Y,50,0,2*Math.PI);
  ctx.strokeStyle = colorborder;
  ctx.fillStyle=colorfill;
  ctx.fill();
  ctx.stroke();
}


function writeText(x,y,text){
  ctx.tont = "30px Arial";
  ctx.fillText("Hello World",100,500);
}


function getCursorXY(e){
  X=(window.Event)?e.pageX:event.clientX+(document.documentElement.scrollLeft? document.documentElement.scrollLeft:document.bodyscrollLeft);
  Y=(window.Event)?e.pageY:event.clientY+(document.documentElement.strollTop?document.documentElement.scrollTop:document.body.scrollTop);
  sendCoords(X,Y);
} 
function sendCoords(X,Y){
  var buffer = new ArrayBuffer(8);
  var bufferView = new DataView(buffer);
  bufferView.setInt16(1,X);
  bufferView.setInt16(5,Y);
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