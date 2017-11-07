
#include <WebSocketServer.h>

#include <SPI.h>
#include <WiFi101.h>


char* ssid     = "J2";
char* password = "18611865";

//const char* ssid     = "EECS-ConfRooms";
//const char* password = "";
WiFiServer server(80);
WebSocketServer webSocketServer;
WiFiClient client;


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

    printWiFiStatus();
    timeo = micros();
}



void loop(){
 client = server.available();   // listen for incoming clients
  if (client) {                             // if you get a client,
    Serial.println("New Client.");           // print a message out the serial port
    String currentLine = "";                // make a String to hold incoming data from the client
    if (client.connected() && webSocketServer.handshake(client)){
      Serial.println("Handshake happened:");
      while (client.connected() ) {            // loop while the client's connected
        timeo = micros();
        if (client.available()) {             // if there's bytes to read from the client,
          String data = webSocketServer.getData();
        String z = String(analogRead(A0)*0.01);
        String y = String(analogRead(A3)*0.01);
        String x = String(analogRead(A6)*0.01);
        //String sdata = "42[\"update_456\",[["+x+"],["+y+"],["+z+"]]]";
        String sdata = "[["+x+"],["+y+"],["+z+"]]";
        unsigned long start = micros(); 
        webSocketServer.sendData(sdata);
        //Serial.println(micros()-start);
        Serial.println(x);
        }
        while (micros()-timeo<1000);//wait
      }
    }
    // close the connection:
    //client.stop();
    //Serial.println("Client Disconnected.");
  }
}



void printWiFiStatus() {
  // print the SSID of the network you're attached to:
  Serial.print("SSID: ");
  Serial.println(WiFi.SSID());

  // print your WiFi shield's IP address:
  IPAddress ip = WiFi.localIP();
  Serial.print("IP Address: ");
  Serial.println(ip);

  // print the received signal strength:
  long rssi = WiFi.RSSI();
  Serial.print("signal strength (RSSI):");
  Serial.print(rssi);
  Serial.println(" dBm");
}
