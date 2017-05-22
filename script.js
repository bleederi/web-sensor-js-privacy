console.log(5+6);
var output = document.querySelector('.output');
var dataArray = [];
var i = dataArray.length;      //index to track amount of data points
var sensors = [];
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

function startSensors() {       //from websensor-compass
        try 
        {
        var sensor = new Accelerometer();
        sensor.start();
        sensor.onchange = event => {
                        let xAccel = sensor.x;
                        let yAccel = sensor.y;
                        let zAccel = sensor.z;
                        console.log(xAccel);

                        // Treat the acceleration vector as an orientation vector by normalizing it.
                        // Keep in mind that the if the device is flipped, the vector will just be
                        // pointing in the other direction, so we have no way to know from the
                        // accelerometer data what way the device is oriented.
                        let norm = Math.sqrt(xAccel ** 2 + yAccel ** 2 + zAccel ** 2);

                        // As we only can cover half of the spectrum we multiply the unit vector
                        // with 90 so that it coveres the -90 to 90 degrees (180 degrees in total).
                        this.beta = (xAccel / norm) * 90;
                        this.gamma = (yAccel / norm) * - 90;
                        this.alpha = 0;
        }
        catch(err)
        {
        console.error(err);
        }
        if (!sensor)
        {
        console.error("Requires accelerometer");
        }
                }
}

function read_sensors()
{
      if (!startSensors()) {
        console.error('Requires gyroscope and accelerometer');
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
