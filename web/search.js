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

function displayFile(file)
{
    halfTag = $('<div class="displayHalf"></div>');
    halfTag.append('<span class="displaySubheader">Tags:</span><br>');
    $(file).find("Tag").each(function() {
        tagSpan = $('<span class="displayText">' + this.innerHTML + '</span>');
        halfTag.append(tagSpan);
        if ($(this).attr("isTimed") === "true")
        {
            timeSpan = $('<span class="displayTimecode"> @' + $(this).attr("time") + '</span>');
            halfTag.append(timeSpan);
        }
        halfTag.append("<br>");
    });

    halfQuote = $('<div class="displayHalf"></div>');
    halfQuote.append('<span class="displaySubheader">Quotes:</span><br>');
    $(file).find("Quote").each(function() {
        tagSpan = $('<span class="displayText">' + this.innerHTML + '</span>');
        halfQuote.append(tagSpan);
        if ($(this).attr("isTimed") === "true")
        {
            timeSpan = $('<span class="displayTimecode"> @' + $(this).attr("time") + '</span>');
            halfQuote.append(timeSpan);
        }
        halfQuote.append("<br>");
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