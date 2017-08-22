import argparse
import os
import time
import sys
import re
from shutil import copytree, copyfile, move

def thisScriptPath():
    return os.path.dirname(os.path.realpath(__file__))

def getYearList(yearStrList):
    #returns every string in yearStrList that is a valid 4-digit number
    newYearList = [];
    for i in yearStrList:
        if len(i) == 4 and i.isdigit():
            newYearList.append(i)
    return newYearList

def getDatetimeFromFile(filename):
    date = []
    matched = False

    #special case for files i've named myself
    match = re.match(r"([0-3]?\d).([0-1]?\d).(\d\d) ([0-1]?\d).([0-5]\d)(am|pm)", filename)
    if match and not matched:
        matched = True
        date = [match.group(n) for n in range(3,0,-1)]
        for n in [4, 5]:
            date.append(match.group(n))      #adds hour and date
        if (match.group(6) == "pm") and (date[3] < "12"):
            date[3] = str(int(date[3]) + 12)       #converts 1pm-11pm to 24 hour format
        elif date[3] == "12":
            date[3] = "0"   #change 12am to 24hour format
        date[0] = "20" + date[0]    #convert year to 20xx format
        print("debug: " + filename + " " + str(date))
    else:
        regex = [
            r"VID(2[0-1]\d\d)([0-1]\d)([0-3]\d)([0-2]\d)([0-5]\d)(\d\d)",
            r"(2[0-1]\d\d)_([0-1]\d)_([0-3]\d)_([0-2]\d)_([0-5]\d)_(\d\d)",
            r"j (2[0-1]\d\d)-([0-1]\d)-([0-3]\d) ([0-2]\d)-([0-5]\d)-(\d\d)",
            r"J (2[0-1]\d\d)_([0-1]\d)_([0-3]\d)_([0-2]\d)_([0-5]\d)_(\d\d)",
            r"(2[0-1]\d\d)_([0-1]\d)_([0-3]\d)_([0-2]\d)_([0-5]\d)_(\d\d)"
        ]
        for r in regex:
            match = re.match(r, filename)
            if match and not matched:
                matched = True
                date = [match.group(n) for n in range(1,6)]
    return date

def padListWithZeros(list):
    newList = []
    for l in list:
        if len(l) == 1:
            newList.append("0" + l)
        else:
            newList.append(l)
    return newList

def getYearList(yearStrList):
    #returns every string in yearStrList that is a valid 4-digit integer
    newYearList = [];
    for i in yearStrList:
        if len(i) == 4 and i.isdigit():
            newYearList.append(i)
    return newYearList

def compileTags(args):
    print("Compiling all tag files into one big file...")

    tagsCompiled = 0

    if tagsCompiled > 0:
        print("Tag compiling done! " + str(tagsCompiled) + " files compiled")
    else:
        print("No tag files compiled.")

def getOrderedFiles(files):
    dictFiles = dict()
    for i in files:  #sorting files in filePath based on time
        fileTime = None
        fileName = os.path.splitext(i)[0]
        
        dictFiles[i] = GetTimeFromName(fileName, True)
    sortedList = sorted(dictFiles, key=dictFiles.get)
    return sortedList

def sortTimeRecurse(path):
    print(path)
    fullPath = thisScriptsPath + "/" + path + "/"
    folderContents = os.listdir(fullPath)
    fileList = []
    for f in folderContents:
        if os.path.isdir(fullPath + f):
            sortTimeRecurse(path + "/" + f)
        else:
            fileList.append(f)
    orderedFiles = getOrderedFiles(fileList)
    

def sortDates(args):
    print("Relocating files based on date...")

    unsortedDir = thisScriptPath() + "/Unsorted"
    filesSorted = 0

    if not os.path.exists(unsortedDir):
        os.makedirs(unsortedDir)
    for f in os.listdir(unsortedDir):
        date = getDatetimeFromFile(f)
        date = padListWithZeros(date)
        path = "".join(str(e) + "/" for e in date[0:3])
        if not os.path.exists(thisScriptPath() + "/" + path):
            print("Directory /" + path + " doesn't exist, creating it... ", end=" ")
            os.makedirs(thisScriptPath() + "/" + path)
            print("done!")
        if args.move:
            print("Moving file " + f + "...", end=" ")
            move(unsortedDir + "/" + f, thisScriptPath() + "/" + path + "/" + f)
        else:
            print("Copying file " + f + "...", end=" ")
            copyfile(unsortedDir + "/" + f, thisScriptPath() + "/" + path + "/" + f)
        print("done!")
        filesSorted += 1
    if (filesSorted > 0):
        print("Relocating done! " + str(filesSorted) + " files sorted.")
    else:
        print("No files moved.")

def sortTimes(args):
    print("Renaming files based on time...")

    filesSorted = 0

    yearFolders = getYearList(os.listdir(thisScriptPath()))
    for i in yearFolders:
        sortTimeRecurse(i)
    if filesSorted > 0:
        print("Renaming done! " + str(filesSorted) + " files renamed")
    else:
        print("No files renamed.")

def get_arguments():
    argParser = argparse.ArgumentParser()
    argParser.add_argument("-c", "--compile", help="Combine all already existing tag files into one tag file in this script's directory", action="store_true")
    argParser.add_argument("-d", "--date", help="Put unsorted files in date folders based on time in the filename", action="store_true")
    argParser.add_argument("-t", "--time", help="Sort files in date folders based on time in the filename", action="store_true")
    argParser.add_argument("-a", "--all", help='Shorthand for "-c -d -t"', action="store_true")
    argParser.add_argument("--move", help='Move files instead of copying them', action="store_true")
    argParser.add_argument("--finalcopy", help='''After time sorting, copy all sorted files into [script's path]/new''', action="store_true")
    args = argParser.parse_args()
    if len(sys.argv) == 1:
        argParser.print_help()
    return args

if __name__ == "__main__":
    args = get_arguments()
    if args.compile or args.all:
        compileTags(args)
    if args.date or args.all:
        sortDates(args)
    if args.time or args.all:
        sortTimes(args)