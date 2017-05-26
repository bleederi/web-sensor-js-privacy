import json
import numpy
import math
from collections import OrderedDict

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
                #print("NEW BUTTON \n")
                #print(buttonpress)
                if(buttonpress['button'] !=  None):     #skip bad values
                        derivativedict = {}      #Dict (JSON data) for a button press with the derivative sequences added
                        #Add derivative sequences
                        for key, value in buttonpress.items():
                                derivativedict[key] = value     #Recreate the original dict, below add the derivative sequences
                                if(key == 'acceleration'):
                                        derivativedict['acceleration_d'] = []   #Derivative sequence for acceleration
                                        for accvalue in value:
                                                if(value.index(accvalue) == 0): #First value special case: always 0
                                                        acc_d = {key: 0 for key in accvalue.keys()}
                                                else:
                                                        #print("Current: ", accvalue)
                                                        #print("Previous: ", acc_d)
                                                        acc_d = {key: accvalue[key] - previous.get(key, 0) for key in accvalue.keys()}
                                                previous = acc_d
                                                derivativedict['acceleration_d'].append(acc_d)
                                                #print("Added ", acc_d)
                                if(key == 'accelerationnog'):
                                        derivativedict['accelerationnog_d'] = []   #Derivative sequence for acceleration without gravity
                                        for accnogvalue in value:
                                                if(value.index(accnogvalue) == 0): #First value special case: always 0
                                                        accnog_d = {key: 0 for key in accnogvalue.keys()}
                                                else:
                                                        accnog_d = {key: accnogvalue[key] - previous.get(key, 0) for key in accnogvalue.keys()}
                                                previous = accnog_d
                                                derivativedict['accelerationnog_d'].append(accnog_d)
                                if(key == 'orientation'):
                                        derivativedict['orientation_d'] = []   #Derivative sequence for orientation
                                        for orientationvalue in value:
                                                if(value.index(orientationvalue) == 0): #First value special case: always 0
                                                        orientation_d = {key: 0 for key in orientationvalue.keys()}
                                                else:
                                                        orientation_d = {key: orientationvalue[key] - previous.get(key, 0) for key in orientationvalue.keys()}
                                                previous = orientation_d
                                                derivativedict['orientation_d'].append(orientation_d)
                                if(key == 'rotation'):
                                        derivativedict['rotation_d'] = []   #Derivative sequence for rotation
                                        for rotationvalue in value:
                                                if(value.index(rotationvalue) == 0): #First value special case: always 0
                                                        rotation_d = {key: 0 for key in rotationvalue.keys()}
                                                else:
                                                        rotation_d = {key: rotationvalue[key] - previous.get(key, 0) for key in rotationvalue.keys()}
                                                previous = rotation_d
                                                derivativedict['rotation_d'].append(rotation_d)
                        #print("Button press with derivative sequences", derivativedict)
                        jsondata_withderivative.append(derivativedict)
        return jsondata_withderivative

def calc_dac(jsondata): #Function to calculate DAC of acceleration data and add that to the JSON formatted data
        jsondata_withdac = []
        for buttonpress in jsondata[:1]:
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
                                                        print("Current: ", accvalue)
                                                        print("Previous: ", previous)
                                                        #Calculate Euclidean distance of current-previous
                                                        dac = math.sqrt(math.pow(accvalue['x']-previous['x'], 2) + math.pow(accvalue['y']-previous['y'], 2) + math.pow(accvalue['z']-previous['z'], 2))
                                                previous = accvalue
                                                dacdict['dac'].append(dac)
                                                #print("Added ", dac)
                        jsondata_withdac.append(dacdict)
        return jsondata_withdac

def calc_stats(jsondata):       #Function to obtain statistical features of the button press data
        return jsondata

def calc_fft(jsondata): #Function to calculate FFT of each sequence and add that to the JSON formatted data
        jsondata_withfft = jsondata
        return jsondata_withfft

filename = 'exampledata_best'
datafile = open(filename,'r')
jsondata = json.load(datafile, object_pairs_hook=OrderedDict)
"""
for buttonpress in jsondata:    ##Loop through all the button presses
        print("Button: ", buttonpress['button'])
                 
        #print("FFT:", numpy.fft(buttonpress['']));
"""
noninitialdata = remove_initial(jsondata)
#print("New dict:", noninitialdata)
derivativedata = calc_derivative(noninitialdata)
#print("New dict:", derivativedata)
datawithdac = calc_dac(derivativedata)
#print(datawithdac)

for buttonpress in datawithdac:    ##Loop through all the button presses
        print("New button: ", buttonpress['button'])
        for key in buttonpress:
                print(key)                
                print(buttonpress[key])

print("All available features: ", datawithdac[0].keys())
print("Features per sensor reading:", len(datawithdac[0].keys()) - 2)

