import tornado.web
import tornado.websocket
import tornado.ioloop
import struct 
import math 


class GameHandler(tornado.websocket.WebSocketHandler):

    def open(self):
        print("WebSocket open")

    def on_close(self):
        print("WebSocket Close")
    
    def on_message(self,message):
        if isinstance(message,bytes):
            message=struct.unpack('hhhh',message)
            X=message[0]+message[1]
            Y=message[2]+message[3]
            Len=countLen(X,Y)
            print("X="+str(X)+"\nY="+str(Y)+"\nLen="+str(Len))
            msg=struct.pack('hhf',X,Y,Len)
            print(msg)
            self.write_message(msg,True)
        else:
            print("Get Message:")
            self.write_message(message)
    
    def check_origin(self,origin):
        print("Origin: ",origin)
        return True
    
class Loader(tornado.web.RequestHandler):
    def get(self):
        self.render("websocket.html",title="Dotes Clicker")

def countLen(X,Y):
    Len=math.sqrt(X*X+Y*Y)
    return Len
        
if __name__ == "__main__":
    app = tornado.web.Application([
        ("/",Loader),
        ("/ws",GameHandler),
        ("static/(.*)", tornado.web.StaticFileHandler, {"path": "static"}),
    ])
    app.listen(8888)
    tornado.ioloop.IOLoop.instance().start()