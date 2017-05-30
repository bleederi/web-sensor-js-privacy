def prettyprint(jsondata): #Clearly print the data - input is all the button data
        for buttonpress in jsondata:    ##Loop through all the button presses
                print("\nNew button: ", buttonpress['button'], "\n")
                for key in sorted(buttonpress):
                        print(key)                
                        print(buttonpress[key])
