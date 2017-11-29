taggerLoaded = true;

taggerCurrentDir = null;
taggerCurrentFile = null;

function startEditing(xmlNode)
{
    taggerCurrentDir = xmlNode.children()[0];
    removeOldFileStuff();
    clearChildrenList();
    displayPath();
    makeChildrenList(xmlNode.children());
    $('#buttonSave').css('visibility', 'visible');
}

function saveTagFile()
{
    saveOldFile();
    saveFile();
}

function browseFolder(ii)
{
    thisNode = $(taggerCurrentDir).children()[ii];
    taggerCurrentDir = thisNode;
    clearChildrenList();
    addParent();
    makeChildrenList($(taggerCurrentDir));
    displayPath();
}

function changeSidebar() {
    clearChildrenList();
    taggerCurrentDir = taggerCurrentDir.parentNode;
    if (taggerCurrentDir.parentNode.nodeName != "#document")
    {
        addParent();
    }
    makeChildrenList(taggerCurrentDir.children);
    displayPath();
}

function backFolder()
{
    clearChildrenList();
    taggerCurrentDir = taggerCurrentDir.parentNode;
    if (taggerCurrentDir.parentNode.nodeName != "#document")
    {
        addParent();
    }
    makeChildrenList($(taggerCurrentDir));
    displayPath();
}

function addParent()
{
/*    link = document.createElement("a");
    link.href = "#";
    link.innerText = "<== back";
    link.classList.add("sidebarFolder");
    link.onclick = function() {backFolder();}; */
    $("#container").append('<a href="#" class="sidebarFolder" onclick="backFolder()">\<== back</a>');
    $("#container").append(document.createElement("br"));
}

function clearChildrenList()
{
    $("#container").empty();
}

function makeChildrenList(parent)
{
    ii = 0;
    parent.children().each(function()
    {
        link = '<a href="#" class="sidebarTYPE" onclick="FUNC(' + ii + ')">' + $(this).attr("name") + '</a>';
        if (this.nodeName === "Folder")
        {
            link = link.replace("sidebarTYPE", "sidebarFolder");
            link = link.replace("FUNC", "browseFolder");
        }
        else if (this.nodeName === "File")
        {
            link = link.replace("sidebarTYPE", "sidebarFile");
            link = link.replace("FUNC", "editFile");
        }
        $("#container").append(link);
        $("#container").append("<br />");
        ii++;
    });
}

function displayPath()
{
    if ($(".pathActual").length == 0)
    {
        $("#sidebar").prepend("<br>");
        $('#sidebar').prepend('<span class="pathActual">' + getPathName() + '</span>')
        $("#sidebar").prepend("<br>");
        $('#sidebar').prepend('<span class="pathHeader">Current path:</span>')
    }
    else
    {
        $(".pathActual")[0].innerText = getPathName();
    }
}

function getPathName()
{
    node = $(taggerCurrentDir);
    path = "/"
    while(node.parent()[0].nodeName != "#document")
    {
        path = "/" + node.attr("name") + path;
        node = node.parent();
    }
    return path;
}

function editFile(ii)
{
    saveOldFile()
    removeOldFileStuff();
    setUpEditor();
    taggerCurrentFile = $(taggerCurrentDir).children()[ii];
    name = $(taggerCurrentFile).attr("name");
    $("#filename").html(name);
    loadPreview(name);
    loadFileMetadata();
}

function removeOldFileStuff()
{
    thingsToRemove = ["#preview", "#notes", "#tagList", "#quoteList"];
    $("#preview").remove();
    $("#notesBox").val('');
    $('.timeElementTag').remove();
    $('.timeElementQuote').remove();
    $("#segmentTag").children(".timeElement").each(function() { $(this).remove(); });
    $("#segmentQuote").children(".timeElement").each(function() { $(this).remove(); });
}

function saveOldFile()
{
    if (taggerCurrentFile != null)
    {
        while (taggerCurrentFile.firstChild) {
            taggerCurrentFile.removeChild(taggerCurrentFile.firstChild);
        }

        notes = xmlDoc.createElement("Notes");
        notes.innerHTML = $("#notesBox").val();
        taggerCurrentFile.append(notes);
        saveFileElement("Tag");
        saveFileElement("Quote");
    }
}

function saveFileElement(type)
{
    $("#segment" + type).children(".timeElement").each(function() {
        node = xmlDoc.createElement(type);
        node.innerHTML = $(this).children('.inputText')[0].value;
        time = $(this).children('.inputTime')[0].value;
        isTimed = $(this).children('.isTimedCheckbox')[0].checked;
        node.setAttribute("time", time);
        node.setAttribute("isTimed", isTimed);
        taggerCurrentFile.append(node);
    });
}

function setUpEditor()
{
    if (taggerCurrentFile == null)
    {
        $(".loadNotice").remove();
        $("#editor").append('<div class="thirdHSegment" id="segmentMisc"></div>');
        $("#editor").append('<div class="thirdHSegment" id="segmentTag"></div>');
        $("#segmentTag").append('<span class="segmentHeader">Tags:</span><br />>');
        $("#segmentTag").append('<button onclick="addTag(false);">Add tag</button>');
        $("#segmentTag").append('<button onclick="addTag(true);">Add tag at current time</button>');
        $("#editor").append('<div class="thirdHSegment" id="segmentQuote"></div>');
        $("#segmentQuote").append('<span class="segmentHeader">Quotes:</span><br />');
        $("#segmentQuote").append('<button onclick="addQuote(false);">Add quote</button>');
        $("#segmentQuote").append('<button onclick="addQuote(true);">Add quote at current time</button>');
        $("#segmentMisc").append('<div class="halfVSegment" id="segmentPreview"></div>');
        $("#segmentPreview").append('<span class="pathHeader">Current file:</span>');
        $("#segmentPreview").append('<br />');
        $("#segmentPreview").append('<span class="pathActual" id="filename"></span>');
        $("#segmentPreview").append('<br />');
        $("#segmentPreview").append('<span class="segmentHeader">Preview:</span>');
        $("#segmentMisc").append('<div class="halfVSegment" id="segmentNotes"></div>');
        $("#segmentNotes").append('<span class="segmentHeader">Notes:</span><br />>');
        $("#segmentNotes").append('<textarea id="notesBox"></textarea>');
    }
}

function getFileNode(name)
{
    children = taggerCurrentDir.children;
    toReturn = null;
    for (var ii = 0; ii < children.length; ii++)
    {
        thisChild = children[ii];
        thisName = thisChild.getAttribute("name");
        if (thisChild.nodeName == "File" && thisName == name)
        {
            toReturn = thisChild;
        }
    }
    return toReturn;
}

function loadPreview(name)
{
    element = createPreview(getPathName(), name);
    $("#segmentPreview").append("<br />");
    $("#segmentPreview").append(element);
}

function loadFileMetadata()
{
    children = taggerCurrentFile.children;
    for (var ii = 0; ii < children.length; ii++)
    {
        thisChild = children[ii];
        if (thisChild.nodeName == "Notes")
        {
            $("#notesBox").val(thisChild.innerHTML);
        }
        else if (thisChild.nodeName == "Tag" || thisChild.nodeName == "Quote")
        {
            time = thisChild.getAttribute("time");
            isTimed = thisChild.getAttribute("isTimed");
            addTimeElement(thisChild.nodeName, isTimed, time, thisChild.innerHTML)
        }
    }
}

function addTag(isNow)
{
    time = 0;
    if (isNow)
    {
        time = $("#preview")[0].currentTime;
    }
    addTimeElement("Tag", isNow, time, "");
}

function addQuote(isNow)
{
    time = 0;
    if (isNow)
    {
        time = $("#preview")[0].currentTime;
    }
    addTimeElement("Quote", isNow, time, "");
}

function jumpToTime(node)
{
    thisTime = $(node).parent().children('.inputTime')[0].value
    $("#preview")[0].currentTime = thisTime;
}

function deleteTimeElement(node)
{
    $(node).parent().remove();
}

function setToCurrentTime(node)
{
    currentTime = $("#preview")[0].currentTime;
    $(node).parent().children('.inputTime')[0].value = currentTime;
}

function addTimeElement(segment, isTimed, time, text)
{
    element = $('<div class="timeElement"></div>');
    elementText = $('<input class="inputText" type="text" value="' + text + '"></input><br />');  //adding tag text box
    element.append(elementText);
    elementCheck = '<span class="inputDesc">Is this timed? </span><input class="isTimedCheckbox" type="checkbox" checked="' + isTimed + '"></input>';    //adding checkbox
    element.append(elementCheck);
    elementTime = '<span class="inputDesc"> Time: </span><input class="inputTime" type="text" value="' + time + '"></input><br />';    //adding time text
    element.append(elementTime);
    elementJump = '<button onclick="jumpToTime(this)">Jump to this time</button>';    //adding time jump button
    element.append(elementJump);
    elementSet = '<button onclick="setToCurrentTime(this)">Set to current time</button>';    //adding time jump button
    element.append(elementSet);
    elementDel = '<button onclick="deleteTimeElement(this)">Delete this element</button>';    //adding time jump button
    element.append(elementDel);
    $("#segment" + segment).append(element);
}
