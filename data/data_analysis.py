import json
import numpy
import math
from collections import OrderedDict

def convert_orientation(jsondata):      #Convert orientation matrix to Euler angles
        orientationjsondata = []        #New JSON data with orientation converted to Euler angles
        for buttonpress in jsondata[1:2]:
                if(buttonpress['button'] !=  None):     #skip bad values
                        orientationdict = {}      #Dict (JSON data) for a button press with orientation converted
                        for key, value in buttonpress.items():
                                if(key != 'orientation'):
                                        orientationdict[key] = value
                                else:   #Here convert orientation
                                        for orimatrix in value:  #Each orientation matrix
                                                #print(orivalue)
                                                r11 = orimatrix['0']
                                                r21 = orimatrix['4']
                                                r31 = orimatrix['8']
                                                r32 = orimatrix['9']
                                                r33 = orimatrix['10']
                                                print(r11, r21, r31, r32, r33)
                                                alpha = math.atan2(r21, r11)
                                                print(alpha)
        #beta = atan2(-r31/(math.sqrt(math.pow(r32,2) + math.pow(r33,2))))
        #gamma = atan(r32/r33)
        #R = orientation matrix
        """
        assert(isRotationMatrix(R))

        sy = math.sqrt(R[0,0] * R[0,0] +  R[1,0] * R[1,0])

        singular = sy < 1e-6

        if  not singular :
        x = math.atan2(R[2,1] , R[2,2])
        y = math.atan2(-R[2,0], sy)
        z = math.atan2(R[1,0], R[0,0])
        else :
        x = math.atan2(-R[1,2], R[1,1])
        y = math.atan2(-R[2,0], sy)
        z = 0

        return np.array([x, y, z])
        """
        return jsondata
def remove_initial(jsondata):   #Do operations on JSON formatted data
        cancelledjsondata = [] #New JSON data with the effect of initial position and orientation cancelled
        for buttonpress in jsondata:
                if(buttonpress['button'] !=  None):     #skip bad values
                        cancelleddict = {}      #Dict (JSON data) for a button press with the effect of initial position and orientation cancelled
                        for key, value in buttonpress.items():
                                if key == 'button' or key == 'frequency':
                                        cancelleddict[key] = value
                                #Cancel out effect of initial position and orientation
                                if key != 'button' and key != 'frequency':
                                        i = 0
                                        cancelleddict[key] = []
                                        if(key == 'acceleration'):
                                                while(value[i] == None):
                                                        i = i + 1
                                                initialvalue = value[i]
                                                for accvalue in value:
                                                        acc_c = {key: accvalue[key] - initialvalue.get(key, 0) for key in accvalue.keys()}
                                                        cancelleddict[key].append(acc_c)
                                        if(key == 'accelerationnog'):
                                                while(value[i] == None):
                                                        i = i + 1
                                                initialvalue = value[i]
                                                for accnogvalue in value:
                                                        accnog_c = {key: accnogvalue[key] - initialvalue.get(key, 0) for key in accnogvalue.keys()}
                                                        cancelleddict[key].append(accnog_c)
                                        if(key == 'orientation'):
                                                while(value[i] == None):
                                                        i = i + 1
                                                initialvalue = value[i]
                                                for orientationvalue in value:
                                                        orientationd = {key: orientationvalue[key] - initialvalue.get(key, 0) for key in orientationvalue.keys()}
                                                        cancelleddict[key].append(orientationd)           
                                        if(key == 'rotation'):
                                                while(value[i] == None):
                                                        i = i + 1
                                                initialvalue = value[i]
                                                for rotationvalue in value[i:]:
                                                        rotationd = {key: rotationvalue[key] - initialvalue.get(key, 0) for key in rotationvalue.keys()}
                                                        cancelleddict[key].append(rotationd)           
                        cancelledjsondata.append(cancelleddict)
        return cancelledjsondata

def calc_derivative(jsondata): #Function to calculate derivative sequence of each sequence and add that to the JSON formatted data
        jsondata_withderivative = [] #New JSON data with the derivative sequences added
        for buttonpress in jsondata:
                if(buttonpress['button'] !=  None):     #skip bad values
                        derivativedict = {}      #Dict (JSON data) for a button press with the derivative sequences added
                        #Add derivative sequences
                        for key, value in buttonpress.items():
                                derivativedict[key] = value     #Recreate the original dict, below add the derivative sequences
                                if(key == 'acceleration' or key == 'accelerationnog' or key == 'orientation' or key == 'rotation'):
                                        derivativedict[key + '_d'] = []   #Derivative sequence
                                        for i in value:
                                                if(value.index(i) == 0): #First value special case: always 0
                                                        der = {key: 0 for key in i.keys()}
                                                else:
                                                        der = {key: i[key] - previous.get(key, 0) for key in i.keys()}
                                                previous = der
                                                derivativedict[key + '_d'].append(der)
                        jsondata_withderivative.append(derivativedict)
        return jsondata_withderivative

def calc_dac(jsondata): #Function to calculate DAC of acceleration data and add that to the JSON formatted data
        jsondata_withdac = []
        for buttonpress in jsondata:
                if(buttonpress['button'] !=  None):     #skip bad values
                        dacdict = {}      #Dict (JSON data) for a button press with the DAC sequence added
                        #Add derivative sequences
                        for key, value in buttonpress.items():
                                dacdict[key] = value     #Recreate the original dict, below add the DAC sequence
                                if(key == 'acceleration'):
                                        dacdict['dac'] = []   #DAC sequence
                                        for accvalue in value:
                                                if(value.index(accvalue) == 0): #First value special case: always 0
                                                        dac = 0
                                                else:
                                                        #print("Current: ", accvalue)
                                                        #print("Previous: ", previous)
                                                        #Calculate Euclidean distance of current-previous
                                                        dac = math.sqrt(math.pow(accvalue['x']-previous['x'], 2) + math.pow(accvalue['y']-previous['y'], 2) + math.pow(accvalue['z']-previous['z'], 2))
                                                previous = accvalue
                                                dacdict['dac'].append(dac)
                                                #print("Added ", dac)
                        jsondata_withdac.append(dacdict)
        return jsondata_withdac

def calc_stats(jsondata):       #Function to obtain statistical features of the button press data
        for buttonpress in jsondata:
                if(buttonpress['button'] !=  None):     #skip bad values
                        statsdict = {}      #Dict (JSON data) for the statistics of a button press
                        for key, value in buttonpress.items():
                                if key != 'button' and key != 'frequency':
                                        #Calculate maximums
                                        statsdict[key + '_max'] = []
                                        for i in value:
                                                maxdict = {}    #Dict to store max values of a single sequence
                                                #print(i)
        return statsdict

def calc_fft(jsondata): #Function to calculate FFT of each sequence and add that to the JSON formatted data
        jsondata_withfft = jsondata
        return jsondata_withfft

filename = 'moredata'
datafile = open(filename,'r')
jsondata = json.load(datafile)
"""
for buttonpress in jsondata:    ##Loop through all the button presses
        print("Button: ", buttonpress['button'])
                 
        #print("FFT:", numpy.fft(buttonpress['']));
"""
orientationdata = convert_orientation(jsondata)
#print(orientationdata)
noninitialdata = remove_initial(jsondata)
#print("New dict:", noninitialdata)
derivativedata = calc_derivative(noninitialdata)
#print("New dict:", derivativedata)
datawithdac = calc_dac(derivativedata)
#print(datawithdac)
statsdict = calc_stats(datawithdac)
#print(statsdict)

"""
for buttonpress in datawithdac:    ##Loop through all the button presses
        print("New button: ", buttonpress['button'])
        for key in buttonpress:
                print(key)                
                print(buttonpress[key])
"""
#print("All available features: ", datawithdac[0].keys())
#print("Features per sensor reading:", len(datawithdac[0].keys()) - 2)

