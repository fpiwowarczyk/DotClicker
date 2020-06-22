var wsUri = "ws://localhost:8888/ws";
var output;
var canvas,ctx;
var X,Y;
var v=0;
var dy=1;
var circle,circleToDestroy;
var colors ={'blue':'rgba(0,0,255,0.5)',
'green':'rgba(0,255,0,0.5)',
'grey':'rgba(100,100,100,0.5)',
'red':'rgba(255,0,0,0.5)',
'someRandom':'rgba(150,100,200,0.5)',
'white':'rgba(255,255,255,1)',
'black':'rgba(0,0,0,0.3)'};
 // Game init

function Circle(x,y,radious,color) {
  this.x =x;
  this.y =y;
  this.radious=radious;
  this.color = color

  this.draw = function (){
    ctx.beginPath();
    ctx.arc(this.x,this.y,this.radious,0,2*Math.PI);
    ctx.strokeStyle = 'black';
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.stroke();
  }

  this.remove = function(){
    ctx.clearRect(this.x-60,this.y-60,120,120);
  }

  this.shotDown= function (){
    this.remove();
    this.y+=1;
    this.draw();
  }

}

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
  if (e.data instanceof ArrayBuffer)
  { 
    
    view = new Int16Array(e.data);
    task=view[0]

    if(task==1)  // New dot 
    {
      gX=view[1];
      gY=view[2];
      circle = new Circle(gX-10,gY-160,50,colors['green'])
      circle.draw();
    } else if(task ==2){  // Remove dot 
      gX=view[1];
      gY=view[2];
      circleToDestroy=circle;
      animate();
    } else if(task ==3){ // Show who hit dot 
      Player = view[1];
      ctx.clearRect(50,50,300,50);
      textDraw(50,75,"Got point: Player "+Player,colors['red']);
    } else if(task ==4){ // Add points for players 
      Player=view[1];
      Points=view[2]
      ctx.clearRect(50,150+100*Player,300,60);
      textDraw(50,200+100*Player,"Player "+(Player+1)+" score:"+Points,colors['green']);
    } else if(task ==5){ // Remove player 
      Player=view[1];
      ctx.clearRect(50,150+100*(Player-2),300,60)
    } else if(task ==6){ // Show winner of game 
      Player=view[1]
      ctx.clearRect(1500,50,60,300);
      textDraw(1500,100,"Winner is Player "+Player,colors['blue'])
    }
  }
}

function animate(){
  requestAnimationFrame(animate);
  circleToDestroy.shotDown();
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

function textDraw(x,y,text,color){
  ctx.font="30px Arial";
  ctx.fillStyle=color;
  ctx.fillText(text,x,y);
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