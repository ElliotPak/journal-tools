xmlDoc = null;

function loadFile()
{
    $.get('./tags.xml', function(data) {
        xmlDoc = data;
        if (typeof window.taggerLoaded != 'undefined')
        {
            startEditing(xmlDoc.documentElement);
        }
        if (typeof window.searcherLoaded != 'undefined')
        {
            startSearching(xmlDoc.documentElement);
        }
    });
}

function saveFile()
{
    xmlString = new XMLSerializer().serializeToString(xmlDoc);
    var blob=new Blob([xmlString],{type:'text/xml;charset=utf-8'});
    saveAs(blob,'tags.xml');
}

function createPreview(path, filename)
{
    extension = filename.split('.').pop();
    previewText = "";
    nodeToReturn = null;
    switch(extension)
    {
        case "mp3": case "m4a": case "aac":
            previewText = '<audio id="preview" controls="" class="preview"><source src="SOURCE" type="audio/TYPE" /></audio>';
            break;
        case "mp4":
            previewText = '<video id="preview" controls="" class="preview"><source src="SOURCE" type="video/TYPE" /></video>';
            break;
        case "jpg": case "png":
            previewText = '<a src="SOURCE" target="_blank" ><img class="preview" src="SOURCE" /></a>';
            break;
    }
    if (previewText != "")
    {
        previewText = previewText.replace("SOURCE", '.' + path + filename);
        previewText = previewText.replace("TYPE", extension);
        if (extension === "m4a")
        {
            previewText = previewText.replace("audio/m4a", "audio/mp4");
        }
        nodeToReturn = $.parseHTML(previewText);
    }
    return nodeToReturn;
}