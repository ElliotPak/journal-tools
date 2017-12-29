searchLoaded = true;

listOfFiles = [];

function startSearching(xmlNode)
{
    getListOfFiles(xmlNode);
    displayFiles(listOfFiles);
}

function getListOfFiles(xmlNode)
{
    xmlNode.find("File").each(function() {
        listOfFiles.push(this);
    });
}

function displayFiles(list)
{
    for (ii = 0; ii < list.length; ii++)
    {
        displayFile(list[ii]);
    }
}

function getTimeElementObjects(node, type)
{
    elements = []
    $(node).find(type).each( function() {
        thisEl = {text: this.innerHTML, time: -1};
        if ($(node).attr("isTimed") === "true")
        {
            thisEl.time = $(this).attr("time");
        }
        elements.push(thisEl);
    });
    return elements;
}

function getTimeElements(node, type)
{
    elementsTime = [];
    objects = getTimeElementObjects(node, type);
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

function getNoteContents(file)
{
    toReturn = "";
    noteSelector = $(file).find("Notes");
    if (noteSelector.length > 0)
    {
        node = noteSelector[0];
        console.log(noteSelector[0]);
        toReturn = node.innerHTML;
        toReturn = toReturn.replace(/\n/g, "<br />");
    }
    return toReturn;
}

function displayFile(file)
{
    halfTag = $('<div class="displayHalf"></div>');
    tags = getTimeElements(file, "Tag");
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
    quotes = getTimeElements(file, "Quote");
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
    halfContainer = $('<div class="halfContainer"></div>');
    halfContainer.append(halfTag);
    halfContainer.append(halfQuote);
    displayNode.append(halfContainer);
    noteNode = getNoteContents(file);
    if (noteNode !== "")
    {
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