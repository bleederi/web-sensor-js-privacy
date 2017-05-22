console.log(5+6);
var output = document.querySelector('.output');
var dataArray = [];
var i = dataArray.length;      //index to track amount of data points
var test = null;                //testing variable

function get_click(buttonID)    //ID not necessarily numerical
{
        console.log(buttonID);
        dataArray.push(buttonID);        
        store('dataArray', dataArray);
        console.log(retrieve('dataArray'));
        test = read_sensors();
        console.log(test);
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

function startSensors(...requiredSensors) {     //from websensor-compass
        if(!this.sensors)
        {
                return false;
        }
      for (let sensor of requiredSensors) {
        if (!this.sensors[sensor]) {
          return false;
        }
      }
      for (let sensor of requiredSensors) {
        if (this.sensors[sensor].activated == false) {
          this.sensors[sensor].start();
        }
      }
      return true;
    }

function read_sensors()
{
      if (!startSensors("Gyroscope",  "Accelerometer", "AbsoluteOrientationSensor")) {
        console.error('Requires gyroscope, accelerometer and absolute orientation sensor');
        return false;
      }
      this.sensors.Accelerometer.onchange = event => {
        let xAccel = this.sensors.Accelerometer.y;
        let yAccel = this.sensors.Accelerometer.x;
        let zAccel = this.sensors.Accelerometer.z;
        console.log(xAccel, yAccel, zAccel);
        }
        return xAccel;
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
