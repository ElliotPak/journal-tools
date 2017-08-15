import os
import time
import re
from datetime import datetime
from shutil import copytree, copyfile, move
from os.path import basename

#for struct_time: year is 0, month is 1, day is 2, hour is 3, min is 4, sec is 5

monthNames = ("January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December")
filesSorted = 0
filenameRegexToSort = [r"VID2[0-1]\d\d[0-1]\d[0-3]\d[0-2]\d[0-5]\d\d\d", r"2[0-1]\d\d_[0-1]\d_[0-3]\d_[0-2]\d_[0-5]\d_\d\d", r"j 2[0-1]\d\d-[0-1]\d-[0-3]\d [0-2]\d-[0-5]\d-\d\d"]
#unused: filenameRegexToIgnore = [r"[0-9]?[0-9] - [0-3]?[0-9].[0-5]?[0-9](am|pm)", r"[0-3]?[0-9].[0-1]?[0-9].[0-9][0-9] part \d?\d"]
rawFolder = "F:\Journals\Raw"   #folder that raw journal files are moved to

def getYearList(yearStrList):
    #returns every string in yearStrList that is a valid 4-digit number
    newYearList = [];
    for i in yearStrList:
        if len(i) == 4 and i.isdigit():
            newYearList.append(i)
    return newYearList

def GetTimeFromName(name, returnDatetime):
    fileTime = None #time extracted from the filenames
    fileTimeDate = None #datetime version of fileTimeDate
    if name[0] == "V":
        fileTime = time.strptime(name, "VID%Y%m%d%H%M%S")
    elif name[0] == "2":
        fileTime = time.strptime(name, "%Y_%m_%d_%H_%M_%S")
    elif name[0] == "j":
        fileTime = time.strptime(name, "j %Y-%m-%d %H-%M-%S")
    if returnDatetime:
        return datetime.fromtimestamp(time.mktime(fileTime))
    else:
        return time.mktime(fileTime)

def SortFiles(filePath, fileList, isDayDir):
    #sorts all files in fileList based on time and then renames them accordingly
    #renaming is in the format of "[order number] - [time created].whatever"
    dictFiles = dict()
    for i in fileList:  #sorting files in filePath based on time
        fileTime = None
        fileName = os.path.splitext(i)[0]
        for j in filenameRegexToSort:
            match = re.match(j, fileName)
            if match:
                dictFiles[i] = GetTimeFromName(fileName, True)
    sortedList = sorted(dictFiles, key=dictFiles.get)   #each file
    for i in range(0, len(sortedList)):
        filenameOld = sortedList[i]
        fileTime = GetTimeFromName(os.path.splitext(filenameOld)[0], True)  #figures out the time from the time extracted from the old filename
        filenameNew = str(i + 1) + " - "    #after the - the time is displayed
        timePeriod = "am"
        timeHour24 = fileTime.hour
        timeMinute = str(fileTime.minute)
        if fileTime.hour > 11:  #converting to 24 hour time to 12 hour time
            timePeriod = "pm"
            if fileTime.hour != 12:
                timeHour24 -= 12
        if fileTime.minute < 10:
            timeMinute = "0" + timeMinute   #pad the minute string with 0s
        if isDayDir:
            filenameNew += str(timeHour24) + "." + timeMinute + timePeriod  #adds the time to the new filename
            copyfile(filePath + "\\" + filenameOld, filePath + "\\" + filenameNew + os.path.splitext(filenameOld)[1])   #creates a copy of the journal file with the new name
            move(filePath + "\\" + filenameOld, rawFolder + "\\" + str(fileTime.year) + "\\" + filenameOld) #moves the non-renamed journal file to rawFolder

thisScriptsPath = dir_path = os.path.dirname(os.path.realpath(__file__))    #path of the script
yearFolders = getYearList(os.listdir(thisScriptsPath))  #list of all year folders in the script's directory
for i in yearFolders:
    yearDir = thisScriptsPath + "\\" + i
    monthFolders = os.listdir(yearDir)  #all month folders for the current year
    for j in monthFolders:
        monthDir = yearDir + "\\" + j
        if os.path.isdir(monthDir) and j != "Unsorted": #if the current month exists and isn't an unsorted folder
            dayFolders = os.listdir(monthDir)   #all day folders for the current month
            for k in dayFolders:
                dayDir = monthDir + "\\" + k
                if os.path.isdir(dayDir):
                    #sort all files in dayDir
                    SortFiles(dayDir, os.listdir(dayDir), True) #sort all files in the day's directory
                else:
                    #sort all files monthDir
                    SortFiles(monthDir, os.listdir(monthDir), False)    #sort all files in the month's directory
print(filesSorted)
