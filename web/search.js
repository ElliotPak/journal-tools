searchLoaded = true;

listOfFiles = [];

function startSearching(jsonNode)
{
    listOfFiles = jsonNode;
}

function getListOfFiles(xmlNode)
{
    xmlNode.find("File").each(function() {
        listOfFiles.push(convertFileToJson(this));
    });
}

function performSearch(button)
{
    $("#results").empty();
    input = $(button).parent().find("input");
    settings = {term : input[0].value, searchtype: "tfnp"};
    list = searchFiles(listOfFiles, settings);
}

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
        displayFile(file);
    }
    return match;
}

function getNoteContents(file)
{
    toReturn = "";
    noteSelector = $(file).find("Notes");
    if (noteSelector.length > 0)
    {
        node = noteSelector[0];
        toReturn = node.innerHTML;
        toReturn = toReturn.replace(/\n/g, "<br />");
    }
    return toReturn;
}

function getTimeElements(node, type)
{
    elements = []
    $(node).find(type).each( function() {
        thisEl = {text: this.innerHTML, time: -1};
        if ($(this).attr("isTimed") === "true")
        {
            thisEl.time = $(this).attr("time");
        }
        elements.push(thisEl);
    });
    return elements;
}

function convertFileToJson(file)
{
    jsonFile = {name: $(file).attr("name")};
    jsonFile.tags = getTimeElements(file, "Tag");
    jsonFile.quotes = getTimeElements(file, "Quote");
    jsonFile.notes = getNoteContents(file);
    return jsonFile;
}

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

function displayFiles(list)
{
    $("#results").empty();
    for (ii = 0; ii < list.length; ii++)
    {
        displayFile(list[ii]);
    }
}

function formatTime(thisTime)
{
    toReturn = thisTime.slice(8,10) + ":" + thisTime.slice(10,12) + ", ";
    toReturn += thisTime.slice(6,8) + "." + thisTime.slice(4,6) + "." + thisTime.slice(0,4);
    return toReturn;
}

function displayFile(file)
{
    halfTag = $('<div class="displayHalf"></div>');
    tags = getTimeElementsHTML(file, "Tag");
    if (tags.length > 0)
    {
        halfTag.append('<span class="displaySubheader">Tags:</span><br>');
        tagList = $('<ul class="tagList"></ul>');
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

    halfQuote = $('<div class="displayHalf"></div>');
    quotes = getTimeElementsHTML(file, "Quote");
    if (quotes.length > 0)
    {
        halfQuote.append('<span class="displaySubheader">Quotes:</span><br>');
        quoteList = $('<ul class="quoteList"></ul>');
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

    displayNode = $('<div class="displayFile"></div>');
    displayNode.append('<span class="displayFilename">' + $(file).attr("name") + '</span><br>');

    fileSubtitleString = "";
    if (file.datetime !== null && typeof file.datetime !== "undefined")
    {
        fileSubtitleString = formatTime(file.datetime);
    }
    if (file.path !== null && typeof file.path !== "undefined")
    {
        if (fileSubtitleString !== "")
        {
            fileSubtitleString += ", ";
        }
        fileSubtitleString += "path: \"" + file.path + "\"";
    }
    if (fileSubtitleString !== "")
    {
        displayNode.append('<span class="displayTimecode">' + fileSubtitleString + '</span><br />');
    }

    halfContainer = $('<div class="halfContainer"></div>');
    halfContainer.append(halfTag);
    halfContainer.append(halfQuote);
    displayNode.append(halfContainer);
    noteNode = file.notes;
    if (noteNode !== "" && noteNode !== null && typeof noteNode !== "undefined")
    {
        noteNode = noteNode.replace(/\n/g, "<br />");
        displayNode.append('<br><span class="displaySubheader">Notes:</span><br>');
        displayNode.append('<span class="displayText">' + noteNode + '</span>');
    }
    else
    {
        displayNode.append('<br><span class="displaySubheader">No notes.</span>')
    }
    $("#results").append(displayNode);
    $("#results").append("<br>");
}
