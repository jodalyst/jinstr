'''Automatically find USB Serial Port
jodalyst 9/2017
'''

import serial.tools.list_ports
import sys
import time
from time import sleep
#Version 2.7 or Above?
if sys.version_info[0] >2:
    version3 = True
    kwargs = {'newline':''}
else:
    version3 = False 
    kwargs = {}

def get_usb_port():
    usb_port = list(serial.tools.list_ports.grep("USB-Serial Controller"))
    if len(usb_port) == 1:
        print("Automatically found USB-Serial Controller: {}".format(usb_port[0].description))
        return usb_port[0].device
    else:
        ports = list(serial.tools.list_ports.comports())
        port_dict = {i:[ports[i],ports[i].vid] for i in range(len(ports))}
        usb_id=None
        for p in port_dict:
            print("{}:   {} (Vendor ID: {})".format(p,port_dict[p][0],port_dict[p][1]))
            if port_dict[p][1]==1659:
                usb_id = p
        if usb_id== None:
            return False
        else:
            print("USB-Serial Controller: Device {}".format(p))
            return port_dict[usb_id][0].device

s = get_usb_port()
if s:
    ser = serial.Serial(port = s, 
        baudrate=115200, 
        parity=serial.PARITY_NONE, 
        stopbits=serial.STOPBITS_ONE, 
        bytesize=serial.EIGHTBITS,
        timeout=0) #auto-connects already I guess?
    print(ser)
    print("Serial Connected!")

    if ser.isOpen():
         print(ser.name + ' is open...')
     
    while True:
        data = ser.read(99)
        if len(data) > 0:
            if version3:
                print(data.decode('ascii'))
            else:
                print(data)

        sleep(3.0)

    ser.close()
else:
    print("USB-Serial Controller Not Found")


