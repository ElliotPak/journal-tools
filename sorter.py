import argparse
import os
import sys
import re
from shutil import copytree, copyfile, move
import datetime

def thisScriptPath():
    '''
    Returns the path of the script
    '''
    return os.path.dirname(os.path.realpath(__file__))

def getYearList(yearStrList):
    #returns every string in yearStrList that is a valid 4-digit number
    newYearList = [];
    for i in yearStrList:
        if len(i) == 4 and i.isdigit():
            newYearList.append(i)
    return newYearList

def isFileAlreadyHere(filename, path):
    '''
    Returns true if any file in "path" has the same file size as "filename".
    '''
    alreadyHere = False

    scriptPath = thisScriptPath()
    fullPath = scriptPath + "/" + path + "/"
    fileSize = os.path.getsize(scriptPath + filename)

    if os.path.isdir(fullPath):
        folderContents = os.listdir(fullPath)
        for f in folderContents:
            if not alreadyHere and os.path.isfile(fullPath + f):
                thisFileSize = os.path.getsize(fullPath + f)
                fileDatetime = datetimeFromFilename(scriptPath + filename)
                thisFileDatetime = datetimeFromFilename(fullPath + f)
                if fileSize == thisFileSize and fileDatetime == thisFileDatetime:
                    alreadyHere = True
    return alreadyHere

def datetimeFromFilename(filenameFull):
    '''
    Attempts to extract time from filename, based on some preset patterns.
    '''
    found = False
    thisDatetime = None
    filename = os.path.splitext(filenameFull)[0]
    match = re.search(r"([0-3]?\d).([0-1]?\d).(\d\d) ([0-1]?\d).([0-5]\d)(am|pm)", filename)
    if match:
        found = True
        thisDatetime = datetime.datetime.strptime(match.group(0), "%d.%m.%y %I.%M%p")
    formats = [
        "VID%Y%m%d%H%M%S",
        "%Y_%m_%d_%H_%M_%S",
        "%j Y-%m-%d %H-%M-%S",
        "%J Y_%m_%d_%H_%M_%S",
        "%j Y_%m_%d_%H_%M_%S",
        "%d.%m.%y %I.%M%p",
        "%Y%m%d%H%M%S",
        "%Y-%m-%d %H-%M-%S"
    ]
    for f in formats:
        if not found:
            try:
                thisDatetime = datetime.datetime.strptime(filename, f)
                found = True
            except ValueError:
                pass
    return thisDatetime

def relocateFile(oldDir, newDir, filename, shouldMove):
    '''
    Either moves or copies (based on shouldMove) file from newDir to oldDir. 
    Also creates newDir if it doesn't exist.
    '''
    oldDirFull = thisScriptPath() + "/" + oldDir
    newDirFull = thisScriptPath() + "/" + newDir
    if not os.path.exists(newDirFull):
        print("Directory /" + newDir + " doesn't exist, creating it... ", end=" ")
        os.makedirs(newDirFull)
        print("done!")
    if shouldMove:
        print("Moving file " + filename + "...", end=" ")
        move(oldDirFull + "/" + filename, newDirFull + "/" + filename)
    else:
        print("Copying file " + filename + "...", end=" ")
        copyfile(oldDirFull + "/" + filename, newDirFull + "/" + filename)
    print("done!")

def renameFile(dir, filename, filenameNew):
    '''
    Attempts to rename filename to filenameNew
    '''
    dirFull = thisScriptPath() + "/" + dir
    if not os.path.exists(dirFull):
        print("Directory /" + dir + " doesn't exist, creating it... ", end=" ")
        os.makedirs(dirFull)
        print("done!")
    print("Renaming file " + filename + "...", end=" ")
    move(dirFull + "/" + filename, dirFull + "/" + filenameNew)
    print("done!")

def compileTags(args):
    print("Compiling all tag files into one big file...")

    tagsCompiled = 0

    if tagsCompiled > 0:
        print("Tag compiling done! " + str(tagsCompiled) + " files compiled")
    else:
        print("No tag files compiled.")

def getOrderedFiles(files):
    '''
    Sorts the contents of the list "files" based on the datetime in each entry. 
    Datetime is figured out with datetimeFromFilename()
    '''
    dictFiles = dict()
    for i in files:  #sorting files in filePath based on time
        fileTime = None
        thisDatetime = datetimeFromFilename(i)
        if thisDatetime:
            dictFiles[i] = thisDatetime
        else:
            print(i + " isn't a valid journal file, can't sort by time.")
    sortedList = sorted(dictFiles, key=dictFiles.get)
    return sortedList

def getSortedFilename(count, filename):
    '''
    
    '''
    filenameNew = str(count) + " - "
    fileTime = datetimeFromFilename(filename)
    extension = os.path.splitext(filename)[1]
    filenameNew += fileTime.strftime("%d.%m.%y %I.%M%p").lower() + extension
    return filenameNew

def formatNewFiles(orderedFiles, path):
    '''
    Renames all files in orderedFiles to their sorted filename. 
    Sorted filename comes from getSortedFilename()
    '''
    count = 0
    for f in orderedFiles:
        count += 1
        filenameNew = ""
        match = re.search(r"^([0-3]?\d).([0-1]?\d).(\d\d) ([0-1]?\d).([0-5]\d)(am|pm)", f)
        if match:
            filenameNew = str(count) + " - " + f    #it will already be in that format
        else:
            filenameNew = getSortedFilename(count, f)
        renameFile(path, f, filenameNew)

def sortTimeRecurse(path):
    '''
    Runs through all files in "path" and renames them based on the file time
    that is retrieved through its name. 
    Also calls itself on all folders in path. 
    Returns the amount of files sorted.  
    '''
    count = 0
    fullPath = thisScriptPath() + "/" + path + "/"
    folderContents = os.listdir(fullPath)
    fileList = []
    for f in folderContents:
        if os.path.isdir(fullPath + f):
            count += sortTimeRecurse(path + "/" + f)
        else:
            fileList.append(f)
            count += 1
    if fileList:
        orderedFiles = getOrderedFiles(fileList)
        formatNewFiles(orderedFiles, path + "/")
    return count

def sortDates(args):
    '''
    Moves (or copies) all files in /Unsorted to folders based on the date in
    its filename. Folders are in YYYY/MM/DD format. 
    '''

    print("Relocating files based on date...")

    unsortedDir = thisScriptPath() + "/Unsorted"
    filesSorted = 0

    if not os.path.exists(unsortedDir):
        os.makedirs(unsortedDir)
    for f in os.listdir(unsortedDir):
        date = datetimeFromFilename(f)
        if date:
            path = date.strftime("%Y/%m/%d")
            if not isFileAlreadyHere("/Unsorted/" + f, path):
                relocateFile("/Unsorted", path, f, args.move)
                filesSorted += 1
            else:
                print(f + " is already in its folder.")
        else:
            print(f + " is not a journal file, skipping...")
    if (filesSorted > 0):
        print("Relocating done! " + str(filesSorted) + " files sorted.")
    else:
        print("No files moved.")

def finalCopy(args):
    '''
    Moves all files in /Unsorted into /Raw/[current date] (formatted as
    DD.MM.YY mm.ss(am/pm))
    '''
    scriptPath = thisScriptPath()
    folderContents = os.listdir(scriptPath + "/Unsorted")
    rawFolder = scriptPath + "/Raw/" + datetime.datetime.now().strftime("%d.%m.%y %I.%M.%S%p").lower()
    
    if not os.path.isdir(rawFolder):
        os.makedirs(rawFolder)
    for f in folderContents:
        move(scriptPath + "/Unsorted/" + f, rawFolder)


def sortTimes(args):
    print("Renaming files based on time...")

    filesSorted = 0

    yearFolders = getYearList(os.listdir(thisScriptPath()))
    for i in yearFolders:
        filesSorted = sortTimeRecurse(i)
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
    argParser.add_argument("--finalcopy", help='''After date sorting, move all files in /Unsorted into /Raw/[current time]. Always moves, even without --move''', action="store_true")
    argParser.add_argument("--unsort", help='Copy sorted files back into /Unsorted', action="store_true")
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
        if args.finalcopy:
            finalCopy(args)
    if args.time or args.all:
        sortTimes(args)
