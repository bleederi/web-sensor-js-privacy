var output = document.querySelector('.output');
var dataArray = [];
var sensors = {};
var currentButton = null;
var test = null;                //testing variable


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
        //console.log(test);
}

function release()
{        
        console.log(currentButton);
        dataArray.push(currentButton);        
        store('dataArray', dataArray);
        console.log(retrieve('dataArray'));
        currentButton = null;
        console.log('release');
      try {
        for sensor in sensors
        {
        sensor.stop();
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
        //Linear acceleration sensor (no gravity)
        //let linearaccelerationsensor = new LinearAccelerationSensor({ frequency: 60, includeGravity: true });
        //sensors.LinearAccelerationSensor = linearaccelerationsensor;
        //sensors.LinearAccelerationSensor.start();
        //sensors.LinearAccelerationSensor.onerror = err => {
        //  sensors.LinearAccelerationSensor = null;
        //  console.log(`LinearAccelerationSensor ${err.error}`)
        //};
        //Accelerometer including gravity
        let accelerometer = new Accelerometer({ frequency: 60, includeGravity: true });
        sensors.Accelerometer = accelerometer;
        sensors.Accelerometer.start();
        sensors.Accelerometer.onerror = err => {
          sensors.Accelerometer = null;
          console.log(`Accelerometer ${err.error}`)
        };
        //AbsoluteOrientationSensor
        let absoluteorientationsensor = new AbsoluteOrientationSensor({ frequency: 60});
        sensors.AbsoluteOrientationSensor = absoluteorientationsensor;
        sensors.AbsoluteOrientationSensor.start();
        sensors.AbsoluteOrientationSensor.onerror = err => {
          sensors.AbsoluteOrientationSensor = null;
          console.log(`Absolute orientation sensor ${err.error}`)
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
      } catch(err) { }

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
              sensors.Accelerometer.onchange = event => {
                let xAccel = sensors.Accelerometer.y;
                let yAccel = sensors.Accelerometer.x;
                let zAccel = sensors.Accelerometer.z;
                console.log("xAccel: " + xAccel + " yAccel: " + yAccel + " zAccel: " + zAccel);
                } 
                sensors.AbsoluteOrientationSensor.onchange = event => {
                sensors.AbsoluteOrientationSensor.populateMatrix(orientationMat);
                console.log("Orientation matrix: " + orientationMat);
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
