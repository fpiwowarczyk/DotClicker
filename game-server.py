import tornado.web
import tornado.websocket
import tornado.ioloop
import struct 
import math 
import random

#
# 1 Spawn dot 
# 2 Remove dot 
# 3 do smth
#
#
#
n=1
state = {"X":0,"Y":0,"Len":0}

dotCoords={'X':0,'Y':0}

taks={"spawnDot":1,"removeDot":2}
connections = set()

class GameHandler(tornado.websocket.WebSocketHandler):
    def open(self):
        global connections,n,state
        connections.add(self)
        self.write_message(str(n))
        if n==1:
            msg=spawnDot()
            self.write_message(msg,True)
        else:
            msg= spawnDot(dotCoords['X'],dotCoords['Y'])
            self.write_message(msg,True)
        n=n+1
        print("New Connection")
        
        

    def on_close(self):
        global n,connections
        connections.remove(self)
        n=n-1
        print("Connection Removed")
        
    
    def on_message(self,message):
        global state,dotCoords
        
        if isinstance(message,bytes):
            #Get msg and countLength from 0,0
            message=struct.unpack('hhhh',message)
            state["X"]=message[0]+message[1]
            state["Y"]=message[2]+message[3]
            state["Len"]=countLen(state.get("X"),state.get("Y"))
            if dotHit(state.get("X"),state.get("Y")) == True:
                msg = removeDot()
                for con in connections:
                    con.write_message(msg,True)
                msg = spawnDot()
                for con in connections:
                    con.write_message(msg,True)
            
            
            
    
    def check_origin(self,origin):
        print("Origin: ",origin)
        return True


def spawnDot(x=-1,y=-1):
    if x==-1 and y==-1:
        x=random.randint(50,1000)
        y=random.randint(200,1000)
        newDot(x,y)
    
    msg = struct.pack('hhh',taks["spawnDot"],x,y)
    return msg

def removeDot():
    global dotCoords
    x= dotCoords["X"]
    y=dotCoords["Y"]
    msg = struct.pack('hhh',taks["removeDot"],x,y)
    return msg

def dotHit(x,y):
    global dotCoords
    if x>(dotCoords["X"]-50) and x<(dotCoords["X"]+50):
        if y>(dotCoords["Y"]-50) and y<(dotCoords["Y"]+50):
            return True
    return False

def countLen(X,Y):
    Len=math.sqrt(X*X+Y*Y)
    return Len

def newDot(x,y):
    global dotCoords
    dotCoords['X']=x
    dotCoords['Y']=y
    print("New dot:\n"+str(dotCoords))

class Loader(tornado.web.RequestHandler):
    def get(self):
        self.render("websocket.html",title="Dotes Clicker")


if __name__ == "__main__":
    app = tornado.web.Application([
        ("/",Loader),
        ("/ws",GameHandler),
        ("/(.*)", tornado.web.StaticFileHandler, {"path": ""}),
    ])
    app.listen(8888)
    tornado.ioloop.IOLoop.instance().start()