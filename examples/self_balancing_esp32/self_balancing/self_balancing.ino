#include <WiFi.h>
#include "mpu9250_esp32.h"
#include <math.h>
#include <WebSocketServer.h>

#define MOTOR_MAX 50
#define STEP_LIMIT 15


#define stp1 32 //PWM
#define dir1 33
#define stp2 25 //PWM
#define dir2 26
// use 13 bit precission for LEDC timer
#define LEDC_TIMER_13_BIT  13
#define LEDC_BASE_FREQ     5000

const char* ssid     = "EECS-ConfRooms";
const char* password = "";
WiFiServer server(80);
WebSocketServer webSocketServer;
WiFiClient client;



//IMU SETUP:
MPU9250 imu;

void setup_imu(){
  char c = imu.readByte(MPU9250_ADDRESS, WHO_AM_I_MPU9250);
  Serial.print("MPU9250: "); Serial.print("I AM "); Serial.print(c, HEX);
  Serial.print(" I should be "); Serial.println(0x73, HEX);
  if (c == 0x73){
    imu.MPU9250SelfTest(imu.selfTest);
    imu.initMPU9250();
    imu.calibrateMPU9250(imu.gyroBias, imu.accelBias);
    imu.initMPU9250();
//    imu.initAK8963(imu.factoryMagCalibration);
//    //imu.magCalMPU9250(imu.magBias, imu.magScale);
//    Serial.println("AK8963 mag biases (mG)");
//    Serial.println(imu.magBias[0]);
//    Serial.println(imu.magBias[1]);
//    Serial.println(imu.magBias[2]);
//  
//    Serial.println("AK8963 mag scale (mG)");
//    Serial.println(imu.magScale[0]);
//    Serial.println(imu.magScale[1]);
//    Serial.println(imu.magScale[2]);
    imu.getAres();
    imu.getGres();
    //imu.getMres();
  } // if (c == 0x73)
  else
  {
    //while(1) Serial.println("NOT FOUND"); // Loop forever if communication doesn't happen
  }
}

float Kp = 10;
float Kd = 2.45;
float Ks;

float desired_speed;
float step_count;
float desired_angle;

float error_integral;
int signal_freq = 300;

boolean direct1 = false;
boolean direct2 = true;

int LOOP_SPEED = 10; //milliseconds
int primary_timer = 0;

float old_error;

float current_command;


float derv_g;
long unsigned int timeo;

void setup()
{
    derv_g = 0.0;
    error_integral = 0.0;
    desired_speed = 0;
    step_count = 0;
    Ks = 0.25;
    current_command = 0;
    desired_angle = 0.0;
    delay(1000);
    Wire.begin();
    randomSeed(analogRead(0));  //initialize random numbers
    Serial.begin(115200);
    pinMode(dir1,OUTPUT);
    pinMode(dir2,OUTPUT);
    digitalWrite(dir1,direct1);
    digitalWrite(dir2,direct2);
    Serial.println("Calibrating...");
    delay(100);
    setup_imu();


    delay(10);
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

    //setting up pwms
    ledcSetup(0, signal_freq, LEDC_TIMER_13_BIT); //0 here links below
    ledcAttachPin(stp1, 0); //the "0" here is the ledc channel
    ledcWriteTone(0,signal_freq);
    ledcSetup(1, signal_freq, LEDC_TIMER_13_BIT); //0 here links below
    ledcAttachPin(stp2, 1); //the "0" here is the ledc channel
    ledcWriteTone(1,signal_freq);
    primary_timer = millis();
    old_error = 0;

    
}


float angle;
int value = 0;

float alpha = 0.9;
float update_angle(float dim1, float dim2){
  float temp_angle = atan2(-dim2,dim1)*180/3.14159+90;
  angle = angle*alpha + temp_angle*(1-alpha);
}

float glpha = 0.75;
float update_gyro(float in){
  derv_g = derv_g*glpha + in*(1-glpha);
}

void motor_command(float command){
  if (current_command <0){
    digitalWrite(dir1,HIGH);
    digitalWrite(dir2,LOW);
  }else{
    digitalWrite(dir1,LOW);
    digitalWrite(dir2,HIGH);
  }
  current_command = 0.99*current_command + 0.05*command;
  current_command = current_command>MOTOR_MAX?MOTOR_MAX:current_command<-1*MOTOR_MAX?-MOTOR_MAX:current_command;
  int to_write = abs(100*int(current_command));
  ledcWriteTone(0,to_write);
  ledcWriteTone(1,to_write);
  step_count += current_command*LOOP_SPEED*0.001;
  step_count = step_count>STEP_LIMIT?STEP_LIMIT:step_count<-1*STEP_LIMIT?-1*STEP_LIMIT:step_count;
  //Serial.println(String(current_command)+","+String(step_count));
  
}

void loop(){
  client = server.available();   // listen for incoming clients
  if (client) {                             // if you get a client,
    Serial.println("New Client.");           // print a message out the serial port
    String currentLine = "";                // make a String to hold incoming data from the client
    if (client.connected() && webSocketServer.handshake(client)){
      Serial.println("Handshake happened:");
      while (client.connected() ) {            // loop while the client's connected
          //system updates
          float x,y,z;
          imu.readAccelData(imu.accelCount);
          x = imu.accelCount[0]*imu.aRes;
          y = imu.accelCount[1]*imu.aRes;
          z = imu.accelCount[2]*imu.aRes;
          update_angle(x,z);
          desired_angle = Ks*step_count + desired_speed;
          float error = desired_angle-angle;
          error_integral += error*0.001*LOOP_SPEED;
          if ((old_error>0 && error<=0)||(old_error<0 && error >=0)) step_count = 0;
          old_error = error;
          imu.readGyroData(imu.gyroCount);
          x = imu.gyroCount[0]*imu.gRes;
          y = imu.gyroCount[1]*imu.gRes;
          z = imu.gyroCount[2]*imu.gRes;
          float derv_error = update_gyro(y);
          float command = Kp*error + Kd*derv_error;//+Ks*error_integral;
          motor_command(command);

        timeo = micros();
        if (client.available()) {             // if there's bytes to read from the client,
          String data = webSocketServer.getData();
        //process data here!
          
        String sdata = "[["+String(error)+"],["+String(derv_error)+"],["+String(command)+"]]";
        unsigned long start = micros(); 
        webSocketServer.sendData(sdata);
        Serial.println(micros()-start);
        }
        while (micros()-timeo<1000*LOOP_SPEED);//wait
      }
    }
    //close the connection:
    client.stop();
    Serial.println("Client Disconnected.");
  }
}


  
// WiFiClient client = server.available();   // listen for incoming clients
//  if (client) {                             // if you get a client,
//    Serial.println("New Client.");           // print a message out the serial port
//    String currentLine = "";                // make a String to hold incoming data from the client
//    while (client.connected()) {            // loop while the client's connected
//      if (client.available()) {             // if there's bytes to read from the client,
//        char c = client.read();             // read a byte, then
//        Serial.write(c);                    // print it out the serial monitor
//        if (c == '\n') {                    // if the byte is a newline character
//          // if the current line is blank, you got two newline characters in a row.
//          // that's the end of the client HTTP request, so send a response:
//          if (currentLine.length() == 0) {
//            // HTTP headers always start with a response code (e.g. HTTP/1.1 200 OK)
//            // and a content-type so the client knows what's coming, then a blank line:
//            client.println("HTTP/1.1 200 OK");
//            client.println("Content-type:text/html");
//            client.println();
//
//            // the content of the HTTP response follows the header:
////            client.print("<h1>Click <a href=\"/H\">here</a> to increase speed.</h1><br>");
////            client.print("<h1>Click <a href=\"/L\">here</a> to decrease speed.</h1><br>");
////            client.print("<h1>Click <a href=\"/D\">here</a> to toggle direction.</h1><br>");
////            client.print("<button type=\"submit\" formmethod=\"get\" formaction=\"/H\">Increase Speed</button>");
////            client.print("<button type=\"submit\" formmethod=\"get\" formaction=\"/L\">Decrease Speed</button>");
////            client.print("<button type=\"submit\" formmethod=\"get\" formaction=\"/D\">Change Direction</button>");
//            client.print("<br>K_p = "+String(Kp));
//            client.print("<form action=\"/KPU\" method=\"get\"><button type=\"submit\">Increase Kp by 0.1</button></form>");
//            client.print("<form action=\"/KPD\" method=\"get\"><button type=\"submit\">Decrease Kp by 0.1</button></form>");
//            client.print("<br>K_d = "+String(Kd));
//            client.print("<form action=\"/KDU\" method=\"get\"><button type=\"submit\">Increase Kd by 0.05</button></form>");
//            client.print("<form action=\"/KDD\" method=\"get\"><button type=\"submit\">Decrease Kd by 0.05</button></form>");
//            client.print("<br>K_s = "+String(Ks));
//            client.print("<form action=\"/KSU\" method=\"get\"><button type=\"submit\">Increase Ks by 0.05</button></form>");
//            client.print("<form action=\"/KSD\" method=\"get\"><button type=\"submit\">Decrease Ks by 0.05</button></form>");
//            client.print("<br>Desired Speed = "+String(desired_speed));
//            client.print("<form action=\"/VU\" method=\"get\"><button type=\"submit\">Increase Speed by 0.01</button></form>");
//            client.print("<form action=\"/VD\" method=\"get\"><button type=\"submit\">Decrease Speed by 0.01</button></form>");
//            
//
//            // The HTTP response ends with another blank line:
//            client.println();
//            // break out of the while loop:
//            break;
//          } else {    // if you got a newline, then clear currentLine:
//            currentLine = "";
//          }
//        } else if (c != '\r') {  // if you got anything else but a carriage return character,
//          currentLine += c;      // add it to the end of the currentLine
//        }
//        if (currentLine.endsWith("GET /KPU")) {
//          Serial.println("Increase KP");
//          Kp +=0.1;
//        }
//        else if (currentLine.endsWith("GET /KPD")) {
//          Serial.println("Decrease KP");
//          Kp -=0.1;
//        }else if (currentLine.endsWith("GET /KDU")) {
//          Serial.println("Increase KD");
//          Kd +=0.05;
//        }
//        else if (currentLine.endsWith("GET /KDD")) {
//          Serial.println("Decrease KD");
//          Kd -=0.05;
//        }else if (currentLine.endsWith("GET /VU")) {
//          Serial.println("Increase desired speed");
//          desired_speed+=0.01;
//        }
//        else if (currentLine.endsWith("GET /VD")) {
//          Serial.println("Decrease desired speed");
//          desired_speed -=0.01;
//        }else if (currentLine.endsWith("GET /KSU")) {
//          Serial.println("Increase Ks");
//          Ks+=0.05;
//        }
//        else if (currentLine.endsWith("GET /KSD")) {
//          Serial.println("Decrease Ks");
//          Ks -=0.05;
//        }else if (currentLine.endsWith("GET /RST")) {
//          Serial.println("Reset Integral");
//          error_integral = 0.0;
//        }
//        
//      }
//    }
//    // close the connection:
//    client.stop();
//    Serial.println("Client Disconnected.");
//  }
//  while (millis()-primary_timer<LOOP_SPEED); //wait for primary timer to increment
//  primary_timer =millis();
