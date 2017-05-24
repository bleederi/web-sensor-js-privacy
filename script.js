var output = document.querySelector('.output');
var dataArray = [];     //array to store multiple dataObjects (one dataObject for each button press)
var dataObject = {button:null, acceleration:null, accelerationnog:null, orientation:null, rotation:null, frequency:null};    //single reading of all the sensor data, each object a list of values obtained during button press

//below are variables for storing data for single button press
var accelerationData = [];      //list of all acceleration data
var accelerationnogData = [];   //list of acceleration data without gravity
var orientationData = [];
var orientationMat = new Float64Array([0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]);     //device orientation
var orientationMatTemp = null;       //temp variable for storing orientation matrix
var rotationData = [];

var sensors = {};
var currentButton = null;
var test = null;                //testing variable
var accel = {x:null, y:null, z:null};
var accelNoG;
var velGyro;
var recording = false;  //are we recording data or not?
var sensorfreq = 60;     //for setting desired sensor frequency
var nosensors = false;  //for testing with fake values and without sensors
var sensors_started = false;

var textUpdate = setInterval(update_text, 1000/sensorfreq);

class LowPassFilterData {       //https://w3c.github.io/motion-sensors/#pass-filters
  constructor(reading, bias) {
    Object.assign(this, { x: reading.x, y: reading.y, z: reading.z });
    this.bias = bias;
  }
/*
        update(reading) {
                this.x = this.x * this.bias + reading.x * (1 - this.bias);
                this.y = this.y * this.bias + reading.y * (1 - this.bias);
                this.z = this.z * this.bias + reading.z * (1 - this.bias);

        }
*/
        update(reading) {       //also normalizes
                let x = this.x * this.bias + reading.x * (1 - this.bias);
                let y = this.y * this.bias + reading.y * (1 - this.bias);
                let z = this.z * this.bias + reading.z * (1 - this.bias);
                let norm = Math.sqrt(x * x + y * y + z * z);
                this.x = 9.81 * x / norm;
                this.y = 9.81 * y / norm;
                this.z = 9.81 * z / norm;

        }
        normalize()
        {
                //normalize to "known value" 9.81 m/s^2
                let norm = Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);        
                this.x = 9.81 * this.x / norm;
                this.y = 9.81 * this.y / norm;
                this.z = 9.81 * this.z / norm;
        }
};

function exportData() //https://stackoverflow.com/a/13405322
{
        var exportData = JSON.stringify(dataArray);
        window.open('data:text/csv;charset=utf-8,' + escape(exportData));
}

function change_frequency()     //for changing sensor frequency
{
        let newfreq = Number(prompt("New sensor frequency"));
        if (!(isNaN(newfreq)))
        {
                sensorfreq = Number(newfreq);
                stop_sensors();
                sensors = startSensors();
                if(sensors_started)
                {
                        return true;
                }
                else
                {
                        return false;
                }
        }
        else
        {
                return false;
        }
}

function magnitude(vector)      //Calculate the magnitude of a vector
{
return Math.sqrt(vector.x * vector.x + vector.y * vector.y + vector.z * vector.z);
}

function update_text()
{
if (accel && accelNoG && gravity && orientationMat && velGyro)  //only update if all data available
        {
                        document.getElementById("accl").textContent = `Acceleration (${accel.x.toFixed(3)}, ${accel.y.toFixed(3)}, ${accel.z.toFixed(3)} Magnitude: (${magnitude(accel).toFixed(3)}))`;
                        document.getElementById("accl_nog").textContent = `Acceleration without gravity (${accelNoG.x.toFixed(3)}, ${accelNoG.y.toFixed(3)}, ${accelNoG.z.toFixed(3)} Magnitude: (${magnitude(accelNoG).toFixed(3)}))`;
                        document.getElementById("g_accl").textContent = `Isolated gravity (${gravity.x.toFixed(3)}, ${gravity.y.toFixed(3)}, ${gravity.z.toFixed(3)} Magnitude: (${magnitude(gravity).toFixed(3)}))`;
                        document.getElementById("ori").textContent = `Orientation matrix (${orientationMat[0]} ${orientationMat[1]} ${orientationMat[2]} ${orientationMat[3]} \n ${orientationMat[4]} ${orientationMat[5]} ${orientationMat[6]}) ...`;
                        document.getElementById("rrate").textContent = `Rotation rate (${velGyro.x.toFixed(3)}, ${velGyro.y.toFixed(3)}, ${velGyro.z.toFixed(3)} Magnitude: (${magnitude(velGyro).toFixed(3)}))`;
                        document.getElementById("sensorfreq").textContent = `Sensor frequency (${sensorfreq})`;
        }
}

function stop_sensors()
{
        sensors.Accelerometer.stop();
        sensors.AbsoluteOrientationSensor.stop();     //don't stop due to the delay in starting up
        sensors.Gyroscope.stop();
}

function reset_data()   //to be run every button press and release
{
        accelerationData = [];        //reset accelerationData every new button press
        accelerationnogData = [];        //reset accelerationnogData every new button press
        orientationData = [];        //reset orientationData every new button press
        rotationData = [];
}

function get_click(buttonID)    //ID not necessarily numerical
{
        if(!(sensors_started))
        {
                sensors = startSensors();
        }
        currentButton = buttonID;
        document.getElementById("bstate").textContent = `Button state (${currentButton})`;
        console.log(currentButton + ' pressed down');
        recording = true;
        reset_data();
        reading = setInterval(read_sensors, 1000/sensorfreq);     //start saving data from sensors in loop
}

function release()
{        
        clearInterval(reading); //stop saving data from sensors
        //save data to dataObject
        dataObject.button = currentButton;
        dataObject.acceleration = accelerationData;
        dataObject.accelerationnog = accelerationnogData;
        dataObject.orientation = orientationData;
        dataObject.rotation = rotationData;
        dataObject.frequency = sensorfreq;
        reset_data();
        var b = new Object;     //need to push by value
        Object.assign(b, dataObject);
        dataArray.push(b);
        console.log(currentButton + ' released');        
        currentButton = null;
        document.getElementById("bstate").textContent = `Button state (${currentButton})`;
        recording = false;
      try {
        //stop_sensors();
      } catch(err) { }

}

function store (key, data)   //currently uses LocalStorage, maybe should use something else?
{
        if (typeof(Storage) !== "undefined") 
        {
                localStorage.setItem(key, JSON.stringify(data));
                return 0;     
        } 
        else 
        {
                console.log('No LocalStorage support');
                return 1;
        }
}

function retrieve (key)
{
        return JSON.parse(localStorage.getItem(key));
}

function startSensors() {
        if(!(nosensors))
        {
                try {
                //Accelerometer including gravity
                accelerometer = new Accelerometer({ frequency: sensorfreq, includeGravity: true });
                sensors.Accelerometer = accelerometer;
                gravity =  new LowPassFilterData(accelerometer, 0.8);
                accelerometer.onchange = event => {
                        //accel = {x:1.1, y:2.2, z: 7.7}  //TESTI
                        accel = {x:accelerometer.x, y:accelerometer.y, z:accelerometer.z};
                        gravity.update(accel);
                        //console.log(gravity);
                        //console.log(accel);
                        accelNoG = {x:accel.x - gravity.x, y:accel.y - gravity.y, z:accel.z - gravity.z};
                }
                accelerometer.onerror = err => {
                  accelerometer = null;
                  console.log(`Accelerometer ${err.error}`)
                }
                accelerometer.start();
                //AbsoluteOrientationSensor
                absoluteorientationsensor = new AbsoluteOrientationSensor({ frequency: sensorfreq});
                sensors.AbsoluteOrientationSensor = absoluteorientationsensor;
                absoluteorientationsensor.onchange = event => {
                        absoluteorientationsensor.populateMatrix(orientationMat);
                }
                absoluteorientationsensor.onerror = err => {
                  absoluteorientationsensor = null;
                  console.log(`Absolute orientation sensor ${err.error}`)
                };
                absoluteorientationsensor.start();
                //Gyroscope
                gyroscope = new Gyroscope({ frequency: sensorfreq});
                sensors.Gyroscope = gyroscope;
                gyroscope.onchange = event => {
                        velGyro = {x:gyroscope.x, y:gyroscope.y, z:gyroscope.z};
                }
                gyroscope.onerror = err => {
                  gyroscope = null;
                  console.log(`Gyroscope ${err.error}`)
                };
                gyroscope.start();
                } catch(err) { console.log(err); }

                console.log("Started sensors: ");
                console.log(sensors);
                sensors_started = true;
                return sensors;
        }
        else
        {
                return null;    //here do something in order to be able to use on desktop with fake data...
        }
}

function read_sensors() //ran when a button is pressed, saves data gathered from sensors
{
        if (recording)
        {     
                console.log("Saving data from sensors");
                accelerationData.push(accel);
                accelerationnogData.push(accelNoG);
                //console.log("xAccel: " + accel.x + " yAccel: " + accel.y + " zAccel: " + accel.z);
                //console.log("xG: " + gravity.x + " yG: " + gravity.y + " zG: " + gravity.z);
                //console.log("xAccelNoG: " + accelNoG.x + " yAccelNoG: " + accelNoG.y + " zAccelNoG: " + accelNoG.z);
                rotationData.push(velGyro);
                orientationMatTemp = new Object;     //need to push orientation matrix by value
                Object.assign(orientationMatTemp, orientationMat);
                orientationData.push(orientationMatTemp);
                orientationMatTemp = null;
                //console.log("Orientation matrix: " + orientationMat);
        }
}

//TODO: Send data to a server to be processed
function send_data()    //https://stackoverflow.com/a/24468752
{
// Sending and receiving data in JSON format using POST mothod
//
var xhr = new XMLHttpRequest();
var url = "url";
xhr.open("POST", url, true);
xhr.setRequestHeader("Content-type", "application/json");
xhr.onreadystatechange = function () {
    if (xhr.readyState === 4 && xhr.status === 200) {
        var json = JSON.parse(xhr.responseText);
        console.log(json.email + ", " + json.password);
    }
};
var data = JSON.stringify({"email": "hey@mail.com", "password": "101010"});
//var data = JSON.stringify(localStorage.getItem(key));
xhr.send(data);
}
