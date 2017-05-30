import math

def prettyprint(jsondata): #Clearly print the data - input is all the button data
        for buttonpress in jsondata:    ##Loop through all the button presses
                print("\nNew button: ", buttonpress['button'], "\n")
                for key in sorted(buttonpress):
                        print(key)                
                        print(buttonpress[key])


def find_interval(seq, coe, totalEnergy, coord):     #Find the interval of 70% energy for a sequence, centered on coe. For single coord only
        interval = []
        #Now find shortest intervals containing 70% of the total energy
        index = round(coe)
        #Calculate energy for interval i centered on index
        bound_lower = 0
        bound_upper = 0
        for i in range(0, len(seq)):
                e = 0
                bound_lower = index-i
                bound_upper = index+i
                #Check that we are not out of bounds
                if(bound_lower < 0):
                        bound_lower = 0
                if(bound_upper > len(seq)):
                        bound_upper = len(seq)
                for v in seq[bound_lower:bound_upper]:
                        e = e + math.pow(seq[seq.index(v)][coord], 2)
                if(e > 0.7 * totalEnergy):
                        interval = [bound_lower, bound_upper]     
                        return interval
