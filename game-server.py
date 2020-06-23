import tornado.web
import tornado.websocket
import tornado.ioloop
import struct 
import math 
import random 
import time
#
# 1 Spawn dot 
# 2 Remove dot 
# 3 Who hit a circle
# 4 Write points of each player
# 5 Remove player 
#
n=1
dotCoords={'X':0,'Y':0}
task={"newPlayer":0,"spawnDot":1,"removeDot":2,"Hit":3,"addPoints":4,
        "removePlayer":5,"showWinner":6,}
Players={}
Points={}
Left={}
class GameHandler(tornado.websocket.WebSocketHandler):
    def open(self):
        global n
        Players[self]=n
        Points[n]=0
        if n==1:
            msg=spawnDot()
            self.write_message(msg,True)
        else:
            msg= spawnDot(dotCoords['X'],dotCoords['Y'])
            self.write_message(msg,True)
        n=n+1
        for i in range(len(Points)):
            msg = addPoints(i)
            sendToAll(msg)
        print("New Connection")
        
    def on_close(self):
        Left[self]=Players[self]
        msg = removePlayer(len(Players)-len(Left))
        sendToAll(msg)
        print("Connection Removed")
        
    
    def on_message(self,message):
        global dotCoords
        
        if isinstance(message,bytes):
            #Get msg and countLength from 0,0
            message=struct.unpack('hhhh',message)
            X=message[0]+message[1]
            Y=message[2]+message[3]
            Len=countLen(X,Y)
            if dotHit(X,Y) == True:
                msg = removeDot()
                sendToAll(msg)
                Points[Players[self]]+=1
                for i in range(len(Points)):
                    msg = addPoints(i)
                    sendToAll(msg)
                msg = Hit(Players[self])
                sendToAll(msg)
                msg = spawnDot()
                time.sleep(1)
                sendToAll(msg)
                if Points[Players[self]]>=20:
                    msg = showWinner(Players[self])
                    sendToAll(msg)
                    for P in Points:
                        Points[P]=0

    def check_origin(self,origin):
        print("Origin: ",origin)
        return True

def sendToAll(msg):
    global Players,Left
    for con in Players:
        if con in Left:
            continue
        else:
            con.write_message(msg,True)


def showWinner(Winner):
    msg = struct.pack('hh',task["showWinner"],Winner)
    return msg
def removePlayer(n):
    msg = struct.pack('hh',task["removePlayer"],n)
    return msg

def addPoints(Player):
    global Players,Left
    msg =struct.pack('hhhh',task["addPoints"],Player,Points[Player+1],Player %(len(Players)-len(Left)))
    return msg

def Hit(Player):
    msg = struct.pack('hh',task["Hit"],Player)
    return msg


def spawnDot(x=-1,y=-1):
    if x==-1 and y==-1:
        x=random.randint(400,1500)
        y=random.randint(200,1000)
        newDot(x,y)
    
    msg = struct.pack('hhh',task["spawnDot"],x,y)
    return msg

def removeDot():
    global dotCoords
    x= dotCoords["X"]
    y=dotCoords["Y"]
    msg = struct.pack('hhh',task["removeDot"],x,y)
    return msg

def dotHit(x,y):
    global dotCoords
    if x>(dotCoords["X"]-50) and x<(dotCoords["X"]+50):
        if y>(dotCoords["Y"]-110) and y<(dotCoords["Y"]+50):
            return True
    return False

def countLen(X,Y):
    Len=math.sqrt(X*X+Y*Y)
    return Len

def newDot(x,y):
    global dotCoords
    dotCoords['X']=x
    dotCoords['Y']=y

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