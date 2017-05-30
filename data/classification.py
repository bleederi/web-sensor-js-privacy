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
buttondata_array = []   #Holds the data for all the buttons
for buttonpress in buttondata:
        data = {}       #Dict holding the sequences for a single button press
        data['button'] = buttonpress['button']
        for key, value in buttonpress.items():
                seq = {}
                if(key == 'button'):    #Don't need to make sequences for these
                        continue
                #Make sequences for each key
                if(key == 'acceleration' or key == 'rotation'):
                        seq_x = []
                        seq_y = []
                        seq_z = []
                        for i in value:
                                seq_x.append(i['x'])
                                seq_y.append(i['y'])
                                seq_z.append(i['z'])
                        seq = {'x':seq_x, 'y':seq_y, 'z':seq_z}
                elif (key == 'orientation'):
                        seq_alpha = []
                        seq_beta = []
                        seq_gamma = []
                        for i in value:
                                seq_alpha.append(i['alpha'])
                                seq_beta.append(i['beta'])
                                seq_gamma.append(i['gamma'])
                        seq = {'alpha':seq_alpha, 'beta':seq_beta, 'gamma':seq_gamma}
                data[key] = seq
        buttondata_array.append(data)

buttons = buttondata_array[0:3] #Buttons to be plotted

index = 1
for button in buttons:
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

plt.show() 
