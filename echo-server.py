import tornado.web
import tornado.websocket
import tornado.ioloop
import struct 
import math 


class EchoHanlder(tornado.websocket.WebSocketHandler):


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
            msg=struct.pack('hhd',X,Y,Len)
            print(struct.calcsize('hhd'))
            self.write_message("I want to send coords")
            msg=struct.pack('h',X)
            self.write_message(msg)
        else:
            print("Get Message:")
            self.write_message(message)
    
    def check_origin(self,origin):
        print("Origin: ",origin)
        return True
    

def countLen(X,Y):
    Len=math.sqrt(X*X+Y*Y)
    return Len
        
if __name__ == "__main__":
    app = tornado.web.Application([
        ("/ws",EchoHanlder)
    ])
    app.listen(8888)
    tornado.ioloop.IOLoop.instance().start()