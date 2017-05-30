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

# Load dataset
#url = "https://archive.ics.uci.edu/ml/machine-learning-databases/iris/iris.data"
#names = ['sepal-length', 'sepal-width', 'petal-length', 'petal-width', 'class']
#dataset = pandas.read_csv(url, names=names)
datafilename = 'data_1_processed'
with open(datafilename, 'r') as datafile:
        dataset = datafile.read()


buttondata = [] #List of button presses, here 
data_split = dataset.split('@')    #Split dataset into distinct button presses
for buttonpress in data_split:
        #print(buttonpress)
        datadict = {}   #Here all the data read from the dataset will be saved, one per button
        data = buttonpress.split(';')
        for seq in data:
                seq = seq.strip()
                if ("New button" in seq or not seq) :
                    continue
                else:
                        #Read the data into a format that we can easily manipulate (string -> new format)
                        #print("Seq: ", seq)
                        key = seq.split(':', 1)[0].translate({ord(c): None for c in "'"})       #Translate for removing the "'"
                        data = seq.split(':', 1)[1]
                        #print(key, "\ndata:", data)
                        #Now analyze the data, make the feature vectors, plot etc.
                        if not(key.endswith("fft")):
                                data_read = ast.literal_eval(data)      #Cannot read numpy arrays
                                #print("New data:", data_read)
                        else:   #Handle numpy arrays separately
                                #print("numpy array")
                                #First find the dict keys
                                datasplit = data.split('), ')
                                #print(datasplit)
                                for i in datasplit:
                                        spliti = i.split(':')
                                        key2 = spliti[0].translate({ord(c): None for c in "{'"})
                                        #print(key2)
                                        data_read = ast.literal_eval(spliti[1].translate({ord(c): None for c in "()}'array\n "}))
                                        #print(spliti[1].translate({ord(c): None for c in "()}'array\n "}))
                                        #i.translate({ord(c): None for c in "{'array"})
                                        #print("I:", spliti)
                                        #print(data_read[1])
                                        #print(key2, data_read)
                        datadict[key] = data_read
        #print("")   #Newline
        #print(datadict[0])
        if datadict:
                buttondata.append(datadict)
print(buttondata[0]['button'])
prettyprint(buttondata)


#plt.plot([1,2,3,4])
#plt.ylabel('some numbers')
#plt.show()        

#Now need to construct DataArray
# shape
#print(dataset.head)

# shape
#print(dataset.head(20))
