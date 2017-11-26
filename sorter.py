import argparse
import os
import sys
import re
import datetime
import xml.etree.ElementTree as ET
import xml.dom.minidom
from shutil import copytree, copyfile, move

args = None     #command line arguments

def printStatus(text, whenQuiet=False, textEnd="\n", marker=""):
    '''
    prints text. if the --quiet flag is used and whenQuiet is false, text won't
    be printed. If marker isn't an empty string, it's inserted between square
    brackets before the text to be printed (won't be if --nomarker is on)
    '''
    toPrint = ""
    if not args.silent and (not args.quiet or whenQuiet):
        toPrint = text
        if marker and not args.nomarker:
            markerText = "[" + marker + "] "
            toPrint = markerText + toPrint
    if toPrint:
        print(toPrint, end=textEnd)

def thisScriptPath():
    '''
    Returns the path of the script
    '''
    return os.path.dirname(os.path.realpath(__file__))

def getYearList(yearStrList):
    '''
    returns every string in yearStrList that is a valid 4-digit number
    '''
    newYearList = [];
    for i in yearStrList:
        if len(i) == 4 and i.isdigit():
            newYearList.append(i)
    return newYearList

def isFileAlreadyHere(filename, filePath, pathToCheck):
    '''
    Returns true if any file in "pathtoCheck" has the same file size as
    "filename" and the same datetime in its filename as
    "filename"'s filename
    '''
    alreadyHere = False

    scriptPath = thisScriptPath()
    fullPath = scriptPath + "/" + pathToCheck + "/"
    fileSize = os.path.getsize(scriptPath + filePath + filename)

    if os.path.isdir(fullPath):
        folderContents = os.listdir(fullPath)
        for f in folderContents:
            if not alreadyHere and os.path.isfile(fullPath + f):
                thisFileSize = os.path.getsize(fullPath + f)
                fileDatetime = datetimeFromFilename(filename)
                thisFileDatetime = datetimeFromFilename(f)
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
    formats = [
        "VID%Y%m%d%H%M%S",
        "IMG%Y%m%d%H%M%S",
        "%Y_%m_%d_%H_%M_%S",
        "j %Y-%m-%d %H-%M-%S",
        "J %Y_%m_%d_%H_%M_%S",
        "j %Y_%m_%d_%H_%M_%S",
        "%Y.%m.%d %H.%M",
        "%Y.%m.%d %I.%M%p",
        "%d.%m.%y %I.%M%p",
        "%Y.%d.%m %I.%M%p",
        "%Y%m%d%H%M%S",
        "%Y-%m-%d %H-%M-%S"
    ]
    for f in formats:
        if not found:
            try:
                thisDatetime = datetime.datetime.strptime(filename.upper(), f)
                found = True
            except ValueError:
                pass
    
    toRegexSearch = [
        ["%d.%m.%y %I.%M%p", r"([0-3]?\d)\.([0-1]?\d)\.(\d\d) ([0-1]?\d)\.([0-5]\d)(am|pm)"],
        ["%d %m %Y", r"([0-3]?\d)\.([0-1]?\d)\.(\d\d\d\d)"],
        ["%d.%m.%y", r"([0-3]?\d)\.([0-1]?\d)\.(\d\d)"]
    ]
    for ii, jj in toRegexSearch:
        match = re.search(jj, filename)
        if match and not found:
            try:
                thisDatetime = datetime.datetime.strptime(match.group(0), ii)
                found = True
            except ValueError:
                pass
    if thisDatetime != None:
        thisDatetime = thisDatetime.replace(second=0)
    return thisDatetime

def relocateFile(oldDir, newDir, filename):
    '''
    Either moves or copies (based on shouldMove) file from newDir to oldDir. 
    Also creates newDir if it doesn't exist.
    '''
    oldDirFull = thisScriptPath() + "/" + oldDir
    newDirFull = thisScriptPath() + "/" + newDir
    if not os.path.exists(newDirFull):
        printStatus("Directory /" + newDir + " doesn't exist, creating it... ", False, " ", "NewDir")
        os.makedirs(newDirFull)
        printStatus("done!", False)
    if args.move:
        printStatus("Moving file " + filename + "...", False, " ", " Move ")
        if not args.nofiles:
            move(oldDirFull + "/" + filename, newDirFull + "/" + filename)
    else:
        printStatus("Copying file " + filename + "...", False, " ", " Copy ")
        if not args.nofiles:
            copyfile(oldDirFull + "/" + filename, newDirFull + "/" + filename)
    printStatus("done!", False)

def renameFile(dir, filename, filenameNew):
    '''
    Attempts to rename dir/filename to dir/filenameNew (so it's essentially a move)
    '''
    dirFull = thisScriptPath() + "/" + dir
    if not os.path.exists(dirFull):
        printStatus("Directory /" + dir + " doesn't exist, creating it... ", False, " ", "NewDir")
        os.makedirs(dirFull)
        printStatus("done!", False)
    printStatus("Renaming file " + filename + "...", False, " ", "Rename")
    if not args.nofiles:
        move(dirFull + "/" + filename, dirFull + "/" + filenameNew)
    printStatus("done!", False)

def getSortedFilename(filename):
    '''
    gets the datetime from filename, converts it to DD.MM.YY mm.ss(am/pm)
    format, and renames it to that format. Also adds "count - " to the front
    '''
    fileTime = datetimeFromFilename(filename)
    extension = os.path.splitext(filename)[1]
    filenameNew = fileTime.strftime("%Y.%m.%d %H.%M").lower() + extension
    return filenameNew

def formatNewFiles(fileList, path, filesSorted):
    '''
    Renames all files in orderedFiles to their sorted filename. 
    Sorted filename comes from getSortedFilename()
    '''
    for f in fileList:
        filenameNew = getSortedFilename(f)
        if (f != filenameNew):
            renameFile(path, f, filenameNew)
            filesSorted[0][f] = filenameNew
        else:
            printStatus(f + " already has a valid name, skipping...", False, marker="NoRenm")
    return filesSorted

def sortTimeRecurse(path, filesSorted):
    '''
    Runs through all files in "path" and renames them based on the file time
    that is retrieved through its name. 
    Also calls itself on all folders in path. 
    Returns the amount of files sorted.  
    '''
    fullPath = thisScriptPath() + "/" + path + "/"
    folderContents = os.listdir(fullPath)
    fileList = []
    for f in folderContents:
        if os.path.isdir(fullPath + f):
            sortTimeRecurse(path + "/" + f, filesSorted)
        else:
            fileList.append(f)
    if fileList:
        formatNewFiles(fileList, path + "/", filesSorted)
    return filesSorted

def unsortRecurse(path, filesSorted):
    '''
    Runs through all files in "path" and moves them back to Unsorted. 
    Also calls itself on all folders in path. 
    Returns the amount of files sorted.  
    '''
    fullPath = thisScriptPath() + "/" + path + "/"
    folderContents = os.listdir(fullPath)
    for f in folderContents:
        if os.path.isdir(fullPath + f):
            unsortRecurse(path + "/" + f, filesSorted)
        else:
            try:
                printStatus("Moving file " + f + "...", False, " ", " Move ")
                move(fullPath + f, thisScriptPath() + "/Unsorted")
                filesSorted.append(f)
                printStatus(" done!")
            except:
                printStatus(" failed (file most likely is already in Unsorted)")
                
    return filesSorted

def loadXmlDoc(filename):
    '''
    Attempts to load filename as an xml document and returns the root of the
    document. If it doesn't exist, it creates a new root node and returns that.
    '''
    root = None
    if os.path.exists(thisScriptPath() + "/" + filename):
        tree = ET.parse(thisScriptPath() + "/" + filename)
        root = tree.getroot()
    else:
        root = ET.Element("Journals")
    return root

def getTag(xmlDoc, tag, name):
    '''
    Searches xmlDoc for a child tag of type tag with a specified name
    attribute. Returns the result, if it can be found. Otherwise returns None.
    '''
    toReturn = None
    for child in xmlDoc:
        if child.tag == tag and child.attrib["name"] == name and not toReturn:
            toReturn = child
    return toReturn

def getFolderNode(xmlDoc, folder):
    '''
    gets a Folder node from xmlDoc, named folder. Creates a new one if it
    doesn't already exist
    '''
    node = getTag(xmlDoc, "Folder", folder)
    if not node:
        node = ET.SubElement(xmlDoc, "Folder", name=folder)
    return node

def addTagChildren(node, files, tagsCompiled):
    '''
    for every entry in files, adds a child to node. The child is a "File" tag
    with a name attribute equal to the entry in "files".
    '''
    for f in files:
        if getTag(node, "File", f) == None:
            ET.SubElement(node, "File", name=f)
            tagsCompiled[0].append(f)
        else:
            tagsCompiled[1].append(f)

def tagCompileRecurse(xmlDoc, folderPath, folder, tagsCompiled):
    '''
    Runs through all files in folderPath/folder adds them to a list, to be
    added to xmlDoc as children [see addTagChildren()]. Calls itself on all
    folders it finds in the path. Returns the amount of files added to the
    tag file.
    '''
    fullPath = thisScriptPath() + "/" + folderPath + folder + "/"
    folderContents = os.listdir(fullPath)
    files = []

    node = getFolderNode(xmlDoc, folder)
    for f in folderContents:
        if os.path.isdir(fullPath + f):
            tagCompileRecurse(node, folderPath + folder + "/", f, tagsCompiled)
        else:
            files.append(f)
    addTagChildren(node, files, tagsCompiled)
    return tagsCompiled

def removeAnnoyingLines(elem):
    hasWords = re.compile("\\w")
    for element in elem.iter():
        if not re.search(hasWords,str(element.tail)):
            element.tail=""
        if not re.search(hasWords,str(element.text)):
            element.text = ""

def prettifyXml(element):
    '''
    Converts XML to a beautified format. Might take time (requires re-parsing,
    sadly ;_;)
    '''
    removeAnnoyingLines(element)
    roughString = ET.tostring(element, 'utf-8')
    reparsed = xml.dom.minidom.parseString(roughString)
    toReturn = reparsed.toprettyxml(indent="\t")
    return toReturn

def sortDates():
    '''
    Moves (or copies) all files in /Unsorted to folders based on the date in
    its filename. Folders are in YYYY/MM/DD format. 
    '''

    printStatus("=================================", True)
    printStatus("Relocating files based on date...", True)
    printStatus("=================================", True, "\n\n")

    unsortedDir = thisScriptPath() + "/Unsorted"
    filesSorted = [{}, [], []]      #[successfully sorted, already sorted, not a journal file]

    if not os.path.exists(unsortedDir):
        os.makedirs(unsortedDir)
    for f in os.listdir(unsortedDir):
        date = datetimeFromFilename(f)
        if date != None:
            path = date.strftime("%Y/%m")
            if not isFileAlreadyHere(f, "/Unsorted/", path):
                relocateFile("/Unsorted", path, f)
                filesSorted[0][f] = path
            else:
                printStatus(f + " is already in its folder.", False, marker="NoMove")
                filesSorted[1].append(f)
        else:
            printStatus(f + " is not a journal file, skipping...", False, marker="!!NotJ")
            filesSorted[2].append(f)

    filesSortedAmount = len(filesSorted[0])
    if (filesSortedAmount > 0):
        printStatus("\nRelocating done! " + str(filesSortedAmount) + " files sorted.", True, "\n\n")
    else:
        printStatus("\nNo files moved.", True, "\n\n")
    return filesSorted

def sortTimes():
    '''
    goes through each year folder (and its subfolders) and renames all files
    found to be ordered based on the datetime that was already in its filename
    '''
    printStatus("===============================", True)
    printStatus("Renaming files based on time...", True)
    printStatus("===============================", True, "\n\n")

    filesSorted = [{}, [], []]      #[successfully sorted, already sorted, not a journal file]
    yearFolders = getYearList(os.listdir(thisScriptPath()))
    for i in yearFolders:
        sortTimeRecurse(i, filesSorted)

    filesSortedAmount = len(filesSorted[0])
    if filesSortedAmount > 0:
        printStatus("\nRenaming done! " + str(filesSortedAmount) + " files renamed", True, "\n\n")
    else:
        printStatus("\nNo files renamed.", True, "\n\n")
    return filesSorted

def unsort():
    '''
    goes through each year folder (and its subfolders) and moves all files
    back into /Unsorted
    '''
    printStatus("==================", True)
    printStatus("Unsorting files...", True)
    printStatus("==================", True, "\n\n")

    filesSorted = []
    yearFolders = getYearList(os.listdir(thisScriptPath()))
    for i in yearFolders:
        unsortRecurse(i, filesSorted)

    filesSortedAmount = len(filesSorted)
    if filesSortedAmount > 0:
        printStatus("\nUnsorting done! " + str(filesSortedAmount) + " files unsorted", True, "\n\n")
    else:
        printStatus("\nNo files unsorted.", True, "\n\n")
    return filesSorted

def compileTags():
    '''
    Ensures that there's an entry in tags.xml for every file in a year folder
    '''
    printStatus("=========================", True)
    printStatus("Making a tags.xml file...", True)
    printStatus("=========================", True, "\n\n")
    tagsCompiled = [[], []]

    xmlDoc = loadXmlDoc("tags.xml")
    yearFolders = getYearList(os.listdir(thisScriptPath()))
    for ii in yearFolders:
        tagCompileRecurse(xmlDoc, "/", ii, tagsCompiled)
    prettified = prettifyXml(xmlDoc)
    with open("tags.xml", "w") as f:
        f.write(prettified)
            
    tagsCompiledAmount = len(tagsCompiled[0])
    if tagsCompiledAmount > 0:
        printStatus("\nTag compiling done! " + str(tagsCompiledAmount) + " files compiled", True, "\n\n")
    else:
        printStatus("\nNo tag files compiled.", True, "\n\n")
    return tagsCompiled

def finalMove():
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
        if not args.nofiles:
            move(scriptPath + "/Unsorted/" + f, rawFolder)
    
def printResults(date, time, compile, unsorted, finalCopy):
    print("=================")
    print("||   SUMMARY:  ||")
    print("=================")

    output = []

    if unsorted:
        output.append("\nThe following files were unsorted:")
        for ii in unsorted:
            output.append("    " + ii)
    if date:
        if date[0]:
            output.append("\nThe following files were successfully moved:")
            for ii, jj in date[0].items():
                text = "    " + ii + "\n      moved to " + jj
                output.append(text)
        if date[1]:
            output.append("\nThe following files were already in their folders:")
            for ii in date[1]:
                output.append("    " + ii)
        if date[2]:
            output.append("\nThe following files weren't moved since they weren't journal files: ")
            for ii in date[2]:
                output.append("    " + ii)
    if time:
        if time[0]:
            output.append("\nThe following files were successfully renamed:")
            for ii, jj in time[0].items():
                text = "    From: " + ii + "\n      To: " + jj
                output.append(text)
    if compile:
        if compile[0]:
            output.append("\nThe following tags were compiled:")
            for ii in compile[0]:
                output.append("    " + ii)
        if compile[1]:
            output.append("\nThe following tags were not compiled:")
            for ii in compile[1]:
                output.append("    " + ii)
    
    if args.summary:
        for a in output:
            print(a)
    
    if args.summarytxt:
        summaryPath = thisScriptPath() + "/Summary/"
        if not os.path.exists(summaryPath):
            os.makedirs(summaryPath)
        filename = datetime.datetime.now().strftime("%d.%m.%y %I.%M.%S%p").lower() + ".txt"
        with open(summaryPath + filename, "w") as f:
            f.write("Elliot's Journal Sorter, Summary for " + filename + "\n\n")
            for a in output:
                f.write(a + "\n")
        print("\nSaved a summary to \"" + summaryPath + filename + "\".")


def get_arguments():
    argParser = argparse.ArgumentParser()
    argParser.add_argument("-t", "--tag", help="Create a tag entry in tags.xml for each sorted file", action="store_true")
    argParser.add_argument("-d", "--date", help="Put unsorted files in date folders based on time in the filename", action="store_true")
    argParser.add_argument("-r", "--rename", help="Rename files to YYYY.MM.DD HH.MM.DD format", action="store_true")
    argParser.add_argument("-a", "--all", help='Shorthand for "-c -d -t"', action="store_true")
    argParser.add_argument("-m", "--move", help='Move files instead of copying them', action="store_true")
    argParser.add_argument("-n", "--nofiles", help='''Doesn't actually move anything.''', action="store_true")
    argParser.add_argument("-f", "--finalmove", help='''After date sorting, move all files in /Unsorted into /Raw/[current time]. Moves regardless of --move (but won't if --nofiles is present)''', action="store_true")
    argParser.add_argument("-u", "--unsort", help='Copy sorted files back into /Unsorted', action="store_true")
    argParser.add_argument("-q", "--quiet", help='Only display messages about what major tasks are being done, and their results', action="store_true")
    argParser.add_argument("-s", "--silent", help='Display no messages while anything occurs', action="store_true")
    argParser.add_argument("--nomarker", help='''Don't display the markers [like this] before terminal output''', action="store_true")
    argParser.add_argument("--summary", help='''After the program is finished, display what happened to each file in the terminal''', action="store_true")
    argParser.add_argument("--summarytxt", help='''Like --summary, but prints to a text file instead, in "Summary/summary [current time]"''', action="store_true")
    args = argParser.parse_args()
    if len(sys.argv) == 1:
        argParser.print_help()
    return args

if __name__ == "__main__":
    print("\nElliot's Journal Sorter\n")
    resultsUnsorted = []
    resultsDate = []
    resultsTime = []
    resultsCompile = []
    resultsFinalMove = []

    args = get_arguments()
    if args.unsort:
        resultsUnsorted = unsort()
    if args.date or args.all:
        resultsDate = sortDates()
        if args.finalmove:
            resultsFinalMove = finalMove()
    if args.rename or args.all:
        resultsTime = sortTimes()
    if args.tag or args.all:
        resultsCompile = compileTags()

    if args.summary or args.summarytxt:
        printResults(resultsDate, resultsTime, resultsCompile, resultsUnsorted, [])
        #printResults(resultsDate, resultsTime, resultsCompile, resultsFinalMove)
    
    if len(sys.argv) != 1:
        print("\nAll operations completed!\n")
