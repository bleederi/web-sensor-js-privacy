var output = document.querySelector('.output');
var dataArray = [];
var sensors = {};
var currentButton = null;
var test = null;                //testing variable
var accel = {x:null, y:null, z:null};
var accelNoG;
var recording = false;  //are we recording data or not?
var nosensors = false;  //for testing with fake values and without sensors


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
        normalize()
        {
                //normalize to "known value" 9.81 m/s^2
                let norm = Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);        
                this.x = 9.81 * this.x / norm;
                this.y = 9.81 * this.y / norm;
                this.z = 9.81 * this.z / norm;
        }
};

function magnitude(vector)      //Calculate the magnitude of a vector
{
return Math.sqrt(vector.x * vector.x + vector.y * vector.y + vector.z * vector.z);
}

function update_text()
{
if(accel)
{
document.getElementById("accl").textContent = "xAccel: " + accel.x.toFixed(3) + " yAccel: " + accel.y.toFixed(3) + " zAccel: " + accel.z.toFixed(3);
}
document.getElementById("accl_nog").textContent = "xAccelNoG: " + accelNoG.x.toFixed(3) + " yAccelNoG: " + accelNoG.y.toFixed(3) + " zAccelNoG: " + accelNoG.z.toFixed(3) + " Magnitude: " + magnitude(accelNoG).toFixed(3);

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
        console.log("GravityX: " + gravity.x);
        update_text();
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
        if(!(nosensors))
        {
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
        gravity =  new LowPassFilterData(sensors.Accelerometer, 0.8);   //GLOBAL
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
        else
        {
                return null;
        }
}

function read_sensors()
{
        if (currentButton)
        {
                sensors = startSensors();
               if(!(nosensors))
                { 
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
                        accel = {x:sensors.Accelerometer.x, y:sensors.Accelerometer.y, z:sensors.Accelerometer.z};
                                //let newAccel = accel;
                                accel = {x:1.1, y:2.2, z: 7.7}  //TESTI
                                //console.log(newAccel)
                                gravity.update(sensors.Accelerometer);
                                //gravity.normalize();
                                if (!(isNaN(gravity.x) && isNaN(gravity.y) && isNaN(gravity.z)))      //to prevent NaN
                                {
                                        accelNoG = {x:accel.x - gravity.x, y:accel.y - gravity.y, z:accel.z - gravity.z}
                                        console.log(`Isolated gravity (${gravity.x}, ${gravity.y}, ${gravity.z})`);
                                        document.getElementById("g_accl").textContent = `Isolated gravity (${gravity.x.toFixed(3)}, ${gravity.y.toFixed(3)}, ${gravity.z.toFixed(3)} (${magnitude(gravity).toFixed(3)}))`;
                                }
                                else
                                {
                                        console.log("Gravity NaN");
                                }
                                //console.log("xAccel: " + accel.x + " yAccel: " + accel.y + " zAccel: " + accel.z);
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
                        //console.log("Orientation matrix: " + orientationMat);
                      }
                      sensors.Gyroscope.onchange = event => {
                        var xVelGyro = sensors.Gyroscope.x;
                        var yVelGyro = sensors.Gyroscope.y;
                        var zVelGyro = sensors.Gyroscope.z;
                        //console.log("xVelGyro: " + xVelGyro + " yVelGyro: " + yVelGyro + " zVelGyro: " + zVelGyro);
                        };
                        return true;
                }
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
