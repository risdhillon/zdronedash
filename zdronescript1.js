// RDhillon 
// creates a spark log of the delivery devices need to urban rural healthcare centers in order to enable drone packers to be able to know clearly what needs to be done

function SparkLog(appName, incomingIntegrationID) {
    
    if (!appName) {
        log("SPARK_LOG : bad configuration, no application name, exiting...");
        throw createError("SparkLibrary configuration error: no application name specified");
    }
        this.tropoApp = appName;

    if (!incomingIntegrationID) {
        log("SPARK_LOG : bad configuration, no Spark incoming integration URI, exiting...");
        throw createError("SparkLibrary configuration error: no Spark incoming integration URI specified");
    }
        this.sparkIntegration = incomingIntegrationID;
        
    log("SPARK_LOG: all set for application:" + this.tropoApp + ", posting to integrationURI: " + this.sparkIntegration);
}

// This function sends the log entry to the registered Spark Room 
// Invoke this function from the Tropo token-url with the "sparkIntegration" parameter set to the incoming Webhook ID you'll have prepared
// Returns true if the log entry was acknowledge by Spark (ie, got a 2xx HTTP status code)
SparkLog.prototype.log = function(newLogEntry) {
    
    // Robustify
    if (!newLogEntry) {
        newLogEntry = "";
    }
    
    var result;
    try {
        // Open Connection
        var url = "https://api.ciscospark.com/v1/webhooks/incoming/" + this.sparkIntegration;
        connection = new java.net.URL(url).openConnection();

        // Set timeout to 10s
        connection.setReadTimeout(10000);
        connection.setConnectTimeout(10000);

        // Method == POST
        connection.setRequestMethod("POST");
        connection.setRequestProperty("Content-Type", "application/json");
        
        // TODO : check if this cannot be removed
        connection.setRequestProperty("Content-Length", newLogEntry.length);
        connection.setUseCaches (false);
        connection.setDoInput(true);
        connection.setDoOutput(true); 

        //Send Post Data
        bodyWriter = new java.io.DataOutputStream(connection.getOutputStream());
        log("SPARK_LOG: posting: " + newLogEntry + " to: " + url);
        contents = '{ "text": "' + this.tropoApp + ': ' + newLogEntry + '" }'
        bodyWriter.writeBytes(contents);
        bodyWriter.flush ();
        bodyWriter.close (); 

        result = connection.getResponseCode();
        log("SPARK_LOG: read response code: " + result);

    if(result < 200 || result > 299) {
            log("SPARK_LOG: could not log to Spark, message format not supported");
            return false;
     }
    }
    catch(e) {
        log("SPARK_LOG: could not log to Spark, socket Exception or Server Timeout");
        return false;
    }
    
    log("SPARK_LOG: log successfully sent to Spark, status code: " + result);
    return true; // success
}

// Let's create several instances for various log levels
// Note that you may spread logs to distinct rooms by changing the integrationId
var SparkInfo = new SparkLog("zdrone info log:", "Y2lzY29zcGFyazovL3VzL1dFQkhPT0svZjYzNjFhMmItMTY4Yi00N2E5LThmY2YtMzg5OWRiODUwMTI4");
var SparkDebug = new SparkLog("zdrone debug log:", "Y2lzY29zcGFyazovL3VzL1dFQkhPT0svZjYzNjFhMmItMTY4Yi00N2E5LThmY2YtMzg5OWRiODUwMTI4");
// note that Chester is the sparkbot 
var Chester = new SparkLog("Chester","Y2lzY29zcGFyazovL3VzL1dFQkhPT0svZjYzNjFhMmItMTY4Yi00N2E5LThmY2YtMzg5OWRiODUwMTI4");

//
// Log Configuration happens here
//

// info level used to get a synthetic sump up of what's happing
function info(logEntry) {
  log("INFO: " + logEntry);
  SparkInfo.log(logEntry);
  // Uncomment if you opt to go for 2 distinct Spark Rooms for DEBUG and INFO log levels
  //SparkDebug.log(logEntry); 
}

// debug level used to get detail informations
function debug(logEntry) {
  log("DEBUG: " + logEntry);
  SparkDebug.log(logEntry);
}

function chester(logentry) {
    log(logentry);
    Chester.log(logentry);

}

need=ask("zdrone is ready to assist! How may I help you today? Blood delivery or antibiotic delivery?", {
    choices: "blood, antibiotic",
    timeout:5.0;
    });
if (need.value == "blood"){
    info("blood needed");
    zipcode=ask("What's your zipcode?", {
        choices: "[5 DIGITS]"}
        );
    zip2 = String(zipcode.value);
    zip3 = zip2.replace(/\s/g, '');
    chester("map " + zip3);
    bloodtype=ask("What bloodtype do you need?", {
        choices: "A, B, AB, O"}
        );
    say("ok, a few pints of bloodtype " + bloodtype.value + " will be delivered!");
    info("blood type needed: " + bloodtype.value);
}
if (need.value == "antibiotic"){
    info("antibiotic needed");
    zipcode=ask("What's your zipcode?", {
        choices: "[5 DIGITS]"}
        );
    zip2 = String(zipcode.value);
    zip3 = zip2.replace(/\s/g, '');
    chester("map " + zip3);
    priority = ask("Priority: Urgent, Medium, Low?", {
        choices: "urgent, medium, low"}

    );}
if (priority.value == "urgent"){
    info("urgent");
    say("Understood. We'll get it shipped out right away.");
    medicine=ask("We currently have amoxycline and malarone in stock, which would you like?", {
        choices: "amoxycline, malarone"});
    info(medicine.value);
}
if (priority.value == "medium"){
    info("medium");
    say("Ok. We'll ship as soon as possible.");
    medicine=ask("We currently have amoxycline and malarone in stock, which would you like?", {
        choices: "amoxycline, malarone"});
    info(medicine.value); 
}
if (priority.value == "low"){
    info("low");
    say("Ok. Your order will be processed in some time.");
    medicine=ask("We currently have amoxycline and malarone in stock, which would you like?", {
        choices: "amoxycline, malarone"});
    info(medicine.value);
    timego();
}
var time1 = 0;
function timego() {
    if (time1 == 30){
        say("your delivery is packaged and on its way!");
    }
    else{
        time1++;
        timego();
    }
}
