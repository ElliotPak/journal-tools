import os
import time
from shutil import copytree, copyfile

#for struct_time: year is 0, month is 1, day is 2, hour is 3, min is 4, sec is 5

def getYearList(yearStrList):
    #returns every string in yearStrList that is a valid 4-digit number
    newYearList = [];
    for i in yearStrList:
        if len(i) == 4 and i.isdigit():
            newYearList.append(i)
    return newYearList

monthNames = ("January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December")

filesSorted = 0 #for debug purposes
thisScriptsPath = dir_path = os.path.dirname(os.path.realpath(__file__))    #path of the script
yearFolders = getYearList(os.listdir(thisScriptsPath))  #list of all year folders in the script's directory
for i in yearFolders:
    yearDir = thisScriptsPath + "\\" + i
    unsortedDir = yearDir + "\\Unsorted"
    if os.path.exists(unsortedDir):
        unsortedFiles = os.listdir(unsortedDir)
        unsortedFilesDir = []   #list of all files in the Unsorted folder
        for j in unsortedFiles:
            unsortedFilesDir.append(unsortedDir + "\\" + j)
        for j in range(0, len(unsortedFilesDir)):
            fileModTime = time.localtime(os.path.getmtime(unsortedFilesDir[j])) #gets time modified of each unsorted file
            monthDir = yearDir + "\\" + str(fileModTime[1]) + " - " + monthNames[fileModTime[1] - 1]    #the directory for the month that the journal file was last modified
            if not os.path.exists(monthDir):
                os.makedirs(monthDir)
            dayDir = monthDir + "\\" + str(fileModTime[2])  #the directory for the day that the journal file was last modified
            if not os.path.exists(dayDir):
                os.makedirs(dayDir)
            copyfile(unsortedFilesDir[j], dayDir + "\\" + unsortedFiles[j]) #copies file to dayDir
            filesSorted += 1
print(filesSorted)
