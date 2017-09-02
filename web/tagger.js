taggerLoaded = true;

taggerCurrentDir = null;
taggerCurrentFile = null;

function startEditing(xmlNode)
{
    clearChildrenList();
    taggerCurrentDir = xmlNode;
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
}

function addParent()
{
    link = document.createElement("a");
    link.innerText = "<== back";
    link.classList.add("sidebarFolder");
    link.onclick = function() {backFolder();};
    $("#sidebar").append(link);
    $("#sidebar").append(document.createElement("br"));
}

function clearChildrenList()
{
    $("#sidebar").empty();
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
        $("#sidebar").append(link);
        $("#sidebar").append(document.createElement("br"));
    }
}

//function 

function editFile(name)
{
    console.log("whoo " + name)
}
