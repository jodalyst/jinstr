'''Automatically find USB Serial Port
jodalyst 9/2017
'''
import serial.tools.list_ports

'''
#Version 2.7 or Above?
if sys.version_info[0] >2:
    version3 = True
    kwargs = {'newline':''}
else:
    version3 = False 
    kwargs = {}
'''

def get_usb_ports():
    #print(serial.tools.list_ports)
    #usb_ports = list(serial.tools.list_ports.ListPortInfo())
    usb_ports = list(serial.tools.list_ports.grep(""))
    print(usb_ports)
    if len(usb_ports) == 1:
        print("Automatically found USB-Serial Controller: {}".format(usb_ports[0].description))
        return usb_ports[0].device
    else:
        ports = list(serial.tools.list_ports.comports())
        port_dict = {i:[ports[i],ports[i].vid] for i in range(len(ports))}
        usb_id=None
        for p in port_dict:
            print("{}:   {} (Vendor ID: {})".format(p,port_dict[p][0],port_dict[p][1]))
        return port_dict
        
get_usb_ports()
'''
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

'''
