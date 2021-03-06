searchLoaded = true;

filesToDisplays = new Map();
displaysToFiles = new Map();
filesToContents = new Map();

function setupSearch(listOfFiles)
{
    document.getElementById("results").innerHTML = ''
    filesToDisplays = new Map();
    displaysToFiles = new Map();
    filesToContents = new Map();
    errors = {
        errors : 0,
        errorFiles : [],
        noName : 0,
        noPath: 0,
        warnings : 0,
        warningFiles : [],
        noTime: 0,
        fine: 0
    };
    for (ii = 0; ii < listOfFiles.length; ii++)
    {
        file = listOfFiles[ii];
        if (fileIsErrorFree(file, errors))
        {
            displayFile = makeDisplayFile(file);
            addPreviewToFile(file, displayFile, errors);
            addWarnings(file, errors);
            filesToDisplays.set(file, displayFile);
            displaysToFiles.set(displayFile, file);
        }
    }
    $("#buttonSave").css("visibility", "visible");
    loadStatus = makeLoadStatusMessages(errors);
    document.getElementById("results").appendChild(loadStatus);
}

/**
 * Returns true if a variable is undefined, null, or an empty string
 */
function isInvalid(toTest)
{
    return typeof toTest === "undefined" || toTest === null || toTest === "";
}

/**
 * Adds warnings and errors to the provided error object based on the file
 * provided. Returns true if the error count for this file is 0.
 */
function fileIsErrorFree(file, errors)
{
    isError = false;
    if (isInvalid(file.name))
    {
        isError = true;
        errors.noName += 1;
    }
    if (isInvalid(file.path))
    {
        isError = true;
        errors.noPath += 1;
    }
    if (isError)
    {
        errors.errors += 1;
        errors.errorFiles.push(file);
        return false;
    }
    return true;
}

function addWarnings(file, errors)
{
    isWarning = false;
    if (isInvalid(file.datetime))
    {
        isWarning = true;
        errors.noTime += 1;
    }
    if (isWarning)
    {
        errors.warnings += 1;
        errors.warningFiles.push(file);
    }
    else
    {
        errors.fine += 1;
    }
}

/**
 * Creates status messages for load successes/failures, and returns the
 * div for the status message.
 */
function makeLoadStatusMessages(errors)
{
    bgColour = "#E4E4FF";
    if (errors.errors > 0)
    {
        bgColour = "#FFE4E4";
    }
    else if (errors.warnings > 0)
    {
        bgColour = "#FFF4E4";
    }
    contents = errors.fine + " entries loaded without error.";
    if (errors.noName > 0)
    {
        contents = errors.noName + " entries couldn't be loaded due to lacking a name.\n" + contents;
    }
    if (errors.noPath > 0)
    {
        contents = errors.noPath + " entries couldn't be loaded due to lacking a path.\n" + contents;
    }
    if (errors.noTime > 0)
    {
        contents = errors.noTime + " entries were loaded but lack a date and time.\n" + contents;
    }
    return makeDisplayStatus("Tags file loaded!", contents, bgColour);
}

/**
 * Creates a div in the results to convey information.
 */
function makeDisplayStatus(title, contents, bgColour)
{
    statusContainer = parseHTML('<div class="displayObject" style="background-color:' + bgColour + ';"></div>');
    titleSpan = parseHTML('<span class="displayFilename">' + title + '</span>');
    quitButton = parseHTML('<a href="#" class="singleCharButton" style="float:right;" onclick="destroyParentElement(this)">x</a>');
    statusContainer.appendChild(titleSpan);
    statusContainer.appendChild(quitButton);
    statusContainer.appendChild(document.createElement('br'));
    if (typeof contents === "string")
    {
        contents = contents.replace(/\n/g, "<br />");
        contentsPara = parseHTML('<span class="displayText">' + contents + '</span>');
        statusContainer.appendChild(contentsPara);
    }
    else
    {
        statusContainer.appendChild(contents);
    }
    return statusContainer;
}

/**
 * Returns true if str ends with any of the entries in arr
 */
function endsWithAny(str, arr)
{
    found = false;
    arr.forEach(function(ii) {
        if (str.endsWith(ii))
        {
            found = true;
        }
    });
    return found;
}

/**
 * For each text file, adds their contents to the display file, and also
 * maps the JSON file representation to said contents.
 */
function addPreviewToFile(file, displayFile)
{
    extText = ["txt", "md"];
    extMedia = ["mp3", "m4a", "aac", "mp4"];
    if (endsWithAny(file.name, extText))
    {
        //its a text file
        loadTextPreview(file, displayFile, applyTextPreview, applyTextPreviewFailure, errors);
    }
    else
    {
        previewNode = createOtherPreview(file.path, file.name);
        previewContainer = parseHTML('<div class="preview"></div>');
        previewContainer.appendChild(previewNode);
        if (endsWithAny(file.name, extMedia))
        {
            previewNode.querySelector("source").onerror = function(e) {
                replaceWithPreviewUnloadable(previewContainer);
            };
        }
        displayFile.appendChild(previewContainer);
    }
}

function applyTextPreview(jsonFile, displayFile, fileContents)
{
    filesToContents.set(jsonFile, fileContents);
    halfContainer = displayFile.querySelector(".halfContainer");
    halfContainer.innerHTML = '';
    halfContainer.className = 'preview text';
    contents = document.createElement("span");
    contents.className = "displayText";
    contents.innerHTML = fileContents.replace(/\n/g, "<br />");
    halfContainer.appendChild(contents);
}

function applyTextPreviewFailure(displayFile, errors)
{
    halfContainer = displayFile.querySelector(".halfContainer");
    halfContainer.innerHTML = '';
    contents = document.createElement("span");
    contents.className = "displayText italics";
    contents.innerHTML = "The text file couldn't be loaded.";
    halfContainer.appendChild(contents);
    errors.noPreview += 1;
}

function replaceWithPreviewUnloadable(preview)
{
    preview.innerHTML = '<span class="displayText italics">The preview couldn\'t be loaded. Does the file exist?</span>';
}

/**
 * saves the tags as json fille
 **/
function saveTags()
{
    listOfFiles = [];
    for ([key, value] of filesToDisplays)
    {
        listOfFiles.push(key);
    }
    saveFile(listOfFiles);
}

/**
 * Calls searchFiles with value of search text
 * Will eventually be fleshed out
 **/
function performSearch(button)
{
    $("#results").empty();
    settings = getSearchSettings();
    resultsList = [];
    for ([key, value] of filesToDisplays)
    {
        if (doesFileMatch(key, settings))
        {
            resultsList.push(key);
        }
    }
    compareFunc = getCompareFunc();
    filterFunc = getFilterFunc();
    if (compareFunc !== null) {
        resultsList = resultsList.filter(filterFunc);
        resultsList.sort(compareFunc);
    }
    fragment = document.createDocumentFragment();
    for (result of resultsList)
    {
        fragment.appendChild(filesToDisplays.get(result));
    }
    document.getElementById("results").appendChild(fragment);
}

function getFilterFunc() {
    selection = document.getElementById("sortSelection");
    switch (selection.value) {
        case "dateAsc":
        case "dateDesc":
            return sortDateFilter;
        case "filenameAsc":
        case "filenameDesc":
            return sortFilenameFilter;
    }
    return null;
}

function getCompareFunc() {
    selection = document.getElementById("sortSelection");
    switch (selection.value) {
        case "dateAsc":
            return sortCompareDateAsc;
        case "dateDesc":
            return sortCompareDateDesc;
        case "filenameAsc":
            return sortCompareFilenameAsc;
        case "filenameDesc":
            return sortCompareFilenameDesc;
    }
    return null;
}

function sortCompareDateAsc(a, b) {
    if (a.datetime < b.datetime)
    {
        return -1;
    }
    else if (a.datetime > b.datetime) {
        return 1;
    }
    return 0
}

function sortCompareDateDesc(a, b)
{
    return -(sortCompareDateAsc(a, b));
}

function sortCompareFilenameAsc(a, b) {
    if (a.name < b.name)
    {
        return -1;
    }
    else if (a.name > b.name) {
        return 1;
    }
    return 0
}

function sortCompareFilenameDesc(a, b)
{
    return -(sortCompareFilenameAsc(a, b));
}

function sortDateFilter(file) {
    return typeof file.datetime !== "undefined";
}

function sortFilenameFilter(file) {
    return typeof file.name !== "undefined";
}

/**
 * Returns an object representing the search's settings
 */
function getSearchSettings()
{
    input = document.getElementsByClassName("searchbar")[0];
    settings = {term : input.value, searchtype: "", includetypes: ""};

    possibleSearches = "fpdtqnc";
    for (ii = 0; ii < possibleSearches.length; ii++)
    {
        thisChar = possibleSearches.charAt(ii);
        checkbox = document.getElementById("searchInclude" + thisChar.toUpperCase());
        if (checkbox.checked)
        {
            settings.searchtype += thisChar;
        }
    }
    if (document.getElementById("searchFromT").checked) {
        settings.includetypes += "t";
    }
    if (document.getElementById("searchFromA").checked) {
        settings.includetypes += "a";
    }
    console.log(settings.searchtype);
    return settings;
}

/**
 * displays all files
 **/
function displayAllFiles()
{
    fragment = document.createDocumentFragment();
    for ([key, value] of filesToDisplays)
    {
        fragment.appendChild(value);
    }
    document.getElementById("results").appendChild(fragment);
}

function isFileText(file) {
    if (filesToContents.has(file)) {
        return true;
    }
    return false;
}

/**
 * Checks if the file matches the specified search terms
 **/
function doesFileMatch(file, settings)
{
    if (settings.includetypes.includes("t") && isFileText(file) ||
        settings.includetypes.includes("a") && !isFileText(file))
    {
        if (settings.searchtype.includes("f") && betterStringContains(file.name, settings.term))
        {
            return true;
        }
        if (settings.searchtype.includes("p") && betterStringContains(file.path, settings.term))
        {
            return true;
        }
        if (settings.searchtype.includes("d") && betterStringContains(file.datetime, settings.term))
        {
            return true;
        }
        if (settings.searchtype.includes("n") && betterStringContains(file.notes, settings.term))
        {
            return true;
        }
        if (settings.searchtype.includes("t"))
        {
            base = "";
            for (ii = 0; ii < file.tags.length; ii++)
            {
                base += file.tags[ii].text + "\n";
            }
            if (betterStringContains(base, settings.term))
            {
                return true;
            }
        }
        if (settings.searchtype.includes("q"))
        {
            base = "";
            for (ii = 0; ii < file.quotes.length; ii++)
            {
                base += file.quotes[ii].text + "\n";
            }
            if (betterStringContains(base, settings.term))
            {
                return true;
            }
        }
        if (settings.searchtype.includes("c"))
        {
            contents = filesToContents.get(file);
            if (typeof contents !== "undefined" && betterStringContains(contents, settings.term))
            {
                return true;
            }
        }
    }
    return false;
}

function betterStringContains(base, toFind)
{
    if (base !== null && typeof base !== "undefined" && base.includes(toFind))
    {
        return true;
    }
    return false;
}

/**
 * Creates spans for all time elements of each time element type for the
 * specified file.
 **/
function makeTimeElementHtml(objects, type)
{
    elementsTime = [];
    objects.forEach( function(element) {
        elText = '<span class="displayText">' + element.text + '</span>';
        if (element.isTimed === "true" || element.isTimed === true)
        {
            elText += '<a class="displayTimecode" href="#" onclick="jumpToTimecode(this)"> @' + element.time + '</a>';
        }
        elementsTime.push(elText);
    });
    return elementsTime;
}

/**
 * Formats file time into a human readable string
 **/
function formatTime(thisTime)
{
    toReturn = thisTime.slice(8,10) + ":" + thisTime.slice(10,12) + ", ";
    toReturn += thisTime.slice(6,8) + "." + thisTime.slice(4,6) + "." + thisTime.slice(0,4);
    return toReturn;
}

/**
 * Parses human readable time string into time string to be used in the file's
 * JSON representation
 **/
function parseTimeString(thisTime)
{
    time = thisTime.slice(13, 17);     //year
    time += thisTime.slice(10, 12);    //month
    time += thisTime.slice(7, 9);      //day
    time += thisTime.slice(0, 2);      //hour
    time += thisTime.slice(3, 5);      //minute
    return time;
}

/**
 * Creates text area for notes for the specified file and appends it to the
 * note's div
 **/
function createNoteTextarea(editNode, file)
{
    editNode.append('<span class="displaySubheader">Notes:</span><br />');
    notesBox = $('<textarea rows="6" class="notesBox"></textarea>');
    noteText = file.find(".noteContainer > .displayText").html();
    if (typeof noteText !== "undefined")
    {
        noteText = noteText.replace(/<br( \/)?>/g, "\n");
        notesBox.val(noteText);
    }
    editNode.append(notesBox);
}

/**
 * Called when clicking a +timeelement button. creates the specified time
 * time element div
 **/
function plusTimeElementClick(button, atCurrentTime)
{
    displayHalf = $(button).parent();
    if (atCurrentTime)
    {
        //will get current time later
        preview = $(button).closest('div[class="displayObject"]').find("audio");
        currentTime = Math.floor(preview[0].currentTime);
        button = createTimeElementDiv(displayHalf, "", currentTime, true);
    }
    else
    {
        createTimeElementDiv(displayHalf, "", 0, false);
    }
}

/**
 * deletes the time element that this button belongs to
 **/
function deleteTimeElement(button)
{
    $(button).parent().remove();
}

/**
 * Creates the div for an editable time element and appends it to its container
 **/
function createTimeElementDiv(displayHalf, text, time, isTimed)
{
    timeElementContainer = displayHalf.find(".timeElementContainer");
    timeElement = $('<div class="timeElement"></div>');
    timeElement.append('<a href="#deleteTE" class="singleCharButton" onclick="deleteTimeElement(this)">x</a><span class="singleCharButton"> </span>');
    timeElement.append('<input class="inputText" value="' + text + '"></input>');
    timeElement.append('<span class="singleCharButton"> @</span>');
    timeElement.append('<input class="inputTime" value="' + time + '"></input><br />');
    timedCheckbox = $('<input type="checkbox" class="elementIsTimed" onchange="toggleTimeSettings(this)"></input>');
    timeElement.append(timedCheckbox);
    timeElement.append('<span class="textTimeEditNoclick">Is this timed?</span>');
    if (isTimed)
    {
        timedCheckbox[0].checked = true;
        toggleTimeSettings(timedCheckbox[0]);
    }
    timeElementContainer.append(timeElement);
    return timeElement;
}

/**
 **/
function toggleTimeSettings(checkbox)
{
    timeElement = $(checkbox).parent();
    if (checkbox.checked)
    {
        timeElement.append('<div class="textTimeEditSeperator"></div><a href="#" onclick="jumpToTime(this)" class="textTimeEdit">Jump to this time</a>');
        timeElement.append('<div class="textTimeEditSeperator"></div><a href="#" onclick="setToCurrentTime(this)" class="textTimeEdit">Set to current time</a>');
    }
    else
    {
        timeElement.find(".textTimeEditSeperator").remove();
        timeElement.find(".textTimeEdit").remove();
    }
}

/**
 **/
function jumpToTimecode(button)
{
    preview = $(button).closest('div[class="displayObject"]').find("audio");
    if (preview.length > 0)
    {
        preview[0].currentTime = parseInt(button.innerHTML.substr(2));
    }
}

/**
 **/
function jumpToTime(button)
{
    preview = $(button).closest('div[class="displayObject"]').find("audio");
    if (preview.length > 0)
    {
        thisTime = $(button).parent().find(".inputTime")[0].value;
        preview[0].currentTime = thisTime;
    }
}

/**
 **/
function setToCurrentTime(button)
{
    preview = $(button).closest('div[class="displayObject"]').find("audio");
    if (preview.length > 0)
    {
        currentTime = Math.floor(preview[0].currentTime);
        $(button).parent().find(".inputTime")[0].value = currentTime;
    }
}

/**
 * Converts all spans of time elements into editable time elements
 **/
function populateTimeElementContainer(displayHalf, file, type)
{
    elementList = file.find(".halfContainer > .displayHalf." + type + " > .elementList");
    elementList.children().each( function() {
        elementText = $(this).find(".displayText").html();
        elementTime = $(this).find(".displayTimecode").html();
        if (typeof elementTime != "undefined")
        {
            elementTime = elementTime.replace(/ ?@/, "");
            createTimeElementDiv(displayHalf, elementText, elementTime, true);
        }
        else
        {
            createTimeElementDiv(displayHalf, elementText, 0, false);
        }
    });
}

/**
 * Creates the container for editable time elements
 **/
function createTimeElementsArea(editNode, file)
{
    halfContainer = $("<div class='halfContainer'></div>");
    editNode.append(halfContainer);
    elementType = ["Tag", "Quote"];
    ii = 0;
    file.find(".halfContainer").children().each( function () {
        displayHalf = $('<div class="' + this.className + '"></div>');
        halfContainer.append(displayHalf);
        displayHalf.append('<span class="displaySubheader">' + elementType[ii] + 's:</span>');
        timeElementContainer = $('<div class="timeElementContainer"></div>');
        displayHalf.append(timeElementContainer);
        populateTimeElementContainer(displayHalf, file, elementType[ii]);
        displayHalf.append('<a class="textTimeEdit" href="#createTE" onclick="plusTimeElementClick(this, false)">+' + elementType[ii] + '</a><div class="textTimeEditSeperator"></div>');
        displayHalf.append('<a class="textTimeEdit" href="#createTE" onclick="plusTimeElementClick(this, true)">+' + elementType[ii] + ' at current time</a><div class="textTimeEditSeperator"></div>');
        ii++;
    });
}

/**
 * swap display file to editing mode: create editing elements and hide display
 * ones.
 **/
function swapFileToEdit(button)
{
    file = $(button.parentElement);
    file.find(".editButton").hide();
    file.find(".halfContainer").hide();
    file.find(".noteContainer").hide();
    editNode = $('<div class="editFile"></div>');
    saveChangesButton = $('<button class="exitEditButton" onclick="swapFileToPreview(this, true)">Save changes</button>');
    saveChangesButton.insertBefore(file.find(".editButton")[0]);
    discardChangesButton = $('<button class="exitEditButton" onclick="swapFileToPreview(this, false)">Discard changes</button>');
    discardChangesButton.insertBefore(saveChangesButton);
    editNode.insertBefore(file.find(".preview")[0]);
    createTimeElementsArea(editNode, file);
    createNoteTextarea(editNode, file);
}

/**
 * return a json representation of the edited file
 **/
function getNewFileJson(editNode)
{
    newFile = {};
    newFile.name = editNode.parent().find(".displayFilename").html();
    newFilePathStr = editNode.parent().find(".displayTimecode.path").html();
    if (typeof newFilePathStr != "undefined")
    {
        newFile.path = newFilePathStr.replace(/Path: ?/g, "");
    }
    newFileTimeStr = editNode.parent().find(".displayTimecode.time").html();
    newFile.datetime = parseTimeString(newFileTimeStr);
    newFile.notes = editNode.find(".notesBox").val();
    displayHalfList = editNode.find(".halfContainer").children();
    newFile.tags = getNewFileTimeElements(displayHalfList[0])
    newFile.quotes = getNewFileTimeElements(displayHalfList[1])
    return newFile;
}

/**
 * turns editable time elements into list of json representation
 **/
function getNewFileTimeElements(displayHalf)
{
    toReturn = [];
    $(displayHalf).find(".timeElementContainer > .timeElement").each( function() {
        timeElement = {text: $(this).find(".inputText").val()};
        timeElement.time = $(this).find(".inputTime").val();
        timeElement.isTimed = $(this).find(".elementIsTimed")[0].checked;
        toReturn.push(timeElement);
    });
    return toReturn;
}

/**
 * replaces specified file in both file maps
 **/

function replaceFileInMaps(newFile, displayFile)
{
    oldFile = displaysToFiles.get(displayFile);
    contents = filesToContents.get(oldFile);

    displaysToFiles.delete(displayFile);
    filesToDisplays.delete(oldFile);
    filesToContents.delete(oldFile);
    displaysToFiles.set(displayFile, newFile);
    filesToDisplays.set(newFile, displayFile);
    if (contents != null)
    {
        filesToContents.set(newFile, contents);
    }
}

/**
 * destroy contents of editing elements and show display ones. optionally save
 **/
function swapFileToPreview(button, saveChanges)
{
    file = $(button.parentElement);
    editNode = file.find(".editFile");
    if (saveChanges)
    {
        newFileJson = getNewFileJson(editNode);
        replaceFileInMaps(newFileJson, file[0]);
        if (!filesToContents.has(newFileJson))
        {
            // this journal isn't text, so we need to recreate time elements
            file.find(".halfContainer").remove();
            createFileDisplayTimeElements(file, newFileJson);
            file.find(".noteContainer").remove();
            createFileDisplayNotes(file, newFileJson);
            file.append(file.find(".preview")[0]);
        }
        else
        {
            // all we do for text files is create the new note container
            file.find(".noteContainer").remove();
            createFileDisplayNotes(file, newFileJson);
        }
    }
    editNode.remove();
    file.find(".exitEditButton").remove();
    file.find(".editButton").show();
    file.find(".halfContainer").show();
    file.find(".noteContainer").show();
}

/**
 *
 **/
function createFileDisplayBase(file)
{
    displayNode = $('<div class="displayObject"></div>');
    displayNode.append('<span class="displayFilename">' + $(file).attr("name") + '</span>');
    displayNode.append('<button class="editButton" onclick="swapFileToEdit(this)">Edit file</button><br />');

    if (file.datetime !== null && typeof file.datetime !== "undefined")
    {
        displayNode.append('<span class="displayTimecode time">' + formatTime(file.datetime) + "</span><br />")
    }
    if (file.path !== null && typeof file.path !== "undefined")
    {
        displayNode.append('<span class="displayTimecode path">Path: ' + file.path + "</span><br />")
    }
    return displayNode;
}

function createFileDisplayNotes(displayNode, file)
{
    noteContainer = $('<div class="noteContainer"></div>');
    noteText = file.notes;
    if (noteText !== "" && noteText !== null && typeof noteText !== "undefined")
    {
        noteContainer.append('<br><span class="displaySubheader">Notes:</span><br>');
        noteText = noteText.replace(/\n/g, "<br />");
    }
    else
    {
        noteContainer.append('<br><span class="displaySubheader">No notes.</span><br>')
        noteText = "";
    }
    noteContainer.append('<span class="displayText">' + noteText + '</span>');
    displayNode.append(noteContainer);
}

function createFileDisplayTimeElements(displayNode, file)
{
    halfContainer = $('<div class="halfContainer"></div>');
    displayNode.append(halfContainer);

    halfTag = $('<div class="displayHalf Tag"></div>');
    tags = makeTimeElementHtml(file.tags, "Tag");
    if (tags.length > 0)
    {
        halfTag.append('<span class="displaySubheader">Tags:</span><br>');
        tagList = $('<ul class="elementList"></ul>');
        halfTag.append(tagList);
        tags.forEach( function(entry) {
            tagEntry = $("<li>" + entry + "</li>")
            tagList.append(tagEntry);
        });
    }
    else
    {
        halfTag.append('<span class="displaySubheader">No tags.</span><br>');
    }
    halfContainer.append(halfTag);

    halfQuote = $('<div class="displayHalf Quote"></div>');
    quotes = makeTimeElementHtml(file.quotes, "Quote");
    if (quotes.length > 0)
    {
        halfQuote.append('<span class="displaySubheader">Quotes:</span><br>');
        quoteList = $('<ul class="elementList"></ul>');
        halfQuote.append(quoteList);
        quotes.forEach( function(entry) {
            quoteEntry = $("<li>" + entry + "</li>")
            quoteList.append(quoteEntry);
        });
    }
    else
    {
        halfQuote.append('<span class="displaySubheader">No quotes.</span><br>');
    }
    halfContainer.append(halfQuote);
}

/**
 * Create a div to display a file from its JSON representation
 **/
function makeDisplayFile(file)
{
    displayNode = createFileDisplayBase(file);
    createFileDisplayTimeElements(displayNode, file);
    createFileDisplayNotes(displayNode, file);

    return displayNode[0];
}

/**
 * Parses a string to a HTML element.
 */
function parseHTML(str)
{
    pParent = document.createElement('div');
    pParent.innerHTML = str;
    return pParent.firstChild;
}

function destroyParentElement(element)
{
    toDestroy = element.parentNode;
    toDestroy.parentNode.removeChild(toDestroy);
}

window.onload = loadTags;
