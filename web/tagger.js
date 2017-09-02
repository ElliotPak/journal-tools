taggerLoaded = true;

taggerCurrentDir = null;
taggerCurrentFile = null;

function startEditing(xmlNode)
{
    clearChildrenList();
    taggerCurrentDir = xmlNode;
    displayPath();
    makeChildrenList(xmlNode.children);
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
    console.log("whoo " + name)
}
