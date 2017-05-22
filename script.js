console.log(5+6);
var output = document.querySelector('.output');
var dataArray = [];
var i = dataArray.length;      //index to track amount of data points

function get_click(buttonID)    //ID not necessarily numerical
{
        console.log(buttonID);
        dataArray.push(buttonID);        
        store('dataArray', dataArray);
        console.log(retrieve('dataArray'));
        console.log(buttonID.length);
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

        }
}

function store (key, data)   //currently uses LocalStorage, maybe should use something else?
{
        if (typeof(Storage) !== "undefined") 
        {
                        localStorage.setItem(key, JSON.stringify(data));
            
        } 
        else 
        {
            console.log('No LocalStorage support');
        }
}

function retrieve (key)
{
        return JSON.parse(localStorage.getItem(key));
}

//store(data);
