#include <WiFi.h>
#include <WiFiClient.h>
#include <WebSocketClient.h>

//18.62.31.157
IPAddress server(18,62,31,157);
byte mac[6];
char macaddress[30];
WebSocketClient webSocketClient;
// Use WiFiClient class to create TCP connections
WiFiClient client;

#define SAMPLE_BIN 5


const char* ssid     = "J2";
const char* password = "18611865";

int count;

void setup() {
  Serial.begin(115200);
  delay(10);
//  String pwd ="18611865"; 
//  int i = pwd.length() + 1;
//  char password[i];
//  pwd.toCharArray(password, i);
//  String ssi = "J2";
//  i = ssi.length() + 1;
//  char ssid[i];
//  ssi.toCharArray(ssid, i);
//  //get host from eeprom
//  //String eehos = pref.getString("eehost", "xxx.co.za");
//  //wss://echo.websocket.org
//  String eehos = "http://192.168.0.102";// = pref.getString("eehost", "http://192.168.0.102");
//
//  i = eehos.length() + 1;
//  char eehost[i];
//  eehos.toCharArray(eehost, i);
//  //get path to websockets 
//  String eepat = "/";
//  i = eepat.length() + 1;
//  char eepath[i];
//  eepat.toCharArray(eepath, i);

  //Connecting to Wifi Network:
  Serial.print("Connecting to ");
  Serial.println(ssid);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("");
  Serial.println("WiFi connected");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());
  delay(1000);
  //------------

  //get the mac address of the Magafter
  WiFi.macAddress(mac);
  Serial.print("MAC Address is ");
  //Serial.println(mac);


//  // Connect to the websocket server
//  if (client.connect(server, 5000)) {
//    Serial.println("xxx Connected");
//  } else {
//    Serial.println("xxx Connection failed.");
//    while (1) {
//      // Hang on failure
//    }
//  }
//  char path[50];
//  memset(path, 0, sizeof(path));
//  strcpy(path, eepath);
//  //turn the mac array into a char array with separators
//  memset(macaddress, 0, sizeof(macaddress));
//  char result[5];
//  for (int i = 0; i < 6; i++)
//  {
//    memset(result, 0, sizeof(result));
//    sprintf(result, "%x", (char)mac[i]);
//    //macaddress[i] = (char)mac[i];
//    strcat(macaddress, result);
//    strcat(macaddress, "-");
//  }
//  strcat(path, macaddress);
//  // Handshake with the server
//  webSocketClient.path = path;
//  webSocketClient.host = eehost;
//  if (webSocketClient.handshake(client)) {
//    Serial.println("Handshake successful");
//  } else {
//    Serial.println("Handshake failed.");
//    while (1) {
//      // Hang on failure
//    }
//  }
 count = 0; 
}

String data;
String x,y,z;

void loop() {
  data = "";
  if (client.connected()) {
    //webSocketClient.sendData("HIHI",1);
    //Serial.println("Checking Data");
    uint8_t zz;
    webSocketClient.getData(data,&zz);
    if (data.length() > 0) {
      Serial.print("Received data: ");
      Serial.println(data);
    }
    if (count <=SAMPLE_BIN-1){
        z += String(analogRead(A0)*0.01);
        y += String(analogRead(A3)*0.01);
        x += String(analogRead(A6)*0.01);
    }
    if (count <SAMPLE_BIN-1){
        z+=",";x+=",";y+=",";
    }
    if (count ==SAMPLE_BIN){
      //String sdata = "42[\"data_post\", {\"X\":"+x+",\"Y\":"+y+",\"Z\":"+z+ ]";
      String sdata = "42[\"data\",[["+x+"],["+y+"],["+z+"]]]";
      //Serial.println(sdata);
      webSocketClient.sendData(sdata,1);
      z = ""; x=""; y="";
      count = -1;
    }
  } else {
    Serial.println("Client disconnected. Restarting system...");
    //delay(2000);
    //esp_restart(); //testing the restart command more than anything else
  }
  count +=1;
  delay(10);

}
