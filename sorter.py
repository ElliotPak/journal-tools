import argparse
import os
import time
import sys
from shutil import copytree, copyfile

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
        print("compile")
    if args.date or args.all:
        print("date")
    if args.time or args.all:
        print("time")