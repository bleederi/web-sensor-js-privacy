import json
import numpy
import math
from collections import OrderedDict

def convert_orientation(jsondata):      #Convert orientation matrix to Euler angles
        orientationjsondata = []        #New JSON data with orientation converted to Euler angles
        for buttonpress in jsondata:
                if(buttonpress['button'] !=  None):     #skip bad values
                        orientationdict = {}      #Dict (JSON data) for a button press with orientation converted
                        for key, value in buttonpress.items():
                                if(key != 'orientation'):
                                        orientationdict[key] = value
                                else:   #Here convert orientation
                                        orientationdict[key] = []
                                        for orimatrix in value:  #Each orientation matrix
                                                tempdict = {}   #Temp dict to store Euler angle values
                                                #print(orivalue)
                                                r11 = orimatrix['0']
                                                r21 = orimatrix['4']
                                                r31 = orimatrix['8']
                                                r32 = orimatrix['9']
                                                r33 = orimatrix['10']
                                                #print(r11, r21, r31, r32, r33)
                                                betadivisor = math.sqrt(math.pow(r32,2) + math.pow(r33,2))
                                                if(r11 != 0 and r33 != 0 and betadivisor != 0): #Can't divide by zero
                                                        alpha = math.atan2(r21, r11)
                                                        beta = math.atan2(-r31, (math.sqrt(math.pow(r32,2) + math.pow(r33,2))))
                                                        gamma = math.atan2(r32, r33)
                                                        #print(alpha, beta, gamma)
                                                tempdict = {'alpha': alpha, 'beta': beta, 'gamma': gamma}
                                                orientationdict['orientation'].append(tempdict)
                orientationjsondata.append(orientationdict)
        return orientationjsondata
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
                                        while(value[i] == None):
                                                i = i + 1
                                        initialvalue = value[i]
                                        if(key == 'acceleration'):
                                                for accvalue in value:
                                                        acc_c = {key: accvalue[key] - initialvalue.get(key, 0) for key in accvalue.keys()}
                                                        cancelleddict[key].append(acc_c)
                                        if(key == 'accelerationnog'):
                                                for accnogvalue in value:
                                                        accnog_c = {key: accnogvalue[key] - initialvalue.get(key, 0) for key in accnogvalue.keys()}
                                                        cancelleddict[key].append(accnog_c)
                                        if(key == 'orientation'):
                                                for orientationvalue in value:
                                                        orientationd = {key: orientationvalue[key] - initialvalue.get(key, 0) for key in orientationvalue.keys()}
                                                        cancelleddict[key].append(orientationd)           
                                        if(key == 'rotation'):
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
                        jsondata_withdac.append(dacdict)
        return jsondata_withdac

def calc_stats(jsondata):       #Function to obtain statistical features of the button press data
        statsdict = []      #List for the statistics of a button press
        for buttonpress in jsondata:
                if(buttonpress['button'] !=  None):     #skip bad values
                        buttonstats = {}        #Dict of all statistics related to one button press
                        for key, value in buttonpress.items():
                                if key == 'button' or key == 'frequency':
                                        buttonstats[key] = value
                                if key != 'button' and key != 'frequency':
                                        #Calculate maximums
                                        buttonstats[key + '_max'] = []
                                        #print(key, value)
                                        if (key == 'acceleration' or key == 'accelerationnog' or key == 'rotation' or key == 'acceleration_d' or key == 'accelerationnog_d' or key == 'rotation_d'):
                                                #print(value)                                                        
                                                max_x = value[0]['x']
                                                max_y = value[0]['y']
                                                max_z = value[0]['z']
                                                for i in value: #i is a sensor reading
                                                        if(value[value.index(i)]['x'] > max_x):
                                                                max_x = value[value.index(i)]['x']
                                                        if(value[value.index(i)]['y'] > max_y):
                                                                max_y = value[value.index(i)]['y']
                                                        if(value[value.index(i)]['z'] > max_z):
                                                                max_z = value[value.index(i)]['z']
                                                maxdict = {'x':max_x, 'y': max_y, 'z': max_z}    #Dict to store max values of a single sequence
                                        #Need to handle orientation and DAC separately (different structure)
                                        if (key == 'orientation' or key == 'orientation_d'):
                                                max_alpha = value[0]['alpha']
                                                max_beta = value[0]['beta']
                                                max_gamma = value[0]['gamma']
                                                for i in value: #i is a sensor reading
                                                        if(value[value.index(i)]['alpha'] > max_alpha):
                                                                max_alpha = value[value.index(i)]['alpha']
                                                        if(value[value.index(i)]['beta'] > max_beta):
                                                                max_beta = value[value.index(i)]['beta']
                                                        if(value[value.index(i)]['gamma'] > max_gamma):
                                                                max_gamma = value[value.index(i)]['gamma']
                                                maxdict = {'alpha':max_alpha, 'beta': max_beta, 'gamma': max_gamma}    #Dict to store max values of a single sequence
                                        if (key == 'dac'):
                                                max_dac = max(value)
                                                maxdict = {'dac':max_dac}    #Dict to store max values of a single sequence
                                        buttonstats[key + '_max'].append(maxdict)
                                        #Calculate minimums
                                        buttonstats[key + '_min'] = []
                                        if (key == 'acceleration' or key == 'accelerationnog' or key == 'rotation' or key == 'acceleration_d' or key == 'accelerationnog_d' or key == 'rotation_d'):                                                      
                                                min_x = value[0]['x']
                                                min_y = value[0]['y']
                                                min_z = value[0]['z']
                                                for i in value: #i is a sensor reading
                                                        if(value[value.index(i)]['x'] < min_x):
                                                                min_x = value[value.index(i)]['x']
                                                        if(value[value.index(i)]['y'] < min_y):
                                                                min_y = value[value.index(i)]['y']
                                                        if(value[value.index(i)]['z'] < min_z):
                                                                min_z = value[value.index(i)]['z']
                                                mindict = {'x':min_x, 'y': min_y, 'z': min_z}    #Dict to store min values of a single sequence
                                        #Need to handle orientation and DAC separately (different structure)
                                        if (key == 'orientation' or key == 'orientation_d'):
                                                min_alpha = value[0]['alpha']
                                                min_beta = value[0]['beta']
                                                min_gamma = value[0]['gamma']
                                                for i in value: #i is a sensor reading
                                                        if(value[value.index(i)]['alpha'] < min_alpha):
                                                                min_alpha = value[value.index(i)]['alpha']
                                                        if(value[value.index(i)]['beta'] < min_beta):
                                                                min_beta = value[value.index(i)]['beta']
                                                        if(value[value.index(i)]['gamma'] < min_gamma):
                                                                min_gamma = value[value.index(i)]['gamma']
                                                mindict = {'alpha':min_alpha, 'beta': min_beta, 'gamma': min_gamma}    #Dict to store min values of a single sequence
                                        if (key == 'dac'):
                                                min_dac = min(value)
                                                mindict = {'dac':min_dac}    #Dict to store min values of a single sequence
                                        buttonstats[key + '_min'].append(mindict)
                                        #Calculate averages
                                        buttonstats[key + '_avg'] = []
                                        if (key == 'acceleration' or key == 'accelerationnog' or key == 'rotation' or key == 'acceleration_d' or key == 'accelerationnog_d' or key == 'rotation_d'):                                                      
                                                sum_x = value[0]['x']
                                                sum_y = value[0]['y']
                                                sum_z = value[0]['z']
                                                for i in value: #i is a sensor reading
                                                                sum_x = sum_x + value[value.index(i)]['x']
                                                                sum_y = sum_y + value[value.index(i)]['y']
                                                                sum_z = sum_z + value[value.index(i)]['z']
                                                avgdict = {'x':sum_x/len(value), 'y': sum_y/len(value), 'z': sum_z/len(value)}    #Dict to store min values of a single sequence
                                        #Need to handle orientation and DAC separately (different structure)
                                        if (key == 'orientation' or key == 'orientation_d'):
                                                sum_alpha = value[0]['alpha']
                                                sum_beta = value[0]['beta']
                                                sum_gamma = value[0]['gamma']
                                                for i in value: #i is a sensor reading
                                                                sum_alpha = sum_alpha + value[value.index(i)]['alpha']
                                                                sum_beta = sum_beta + value[value.index(i)]['beta']
                                                                sum_gamma = sum_gamma + value[value.index(i)]['gamma']
                                                avgdict = {'alpha':sum_alpha/len(value), 'beta': sum_beta/len(value), 'gamma': sum_gamma/len(value)}    #Dict to store min values of a single sequence
                                        if (key == 'dac'):
                                                sum_dac = sum(value)/len(value)
                                                avgdict = {'dac':sum_dac}    #Dict to store avg values of a single sequence
                                        buttonstats[key + '_avg'].append(avgdict)
                        statsdict.append(buttonstats)
        return statsdict

def calc_fft(jsondata): #Function to calculate FFT of each sequence and add that to the JSON formatted data
        jsondata_withfft = jsondata
        return jsondata_withfft

filename = 'data_1'
datafile = open(filename,'r')
jsondata = json.load(datafile)
"""
for buttonpress in jsondata:    ##Loop through all the button presses
        print("Button: ", buttonpress['button'])
        print(buttonpress)
        #print("FFT:", numpy.fft(buttonpress['']));
"""
orientationdata = convert_orientation(jsondata)
#print(orientationdata)
noninitialdata = remove_initial(orientationdata)
#print("New dict:", noninitialdata)
derivativedata = calc_derivative(noninitialdata)
#print("New dict:", derivativedata)
datawithdac = calc_dac(derivativedata)
#print(datawithdac)
statsdict = calc_stats(datawithdac)
print(statsdict)

for buttonpress in statsdict:    ##Loop through all the button presses
        print("New button: ", buttonpress['button'])
        for key in buttonpress:
                print(key)                
                print(buttonpress[key])

#print("All available features: ", datawithdac[0].keys())
#print("Features per sensor reading:", len(datawithdac[0].keys()) - 2)

