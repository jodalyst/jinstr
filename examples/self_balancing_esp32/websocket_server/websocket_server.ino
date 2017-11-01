#include <WiFi.h>
#include <WebSocketServer.h>

const char* ssid     = "Hercules_Mulligan";
const char* password = "comcastsucks99";
WiFiServer server(80);
WebSocketServer webSocketServer;


void handleClientData(String &dataString) {
  Serial.println(dataString);
}

// send the client the analog value of a pin
void sendClientData() {
  String data = "secret message";  
  webSocketServer.sendData(data);  
}

int value;
long unsigned int timeo;

void setup()
{
    delay(500); //initial wait for safety
    Serial.begin(115200);//set up serial
    delay(10); //teensy tiny wait
    //internet hook up try
    Serial.print("Connecting to ");
    Serial.println(ssid);
    WiFi.begin(ssid, password);
    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
        Serial.print(".");
    }
    Serial.println("");
    Serial.println("WiFi connected.");
    Serial.println("IP address: ");
    Serial.println(WiFi.localIP());
    server.begin();
    value = 0;
    timeo = micros();
}



void loop(){
 WiFiClient client = server.available();   // listen for incoming clients
  if (client) {                             // if you get a client,
    Serial.println("New Client.");           // print a message out the serial port
    String currentLine = "";                // make a String to hold incoming data from the client
    if (client.connected() && webSocketServer.handshake(client)){
      Serial.println("Handshake happened:");
      while (client.connected() ) {            // loop while the client's connected
        timeo = micros();
        if (client.available()) {             // if there's bytes to read from the client,
          String data = webSocketServer.getData();
          Serial.print("data received: ");
          Serial.println(data);
        String z = String(analogRead(A0)*0.01);
        String y = String(analogRead(A3)*0.01);
        String x = String(analogRead(A6)*0.01);
        //String sdata = "42[\"update_456\",[["+x+"],["+y+"],["+z+"]]]";
        String sdata = "[["+x+"],["+y+"],["+z+"]]";
        Serial.println("Sending Data"+String(value)); 
        unsigned long start = micros(); 
        webSocketServer.sendData(sdata);
        Serial.println(micros()-start);
        }
        while (micros()-timeo<1000);//wait
      }
    }
    // close the connection:
    //client.stop();
    //Serial.println("Client Disconnected.");
  }
}
