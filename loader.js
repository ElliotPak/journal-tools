jsonDoc = null;

function loadTags()
{
    $.ajax({
        type: "GET",
        url: "tags.json",
        dataType: "json",
        success: function(data) {
            setupSearch($(data));
        }
    });
}

function saveFile(jsonfile)
{
    jsonString = JSON.stringify(jsonfile);
    var blob=new Blob([jsonString],{type:'application/json;charset=utf-8'});
    saveAs(blob,'tags.json');
}

function createOtherPreview(path, filename)
{
    extension = filename.split('.').pop();
    previewText = "";
    nodeToReturn = null;
    switch(extension)
    {
        case "mp3": case "m4a": case "aac":
            previewText = '<audio controls=""><source src="SOURCE" type="audio/TYPE" /></audio>';
            break;
        case "mp4":
            previewText = '<video controls=""><source src="SOURCE" type="video/TYPE" /></video>';
            break;
        case "jpg": case "png":
            previewText = '<a class="displayText italics" style="display:inline-block;" target="_blank" href="SOURCE">View image: SOURCE</a>';
            break;
        default:
            previewText = '<a class="displayText italics" style="display:inline-block;" target="_blank" href="SOURCE">View file: SOURCE</a>';
            break;
    }
    if (previewText != "")
    {
        previewText = previewText.replace(/SOURCE/g, path + "/" + filename);
        previewText = previewText.replace(/TYPE/g, extension);
        if (extension === "m4a")
        {
            previewText = previewText.replace("audio/m4a", "audio/mp4");
        }
        nodeToReturn = parseHTML(previewText);
    }
    return nodeToReturn;
}

function loadTextPreview(jsonFile, displayFile, funcOnSuccess, funcOnFail, errors)
{
    fullPath = jsonFile.path + '/' + jsonFile.name
    $.ajax({
        type: "GET",
        url: fullPath,
        dataType: "text",
        success: function(data) {
            funcOnSuccess(jsonFile, displayFile, data);
        },
        error: function(data) {
            funcOnFail(displayFile, errors);
        }
    });
}
