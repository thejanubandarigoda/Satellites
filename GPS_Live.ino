#include <TinyGPS++.h>
#include <HardwareSerial.h>
#include <WiFi.h>
#include <HTTPClient.h>

// WiFi credentials
const char* ssid = "WiFI";
const char* password = "PS";

// Your server endpoint
const char* serverName = "http://Your IP Address/update_location";

HardwareSerial gpsSerial(2); // Use Serial 2 for GPS
TinyGPSPlus gps;

void setup() {
  Serial.begin(115200);
  gpsSerial.begin(9600, SERIAL_8N1, 16, 17); // RX, TX pins

  // Connect to Wi-Fi
  WiFi.begin(ssid, password);
  Serial.println("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nConnected to WiFi");
  Serial.println(WiFi.localIP());
}

void loop() {
  while (gpsSerial.available() > 0) {
    if (gps.encode(gpsSerial.read())) {
      if (gps.location.isValid()) {
        float latitude = gps.location.lat();
        float longitude = gps.location.lng();
        int satellites = gps.satellites.value();

        // Check if WiFi is connected
        if (WiFi.status() == WL_CONNECTED) {
          HTTPClient http;
          String serverPath = String(serverName) + "?lat=" + String(latitude, 6) + "&lng=" + String(longitude, 6) + "&sats=" + String(satellites);
          
          http.begin(serverPath.c_str());
          int httpResponseCode = http.GET();

          if (httpResponseCode > 0) {
            String payload = http.getString();
            Serial.println(httpResponseCode);
            Serial.println(payload);
          } else {
            Serial.print("Error on sending GET: ");
            Serial.println(httpResponseCode);
          }
          http.end();
        }
      }
    }
  }

  if (millis() % 5000 == 0 && !gps.location.isValid()) {
      Serial.println("Searching for GPS signal...");
  }
}
