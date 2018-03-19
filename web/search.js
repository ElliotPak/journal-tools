searchLoaded = true;

listOfFiles = [];

function startSearching(jsonNode)
{
	listOfFiles = jsonNode;
	$("#buttonSave").css("visibility", "visible");
}

/**
 * saves the tags as json fille
 **/
function saveJsonFile()
{
	saveFile(listOfFiles);
}

/**
 * Calls searchFiles with value of search text
 * Will eventually be fleshed out
 **/
function performSearch(button)
{
	$("#results").empty();
	input = $(button).parent().find("input");
	settings = {term : input[0].value, searchtype: "tfnp"};
	list = searchFiles(listOfFiles, settings);
}

/**
 * Returns a list of files that match the specified search terms
 **/
function searchFiles(fileList, settings)
{
	resultList = [];
	for (ii = 0; ii < fileList.length; ii++)
	{
		if (doesFileMatch(fileList[ii], settings))
		{
			resultList.push(fileList[ii]);
		}
	}
	return resultList;
}

/**
 * Checks if the file matches the specified search terms
 **/
function doesFileMatch(file, settings)
{
	match = false;
	jj = 0
	if (file.notes !== null && typeof file.notes != "undefined")
	{
		if (file.notes.indexOf(settings.term) !== -1)
		{
			match = true;
		}
	}
	while (jj < file.tags.length && !match)
	{
		tagText = file.tags[jj].text;
		if (tagText.indexOf(settings.term) !== -1)
		{
			match = true;
		}
		jj++;
	}
	jj = 0;
	while (jj < file.quotes.length && !match)
	{
		tagText = file.quotes[jj].text;
		if (tagText.indexOf(settings.term) !== -1)
		{
			match = true;
		}
		jj++;
	}
	if (match === true)
	{
		createFileDisplay(file);
	}
	return match;
}

/**
 * Creates spans for all time elements of each time element type for the 
 * specified file.
 **/
function getTimeElementsHTML(node, type)
{
	elementsTime = [];
	objects = [];
	if (type === "Tag")
	{
		objects = node.tags;
	}
	if (type === "Quote")
	{
		objects = node.quotes;
	}
	objects.forEach( function(element) {
		elText = '<span class="displayText">' + element.text + '</span>';
		if (element.time !== -1)
		{
			elText += '<span class="displayTimecode"> @' + element.time + '</span>';
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
		createTimeElementDiv(displayHalf, "", 0, true);
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
	timeElement.append('<a href="#deleteTE" class="textTimeEditSingleChar" onclick="deleteTimeElement(this)">x</a>');
	timeElement.append('<input class="inputText" value="' + text + '"></input>');
	timeElement.append('<span class="textTimeEditSingleChar"> @</span>');
	timeElement.append('<input class="inputTime" value="' + time + '"></input><br />');
	timeElementContainer.append(timeElement);
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
		displayHalf = $('<div class="displayHalf"></div>');
		halfContainer.append(displayHalf);
		displayHalf.append('<span class="displaySubheader">' + elementType[ii] + 's:</span>');
		timeElementContainer = $('<div class="timeElementContainer"></div>');
		displayHalf.append(timeElementContainer);
		populateTimeElementContainer(displayHalf, file, elementType[ii]);
		displayHalf.append('<a class="textTimeEdit" href="#createTE" onclick="plusTimeElementClick(this, false)">+' + elementType[ii] + '</a>');
		displayHalf.append('<a class="textTimeEdit" href="#createTE" onclick="plusTimeElementClick(this, true)">+' + elementType[ii] + ' at current time</a>');
		ii++;
	});
}

/**
 * Changes display text for a file's notes to the value in the note textarea
 **/
function saveNoteTextarea(newFileJson, file)
{
	newNoteText = newFileJson.notes;
	noteDisplaySelector = file.find(".noteContainer > .displayText");
	
	if (noteDisplaySelector.length != 0)
	{
		noteDisplaySelector.html(newNoteText);
	}
	if (newNoteText != "")
	{
		file.find(".noteContainer > .displaySubheader").html("Notes:");
	}
	else
	{
		file.find(".noteContainer > .displaySubheader").html("No notes.");
	}
}

/**
 * Changes display text for a file's time elements to the value in the editable
 * ones
 **/
function saveTimeElementsArea(editNode, file)
{
}

/**
 * Creates a new span for a time element
 **/
function displayNewTimeElement(thisList, element)
{
	newElement = $("<li></li>");
	elementText = element.find(".inputText").val();
	elementTime = element.find(".inputTime").val();
	newElement.append('<span class="displayText">' + elementText + '</span>');
	newElement.append('<span class="displayTimecode"> @' + elementTime + '</span>');
	thisList.append(newElement);
}

/**
 * swap display file to editing mode: create editing elements and hide display
 * ones.
 **/
function editFile(button)
{
	file = $(button.parentElement);
	file.find(".editButton").hide();
	file.find(".halfContainer").hide();
	file.find(".noteContainer").hide();
	editNode = $('<div class="editFile"></div>');
	saveChangesButton = $('<button class="exitEditButton" onclick="goBackToFilePreview(this, true)">Save changes</button>');
	saveChangesButton.insertBefore(file.find(".editButton")[0]);
	discardChangesButton = $('<button class="exitEditButton" onclick="goBackToFilePreview(this, false)">Discard changes</button>');
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
	newFile.path = newFilePathStr.replace(/Path: ?/g, "");
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
		timeElement.isTimed = false;
		toReturn.push(timeElement);
	});
	return toReturn;
}

/**
 * replaces specified file in listOfFiles
 **/

function replaceFileInList(file)
{
	for (var ii = 0; ii < listOfFiles.length; ii++)
	{
		iterFile = listOfFiles[ii];
		if (file.path === iterFile.path && file.name === iterFile.name)
		{
			listOfFiles[ii] = file;
		}
	}
}

/**
 * destroy contents of editing elements and show display ones. optionally save
 **/
function goBackToFilePreview(button, saveChanges)
{
	file = $(button.parentElement);
	editNode = file.find(".editFile");
	if (saveChanges)
	{
		newFileJson = getNewFileJson(editNode);
		replaceFileInList(newFileJson);
		file.find(".halfContainer").remove();
		createFileDisplayTimeElements(file, newFileJson);
		file.find(".noteContainer").remove();
		createFileDisplayNotes(file, newFileJson);
		file.append(file.find(".preview")[0]);
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
	displayNode = $('<div class="displayFile"></div>');
	displayNode.append('<span class="displayFilename">' + $(file).attr("name") + '</span>');
	displayNode.append('<button class="editButton" onclick="editFile(this)">Edit file</button><br />');

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
	tags = getTimeElementsHTML(file, "Tag");
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
	quotes = getTimeElementsHTML(file, "Quote");
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
function createFileDisplay(file)
{
	displayNode = createFileDisplayBase(file);
	createFileDisplayTimeElements(displayNode, file);
	createFileDisplayNotes(displayNode, file);

	preview = createPreview(file.path, file.name);
	displayNode.append(preview);

	$("#results").append(displayNode);
	$("#results").append("<br>");
}
