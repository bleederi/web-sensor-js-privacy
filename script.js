var output = document.querySelector('.output');
var dataArray = [];
var i = dataArray.length;      //index to track amount of data points
var sensors = [];
var sensors2 = {};
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
        sensors2.Accelerometer.stop();
        sensors2.AbsoluteOrientationSensor.stop();
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
        sensors[0] = null;
        sensors[1] = null;
        let accelerometer = new Accelerometer({ frequency: 60, includeGravity: true });
        //sensors[0] = accelerometer;
        sensors2.Accelerometer = accelerometer;
        //sensors[0].start();
        sensors2.Accelerometer.start();
        sensors2.Accelerometer.onerror = err => {
          sensors2.Accelerometer = null;
          console.log(`Accelerometer ${err.error}`)
        };
        //AbsoluteOrientationSensor
        let absoluteorientationsensor = new AbsoluteOrientationSensor({ frequency: 60});
        sensors2.AbsoluteOrientationSensor = absoluteorientationsensor;
        sensors2.AbsoluteOrientationSensor.start();
        sensors2.AbsoluteOrientationSensor.onerror = err => {
          sensors2.AbsoluteOrientationSensor = null;
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

        console.log("Started sensors: " + sensors2);
        //console.log(sensors[0], sensors[1]);
        console.log(sensors2);
        return sensors2;
}

function read_sensors()
{
        if (currentButton)
        {
                sensors = startSensors();
                /*
              if (!(sensors[0] || sensors[1])) {
                console.error('Requires accelerometer and absolute orientation sensor');
                return false;
              }      
                console.log("Sensors to be read: " + sensors);
                */
              sensors2.Accelerometer.onchange = event => {
                let xAccel = sensors2.Accelerometer.y;
                let yAccel = sensors2.Accelerometer.x;
                let zAccel = sensors2.Accelerometer.z;
                console.log("xAccel: " + xAccel + " yAccel: " + yAccel + " zAccel: " + zAccel);
                } 
                sensors2.AbsoluteOrientationSensor.onchange = event => {
                sensors2.AbsoluteOrientationSensor.populateMatrix(orientationMat);
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
