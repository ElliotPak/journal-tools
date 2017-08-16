import argparse
import os
import time
import sys
import re
from shutil import copytree, copyfile, move

def thisScriptPath():
    return os.path.dirname(os.path.realpath(__file__))

def getDatetimeFromFile(filename):
    datetime = []
    regex = [
        r"VID(2[0-1]\d\d)([0-1]\d)([0-3]\d)([0-2]\d)([0-5]\d)(\d\d)",
        r"(2[0-1]\d\d)_([0-1]\d)_([0-3]\d)_([0-2]\d)_([0-5]\d)_(\d\d)",
        r"j (2[0-1]\d\d)-([0-1]\d)-([0-3]\d) ([0-2]\d)-([0-5]\d)-(\d\d)",
        r"J (2[0-1]\d\d)_([0-1]\d)_([0-3]\d)_([0-2]\d)_([0-5]\d)_(\d\d)"
    ]
    for r in regex:
        match = re.match(r, filename)
        if match:
            datetime = [match.group(n) for n in range(1,7)]
    return datetime

def compileTags():
    print("Compiling all tag files into one big file...")

    tagsCompiled = 0

    if tagsCompiled > 0:
        print("Tag compiling done! " + tagsCompiled + " files compiled")
    else:
        print("No tag files compiled.")

def sortDates():
    print("Moving files based on date...")

    unsortedDir = thisScriptPath() + "/Unsorted"
    filesSorted = 0

    if not os.path.exists(unsortedDir):
        os.makedirs(unsortedDir)
    for f in os.listdir(unsortedDir):
        datetime = getDatetimeFromFile(f)
        path = "".join(str(e) + "/" for e in datetime[0:3])
        print(path)
        if not os.path.exists(thisScriptPath() + "/" + path):
            print("Creating directory " + path + "...")
            os.makedirs(thisScriptPath() + "/" + path)
        print("Moving file " + f + "...", end=" ")
        move(unsortedDir + "/" + f, thisScriptPath() + "/" + path)
        print("done!")
        filesSorted += 1
    if (filesSorted > 0):
        print("Moving done! " + filesSorted + " files sorted.")
    else:
        print("No files moved.")

def sortTimes():
    print("Renaming files based on time...")

    filesSorted = 0

    if filesSorted > 0:
        print("Renaming done! " + filesSorted + " files renamed")
    else:
        print("No files renamed.")

def get_arguments():
    argParser = argparse.ArgumentParser()
    argParser.add_argument("-c", "--compile", help="Combine all already existing tag files into one tag file in this script's directory", action="store_true")
    argParser.add_argument("-d", "--date", help="Put unsorted files in date folders", action="store_true")
    argParser.add_argument("-t", "--time", help="Sort files in date folders based on time in the filename", action="store_true")
    argParser.add_argument("-a", "--all", help='Shorthand for "-c -d -t"', action="store_true")
    args = argParser.parse_args()
    if len(sys.argv) == 1:
        argParser.print_help()
    return args

if __name__ == "__main__":
    args = get_arguments()
    if args.compile or args.all:
        compileTags()
    if args.date or args.all:
        sortDates()
    if args.time or args.all:
        sortTimes()