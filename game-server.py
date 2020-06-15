import tornado.web
import tornado.websocket
import tornado.ioloop
import struct 
import math 
import random

n=1
state = {"X":0,"Y":0,"Len":0}
class GameHandler(tornado.websocket.WebSocketHandler):

    connections = set()
    
    def open(self):
        global n,state
        self.connections.add(self)
        self.write_message(str(n))
        n=n+1
        msg=struct.pack('hhf',state.get("X"),
                        state.get("Y"),
                        state.get("Len"))
        self.write_message(msg,True)
        print("New Connection")
        
        

    def on_close(self):
        global n
        self.connections.remove(self)
        n=n-1
        print("Connection Removed")
        
    
    def on_message(self,message):
        global state
        #print(state)
        if isinstance(message,bytes):
            #Get msg and countLength from 0,0
            message=struct.unpack('hhhh',message)
            state["X"]=message[0]+message[1]
            state["Y"]=message[2]+message[3]
            state["Len"]=countLen(state.get("X"),state.get("Y"))
            # Send msg 
            for i in range(0,1000):
                x=random.randrange(state["X"])
                y=random.randrange(state["Y"])
                msg=struct.pack('hhf',
                                x,
                                y,
                                state.get("Len"))
                [con.write_message(msg,True) for con in self.connections]
        else:
            print("Get Message:")
            self.write_message(message)
    
    def check_origin(self,origin):
        print("Origin: ",origin)
        return True


def countLen(X,Y):
    Len=math.sqrt(X*X+Y*Y)
    return Len
        

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