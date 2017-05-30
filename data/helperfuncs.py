def prettyprint(jsondata): #Clearly print the data
        for buttonpress in jsondata:    ##Loop through all the button presses
                features = 0
                ekeys = 0
                dkeys = 0
                statkeys = 0
                seqkeys = 0
                print("\nNew button: ", buttonpress['button'], "\n")
                for key in sorted(buttonpress):
                        print(key)                
                        print(buttonpress[key])
