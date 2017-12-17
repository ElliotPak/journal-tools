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

function getTimeElements(node, type)
{
    elements = [];
    $(node).find(type).each( function() {
        text = '<span class="displayText">' + this.innerHTML + '</span>';
        if ($(node).attr("isTimed") === "true")
        {
            text += '<span class="displayTimecode"> @' + $(this).attr("time") + '</span>';
        }
        elements.push(text);
    });
    return elements;
}

function displayFile(file)
{
    halfTag = $('<div class="displayHalf"></div>');
    halfTag.append('<span class="displaySubheader">Tags:</span><br>');
    tagList = $('<ul class="tagList"></ul>');
    halfTag.append(tagList);
    tags = getTimeElements(file, "Tag");
    tags.forEach( function(entry) {
        tagEntry = $("<li>" + entry + "</li>")
        tagList.append(tagEntry);
    });

    halfQuote = $('<div class="displayHalf"></div>');
    halfQuote.append('<span class="displaySubheader">Quotes:</span><br>');
    quoteList = $('<ul class="quoteList"></ul>');
    halfQuote.append(quoteList);
    quotes = getTimeElements(file, "Quote");
    quotes.forEach( function(entry) {
        quoteEntry = $("<li>" + entry + "</li>")
        quoteList.append(quoteEntry);
    });

    displayNode = $('<div class="displayFile"></div>');
    displayNode.append('<span class="displayFilename">' + $(file).attr("name") + '</span><br>');
    displayNode.append(halfTag);
    displayNode.append(halfQuote);
    noteSelector = $(file).find("Notes");
    if (noteSelector.length > 0)
    {
        displayNode.append('<br><span class="displaySubheader">Notes:</span><br>');
        console.log(noteSelector)
        displayNode.append('<span class="displayText">' + noteSelector[0].innerHTML + '</span>');
    }
    $("#results").append(displayNode);
    $("#results").append("<br>");
}