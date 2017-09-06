taggerLoaded = true;

taggerCurrentDir = null;
taggerCurrentFile = null;

function startEditing(xmlNode)
{
    clearChildrenList();
    taggerCurrentDir = xmlNode;
    displayPath();
    makeChildrenList(xmlNode.children);
    span = document.createElement("span");
    span.innerText = "Load a file!";
    span.classList.add("loadNotice");
    $("#editor").append(span)
}

function browseFolder(name)
{
    children = taggerCurrentDir.children;
    for (var ii = 0; ii < children.length; ii++)
    {
        thisChild = children[ii];
        thisName = thisChild.getAttribute("name");
        if (thisChild.nodeName == "Folder" && thisName == name)
        {
            (function() {
                taggerCurrentDir = thisChild;
                clearChildrenList();
                addParent();
                makeChildrenList(taggerCurrentDir.children);
                displayPath();
            })();
        }
    }
}

function backFolder()
{
    clearChildrenList();
    console.log(taggerCurrentDir);
    taggerCurrentDir = taggerCurrentDir.parentNode;
    console.log(taggerCurrentDir.parentNode.nodeName)
    if (taggerCurrentDir.parentNode.nodeName != "#document")
    {
        addParent();
    }
    makeChildrenList(taggerCurrentDir.children);
    displayPath();
}

function addParent()
{
    link = document.createElement("a");
    link.href = "#";
    link.innerText = "<== back";
    link.classList.add("sidebarFolder");
    link.onclick = function() {backFolder();};
    $("#container").append(link);
    $("#container").append(document.createElement("br"));
}

function clearChildrenList()
{
    $("#container").empty();
}

function makeChildrenList(children)
{
    for (ii = 0; ii < children.length; ii++)
    {
        thisChild = children[ii];
        link = document.createElement("a");
        link.href = "#";
        thisName = thisChild.getAttribute("name");
        link.innerText = thisName;
        if (thisChild.nodeName == "Folder")
        {
            link.classList.add("sidebarFolder");
            link.onclick = (function(jj) {
                return function() {
                    browseFolder(children[jj].getAttribute("name"));
                };
            })(ii);
        }
        if (thisChild.nodeName == "File")
        {
            link.classList.add("sidebarFile");
            link.onclick = (function(jj) {
                return function() {
                    editFile(children[jj].getAttribute("name"));
                };
            })(ii);
        }
        $("#container").append(link);
        $("#container").append(document.createElement("br"));
    }
}

function displayPath()
{
    if ($(".pathActual").length == 0)
    {
        $("#sidebar").prepend(document.createElement("br"));
        span = document.createElement("span");
        span.innerText = getPathName();
        span.classList.add("pathActual")
        $("#sidebar").prepend(span)
        $("#sidebar").prepend(document.createElement("br"));
    }
    else{
        $(".pathActual")[0].innerText = getPathName();
    }
    if ($(".pathHeader").length == 0)
    {
        $("#sidebar").prepend(document.createElement("br"));
        span = document.createElement("span");
        span.innerText = "Current path:";
        span.classList.add("pathHeader");
        $("#sidebar").prepend(span);
    }
}

function getPathName()
{
    node = taggerCurrentDir;
    path = "/"
    while(node.parentNode.nodeName != "#document")
    {
        path = "/" + node.getAttribute("name") + path;
        node = node.parentNode;
    }
    console.log(path)
    return path;
}

//function 

function editFile(name)
{
    removeOldFileStuff();
    setUpEditor();
    taggerCurrentFile = getFileNode(name);
    loadPreview();
}

function removeOldFileStuff()
{
    thingsToRemove = ["#preview", "#notes", "#tagList", "#quoteList"];
    for (ii = 0; ii < thingsToRemove.length; ii++)
    {
        $(thingsToRemove[ii]).remove();
    }
}

function setUpEditor()
{
    if (taggerCurrentFile == null)
    {
        $(".loadNotice").remove();
        $("#editor").append('<div class="thirdHSegment" id="segmentMisc"></div>');
        $("#editor").append('<div class="thirdHSegment" id="segmentTag"></div>');
        $("#segmentTag").append('<span class="segmentHeader">Tags:</span>');
        $("#editor").append('<div class="thirdHSegment" id="segmentQuote"></div>');
        $("#segmentQuote").append('<span class="segmentHeader">Quotes:</span>');
        $("#segmentMisc").append('<div class="halfVSegment" id="segmentPreview"></div>');
        $("#segmentPreview").append('<span class="segmentHeader">Preview:</span>');
        $("#segmentMisc").append('<div class="halfVSegment" id="segmentNotes"></div>');
        $("#segmentNotes").append('<span class="segmentHeader">Notes:</span>');
    }
}

function getFileNode(name)
{
    children = taggerCurrentDir.children;
    toReturn = null;
    for (var ii = 0; ii < children.length; ii++)
    {
        thisChild = children[ii];
        console.log(thisChild);
        thisName = thisChild.getAttribute("name");
        if (thisChild.nodeName == "File" && thisName == name)
        {
            toReturn = thisChild;
        }
    }
    return toReturn;
}

function loadPreview()
{
    filename = taggerCurrentFile.getAttribute("name");
    extension = filename.split('.').pop();
    previewText = "";
    switch(extension)
    {
        case "mp3":
            previewText = '<audio id="preview" controls="" class="previewAudio"><source src=".' + getPathName() + filename + '" type="audio/mp3" /></audio>';
            break;
        case "m4a":
            previewText = '<audio id="preview" controls="" class="previewAudio"><source src=".' + getPathName() + filename + '" type="audio/mp4" /></audio>';
            break;
        case "aac":
            previewText = '<audio id="preview" controls="" class="previewAudio"><source src=".' + getPathName() + filename + '" type="audio/mp4" /></audio>';
            break;
        
    }
    $("#segmentPreview").append("<br />");
    $("#segmentPreview").append(previewText);
}