import pandas
from pandas.tools.plotting import scatter_matrix
import matplotlib.pyplot as plt
from sklearn import model_selection
from sklearn.metrics import classification_report
from sklearn.metrics import confusion_matrix
from sklearn.metrics import accuracy_score
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.neighbors import KNeighborsClassifier
from sklearn.discriminant_analysis import LinearDiscriminantAnalysis
from sklearn.naive_bayes import GaussianNB
from sklearn.svm import SVC
import ast
import numpy
from helperfuncs import prettyprint

#TODO: Name variables better, same variable names used in different places (for example 'data')

#Load dataset
datafilename = 'data_1_processed'
with open(datafilename, 'r') as datafile:
        dataset = datafile.read()


buttondata = [] #List of button presses, here 
data_split = dataset.split('@')    #Split dataset into distinct button presses
for buttonpress in data_split:
        datadict = {}   #Here all the data read from the dataset will be saved, one per button
        data = buttonpress.split(';')
        for seq in data:
                seq = seq.strip()
                if ("New button" in seq or not seq) :
                    continue
                else:
                        #Read the data into a format that we can easily manipulate (string -> new format)
                        key = seq.split(':', 1)[0].translate({ord(c): None for c in "'"})       #Translate for removing the "'"
                        data = seq.split(':', 1)[1]
                        if not(key.endswith("fft")):
                                data_read = ast.literal_eval(data)      #Cannot read numpy arrays
                        else:   #Handle numpy arrays separately
                                #First find the dict keys
                                datasplit = data.split('), ')
                                for i in datasplit:
                                        spliti = i.split(':')
                                        key2 = spliti[0].translate({ord(c): None for c in "{'"})
                                        data_read = ast.literal_eval(spliti[1].translate({ord(c): None for c in "()}'array\n "}))
                        datadict[key] = data_read
        if datadict:
                buttondata.append(datadict)

#prettyprint(buttondata)


#From sensor readings (one for each reading), need to make sequences (one for each coordinate) 
dictkeys = []
listkeys = []
xyzkeys = []    #Keys that have x, y, z data
abgkeys = []    #Keys that have alpha, beta, gamma data
numpyarrkeys = []    #Keys that have numpy array data
#Still need to find a rule to separate xyz and abg keys
for key, value in buttondata[0].items():
        if(key != 'button' and key != 'frequency'):
                #Keys that have dict data
                if(type(value) is dict):
                        dictkeys.append(key)
                #Keys that have list data
                if(type(value) is list):
                        listkeys.append(key)
                #Keys that have alpha, beta, gamma data
                if('orientation' in key):
                        abgkeys.append(key)
                #Keys that have x,y,z data (all the others except orientation, dac)
                elif('dac' not in key and key != 'button' and key != 'frequency'):
                        xyzkeys.append(key)
                if('_fft' in key):
                        numpyarrkeys.append(key)
buttondata_array = []   #Holds the data for all the buttons
for buttonpress in buttondata:
        data = {}       #Dict holding the sequences for a single button press
        data['button'] = buttonpress['button']
        for key, value in buttonpress.items():
                seq = {}
                if(key == 'button' or key == 'frequency'):    #Don't need to make sequences for these
                        continue
                #Make sequences for each key
                #First handle list keys
                if key in listkeys and key in xyzkeys and key not in numpyarrkeys:
                        seq_x = []
                        seq_y = []
                        seq_z = []
                        for i in value:
                                seq_x.append(i['x'])
                                seq_y.append(i['y'])
                                seq_z.append(i['z'])
                        seq = {'x':seq_x, 'y':seq_y, 'z':seq_z}
                elif key in listkeys and key in abgkeys and key not in numpyarrkeys:
                        #print(value)
                        seq_alpha = []
                        seq_beta = []
                        seq_gamma = []
                        for i in value:
                                seq_alpha.append(i['alpha'])
                                seq_beta.append(i['beta'])
                                seq_gamma.append(i['gamma'])
                        seq = {'alpha':seq_alpha, 'beta':seq_beta, 'gamma':seq_gamma}
                elif key in listkeys and key in numpyarrkeys:
                        print("Numpyarr", key, value)
                #Then handle dict keys
                elif key in dictkeys and key in xyzkeys:
                        seq = {'x':value['x'], 'y':value['y'], 'z':value['z']}
                elif key in dictkeys and key in abgkeys:
                        seq = {'alpha':value['alpha'], 'beta':value['beta'], 'gamma':value['gamma']}
                else:
                        print(key, value)
                
                data[key] = seq
        buttondata_array.append(data)

def buttonselection():      #Condition for selecting the buttons to be plotted
    for x in buttondata_array:
        if x['button'] == 2:    #Select all buttons that fulfil this condition
            yield x
index = 1

#prettyprint(buttonselection())
for button in buttonselection():
        #Plot sequences
        fig = plt.figure(index)
        fig.suptitle('Data for button ' + str(button['button']))
        plt.subplot(221)
        plt.plot(button['acceleration']['x'], color='r', label='accelx')
        plt.plot(button['acceleration']['y'], color='b', label='accely')
        plt.plot(button['acceleration']['z'], color='g', label='accelz')
        legend = plt.legend(loc='upper left', shadow=True)
        plt.ylabel('Acceleration')

        plt.subplot(222)
        plt.plot(button['rotation']['x'], color='r', label='rotx')
        plt.plot(button['rotation']['y'], color='b', label='roty')
        plt.plot(button['rotation']['z'], color='g', label='rotz')
        legend = plt.legend(loc='upper left', shadow=True)
        plt.ylabel('Rotation')

        plt.subplot(223)
        plt.plot(button['orientation']['alpha'], color='r', label='orix')
        plt.plot(button['orientation']['beta'], color='b', label='oriy')
        plt.plot(button['orientation']['gamma'], color='g', label='oriz')
        legend = plt.legend(loc='upper left', shadow=True)
        plt.ylabel('Orientation')   
        index = index+1

#plt.show() 
