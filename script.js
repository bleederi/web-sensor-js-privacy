console.log(5+6);
var output = document.querySelector('.output');
var dataArray = [];
var i = dataArray.length;      //index to track amount of data points
var sensors = [];
var test = null;                //testing variable

window.addEventListener('load', function(){
 
        var buttons = document.getElementById('buttons1')
        var statusdiv = document.getElementById('statusdiv')
        var startx = 0
        var dist = 0
 
    buttons.addEventListener('touchstart', function(e){
        var touchobj = e.changedTouches[0] // reference first touch point (ie: first finger)
        startx = parseInt(touchobj.clientX) // get x position of touch point relative to left edge of browser
        statusdiv.innerHTML = 'Status: touchstart<br> ClientX: ' + startx + 'px'
        console.log(startx);
        e.preventDefault()
    }, false)
 
        buttons.addEventListener('touchmove', function(e){
        var touchobj = e.changedTouches[0] // reference first touch point for this event
        var dist = parseInt(touchobj.clientX) - startx
        statusdiv.innerHTML = 'Status: touchmove<br> Horizontal distance traveled: ' + dist + 'px'
        e.preventDefault()
    }, false)
 
    buttons.addEventListener('touchend', function(e){
        var touchobj = e.changedTouches[0] // reference first touch point for this event
        statusdiv.innerHTML = 'Status: touchend<br> Resting x coordinate: ' + touchobj.clientX + 'px'
        e.preventDefault()
    }, false)
 
}, false)


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

function startSensors() {

      try {
        sensors[0] = null;
        let accelerometer = new Accelerometer({ frequency: 1, includeGravity: true });
        sensors[0] = accelerometer;
        sensors[0].start();
        sensors[0].onerror = err => {
          sensors[0] = null;
          console.log(`Accelerometer ${err.error}`)
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
        console.log(sensors[0]);
        return sensors;
}

function read_sensors()
{
        sensors = startSensors();
      if (!sensors[0]) {
        console.error('No accelerometer');
        return false;
      }
        console.log("Sensors to be read: " + sensors);
      sensors[0].onchange = event => {
        let xAccel = sensors[0].y;
        let yAccel = sensors[0].x;
        let zAccel = sensors[0].z;
        console.log(xAccel, yAccel, zAccel);
        }
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
