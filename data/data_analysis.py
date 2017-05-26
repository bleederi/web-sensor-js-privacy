import json
import numpy

def remove_initial(filename):   #Load JSON formatted data from file, do operations on it
        datafile = open(filename,'r')
        jsondata = json.load(datafile)
        """
        for buttonpress in jsondata:    ##Loop through all the button presses
                print("Button: ", buttonpress['button'])
                #Cancel out effect of initial position and orientation
                         
                #print("FFT:", numpy.fft(buttonpress['']));
        """
        cancelledjsondata = [] #New JSON data with the effect of initial position and orientation cancelled
        for buttonpress in jsondata:
                if(buttonpress['button'] !=  None):     #skip bad values
                        cancelleddict = {}      #Dict (JSON data) with the effect of initial position and orientation cancelled
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
filename = 'exampledata_best'
newdata = remove_initial(filename)
#print("New dict:", newdata)
