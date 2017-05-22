console.log(5+6);
var output = document.querySelector('.output');
var dataArray = [];
var i = dataArray.length;      //index to track amount of data points
var sensors = [];
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
console.log("Orientation matrix: " + orientationMat);

function get_click(buttonID)    //ID not necessarily numerical
{
        currentButton = buttonID;
        console.log(buttonID);
        test = read_sensors();
        console.log(test);
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
        sensors[0].stop();
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
        sensors[0] = accelerometer;
        sensors[0].start();
        sensors[0].onerror = err => {
          sensors[0] = null;
          console.log(`Accelerometer ${err.error}`)
        };
        let absoluteorientationsensor = new AbsoluteOrientationSensor({ frequency: 60, includeGravity: true });
        sensors[1] = absoluteorientationsensor;
        sensors[1].start();
        sensors[1].onerror = err => {
          sensors[1] = null;
          console.log(`Absolute orientation sensor ${err.error}`)
        };
      } catch(err) { }

        /*
        var sensor = new Accelerometer();
        sensor.start();
        sensor.onchange = event => {
                let xAccel = sensor.x;
                let yAccel = sensor.y;
                let zAccel = sensor.z;
                console.log("xAccel:" + xAccel + "yAccel: " + yAccel + "zAccel: " + zAccel);
        }
        */

        console.log("Started sensors: " + sensors);
        console.log(sensors[0], sensors[1]);
        return sensors;
}

function read_sensors()
{
        sensors = startSensors();
      if (!(sensors[0] || sensors[1])) {
        console.error('Requires accelerometer and absolute orientation sensor');
        return false;
      }      
        console.log("Sensors to be read: " + sensors);
      sensors[0].onchange = event => {
        let xAccel = sensors[0].y;
        let yAccel = sensors[0].x;
        let zAccel = sensors[0].z;
        console.log("xAccel: " + xAccel + " yAccel: " + yAccel + " zAccel: " + zAccel);
        }   
        sensors[1].onchange = event => {
        sensors[1].populateMatrix(orientationMat);
        console.log("Orientation matrix: " + orientationMat);
      };
        return true;
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
