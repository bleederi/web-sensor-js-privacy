console.log(5+6);

function get_click(buttonID)    //ID not necessarily numerical
{
        console.log(buttonID);
}

function store (data)
{
        if (typeof(Storage) !== "undefined") 
        {
                if ( typeof val === "undefined" ) 
                {
                        var value = this.getItem(key);
                        return value ? JSON.parse(value) : null;
                }
                else
                {
                        localStorage.setItem('data', JSON.stringify(data));
                }
            
        } 
        else 
        {
            console.log('No LocalStorage support'):
        }
}

var output = document.querySelector('.output');
if(window.deviceOrientationEvent)
{
	window.addEventListener('deviceorientation', function(event)
                {
                        console.log('Alpha(x): ' + event.alpha +  'Beta(y): ' + event.beta + 'Gamma(z): ' + event.gamma);
  output.innerHTML  = "beta : " + event.beta + "\n";
  output.innerHTML += "gamma: " + event.gamma + "\n";
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

}
//store(data):
