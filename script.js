var output = document.querySelector('.output');
var dataArray = [];
var sensors = {};
var currentButton = null;
var test = null;                //testing variable
var gravity = null;
var accelNoG = null;


//TODO: How to get acceleration without gravity?


class LowPassFilterData {       //https://w3c.github.io/motion-sensors/#pass-filters
  constructor(reading, bias) {
    Object.assign(this, { x: reading.x, y: reading.y, z: reading.z });
    this.bias = bias;
  }

  update(reading) {
    this.x = this.x * this.bias + reading.x * (1 - this.bias);
    this.y = this.y * this.bias + reading.y * (1 - this.bias);
    this.z = this.z * this.bias + reading.z * (1 - this.bias);
  }
};

function update_text()
{
document.getElementById("g_accl").textContent = "xG: " + gravity.x + " yG: " + gravity.y + " zG: " + gravity.z;
document.getElementById("accl_nog").textContent = "xAccelNoG: " + accelNoG.x + " yAccelNoG: " + accelNoG.y + " zAccelNoG: " + accelNoG.z;

}


//create orientation matrix
function matrix( rows, cols, defaultValue){ //http://stackoverflow.com/a/18116922

  var arr = [];

  // Creates all lines:
  for(var i=0; i < rows; i++){

      // Creates an empty line
      arr.push([]);

      // Adds cols to the empty line:
      arr[i].push( new Array(cols));

      for(var j=0; j < cols; j++){
        // Initializes:
        arr[i][j] = defaultValue;
      }
  }

return arr;
}
var orientationMat = new Float64Array([1,2,3,4,5,6,7,8,9,0,1,2,3,4,5,6]);     //device orientation
//console.log("Orientation matrix: " + orientationMat);

function get_click(buttonID)    //ID not necessarily numerical
{
        currentButton = buttonID;
        console.log(buttonID);
        test = read_sensors();
        setInterval(update_text, 1000); //for debugging purposes, can't continuously update text
        //console.log(test);
}

function release()
{        
        console.log(currentButton);
        dataArray.push(currentButton);        
        store('dataArray', dataArray);
        //console.log(retrieve('dataArray'));
        currentButton = null;
        console.log('release');
      try {
        //sensors.LinearAccelerationSensor.stop();
        //sensors.GravitySensor.stop();
        //sensors.Accelerometer.stop();
        //sensors.AccelerometerNoG.stop();
        sensors.AbsoluteOrientationSensor.stop();
        sensors.Gyroscope.stop();
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
      try {
        /*
        //Linear acceleration sensor (no gravity)
        let linearaccelerationsensor = new LinearAccelerationSensor({ frequency: 60, includeGravity: true });
        sensors.LinearAccelerationSensor = linearaccelerationsensor;
        sensors.LinearAccelerationSensor.start();
        sensors.LinearAccelerationSensor.onerror = err => {
          sensors.LinearAccelerationSensor = null;
          console.log(`LinearAccelerationSensor ${err.error}`)
        };
        */
/*
        //GravitySensor
        let gravitysensor = new GravitySensor({ frequency: 60});
        sensors.GravitySensor = gravitysensor;
        sensors.GravitySensor.start();
        sensors.GravitySensor.onerror = err => {
          sensors.GravitySensor = null;
          console.log(`GravitySensor ${err.error}`)
        };        
*/
        //Accelerometer including gravity
        var accelerometer = new Accelerometer({ frequency: 60, includeGravity: true });
        sensors.Accelerometer = accelerometer;
        sensors.Accelerometer.start();
        gravity = new LowPassFilterData(sensors.Accelerometer, 0.8);
        sensors.Accelerometer.onerror = err => {
          sensors.Accelerometer = null;
          console.log(`Accelerometer ${err.error}`)
        };
/*        
        //Accelerometer not including gravity
        let accelerometernog = new Accelerometer({ frequency: 60, includeGravity: false });
        sensors.AccelerometerNoG = accelerometernog;
        sensors.AccelerometerNoG.start();
        sensors.AccelerometerNoG.onerror = err => {
          sensors.AccelerometerNoG = null;
          console.log(`AccelerometerNoG ${err.error}`)
        };
*/
        //AbsoluteOrientationSensor
        let absoluteorientationsensor = new AbsoluteOrientationSensor({ frequency: 60});
        sensors.AbsoluteOrientationSensor = absoluteorientationsensor;
        sensors.AbsoluteOrientationSensor.start();
        sensors.AbsoluteOrientationSensor.onerror = err => {
          sensors.AbsoluteOrientationSensor = null;
          console.log(`Absolute orientation sensor ${err.error}`)
        };
        //Gyroscope
        let gyroscope = new Gyroscope({ frequency: 60});
        sensors.Gyroscope = gyroscope;
        sensors.Gyroscope.start();
        sensors.Gyroscope.onerror = err => {
          sensors.Gyroscope = null;
          console.log(`Gyroscope ${err.error}`)
        };
/*
       let orientationsensor = new OrientationSensor({ frequency: 60});
        sensors[1] = orientationsensor;
        sensors[1].start();
        sensors[1].onerror = err => {
          sensors[1] = null;
          console.log(`Orientation sensor ${err.error}`)
        };
*/
      } catch(err) { console.log(err); }

        console.log("Started sensors: " + sensors);
        console.log(sensors);
        return sensors;
}

function read_sensors()
{
        if (currentButton)
        {
                sensors = startSensors();
                
              if (!(sensors.Accelerometer || sensors.AbsoluteOrientationSensor)) {
                console.error('Requires linear acceleration sensor, accelerometer and absolute orientation sensor');
                return false;
              }      
                console.log("Sensors to be read: " + sensors);
              //sensors.LinearAccelerationSensor.onchange = event => {
              //  let xAccelLin = sensors.LinearAccelerationSensor.y;
              //  let yAccelLin = sensors.LinearAccelerationSensor.x;
              //  let zAccelLin = sensors.LinearAccelerationSensor.z;
              //  console.log("xAccelLin: " + xAccelLin + " yAccelLin: " + yAccelLin + " zAccelLin: " + zAccelLin);
              //  } 
/*
              sensors.GravitySensor.onchange = event => {
                let xAccelG = sensors.GravitySensor.x;
                let yAccelG = sensors.GravitySensor.y;
                let zAccelG = sensors.GravitySensor.z;
                console.log("xAccelG: " + xAccelG + " yAccelG: " + yAccelG + " zAccelG: " + zAccelG);
                }
*/
              sensors.Accelerometer.onchange = event => {
                var xAccel = sensors.Accelerometer.x;
                var yAccel = sensors.Accelerometer.y;
                var zAccel = sensors.Accelerometer.z;
                var newAccel = {x:xAccel, y:yAccel, z:zAccel};
                //console.log(newAccel)
                gravity.update(newAccel);
                accelNoG = {x:xAccel - gravity.x, y:yAccel - gravity.y, z:zAccel - gravity.z}
                //console.log("xAccel: " + xAccel + " yAccel: " + yAccel + " zAccel: " + zAccel);
                //console.log("xG: " + gravity.x + " yG: " + gravity.y + " zG: " + gravity.z);
                //console.log("xAccelNoG: " + accelNoG.x + " yAccelNoG: " + accelNoG.y + " zAccelNoG: " + accelNoG.z);
                } 
/*
              sensors.AccelerometerNoG.onchange = event => {
                let xAccelNoG = sensors.AccelerometerNoG.x;
                let yAccelNoG = sensors.AccelerometerNoG.y;
                let zAccelNoG = sensors.AccelerometerNoG.z;
                console.log("xAccelNoG: " + xAccelNoG + " yAccelNoG: " + yAccelNoG + " zAccelNoG: " + zAccelNoG);
                }
*/
                sensors.AbsoluteOrientationSensor.onchange = event => {
                sensors.AbsoluteOrientationSensor.populateMatrix(orientationMat);
                console.log("Orientation matrix: " + orientationMat);
              }
              sensors.Gyroscope.onchange = event => {
                var xVelGyro = sensors.Gyroscope.x;
                var yVelGyro = sensors.Gyroscope.y;
                var zVelGyro = sensors.Gyroscope.z;
                console.log("xVelGyro: " + xVelGyro + " yVelGyro: " + yVelGyro + " zVelGyro: " + zVelGyro);
                };
                return true;
        }
}

//below uses Screen Orientation API
/*
if(window.deviceOrientationEvent)
{
        window.addEventListener('deviceorientation', function(event)
                {
                        console.log('Alpha(x): ' + event.alpha +  'Beta(y): ' + event.beta + 'Gamma(z): ' + event.gamma);
                        output.innerHTML  = "beta : " + event.beta + "\n";
                        output.innerHTML += "gamma: " + event.gamma + "\n";
                        //data = ...;
                }
        );
}
if(window.DeviceMotionEvent)
{
        window.addEventListener('devicemotion', function(event)
	        {
		        var acceleration = event.acceleration;
  		        var rotationRate = event.rotationRate;
	                var gacc = event.accelerationIncludingGravity;
	          
	                console.log(acceleration.x + ' : ' + acceleration.y + ' : ' + acceleration.z);
                        console.log(event.acceleration + ' : ' + event.rotationRate + ' : ' + event.interval);
                        console.log(rotationRate.alpha + ' : ' + rotationRate.beta + ' : ' + rotationRate.gamma);
                        //console.log(gacc.x + ' : ' + gacc.y + ' : ' + gacc.z);
                        //data = ...                        
	        }
        );

}*/
//store(data);
