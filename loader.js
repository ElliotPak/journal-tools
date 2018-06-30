jsonDoc = null;

function loadJsonFile()
{
    $.ajax({
        type: "GET",
        url: "tags.json",
        dataType: "json",
        success: function(data) {
            jsonDoc = data;
            if (typeof window.taggerLoaded != 'undefined')
            {
                startEditing($(data));
            }
            if (typeof window.searchLoaded != 'undefined')
            {
                startSearching($(data));
            }
        }
    });
}

function saveFile(jsonfile)
{
    jsonString = JSON.stringify(jsonfile);
    console.log(jsonfile);
    console.log(jsonString);
    var blob=new Blob([jsonString],{type:'application/json;charset=utf-8'});
    saveAs(blob,'tags.json');
}

function createPreview(path, filename)
{
    extension = filename.split('.').pop();
    previewText = "";
    nodeToReturn = null;
    switch(extension)
    {
        case "mp3": case "m4a": case "aac":
            previewText = '<audio controls="" class="preview"><source src="SOURCE" type="audio/TYPE" /></audio>';
            break;
        case "mp4":
            previewText = '<video controls="" class="preview"><source src="SOURCE" type="video/TYPE" /></video>';
            break;
        case "jpg": case "png":
            previewText = '<a src="SOURCE" target="_blank" >View image SOURCE</a>';
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
        nodeToReturn = $.parseHTML(previewText);
    }
    return nodeToReturn;
}

function loadSingleTextPreview(jsonFile, displayFile, funcOnSuccess)
{
    fullPath = jsonFile.path + '/' + jsonFile.name
    rawFile = new XMLHttpRequest();
    rawFile.open("GET", fullPath, true);
    rawFile.onreadystatechange = function() {
        rfstate = rawFile.readyState;
        rfstatus = rawFile.status;
        if (rfstate === 4 && (rfstatus === 200 || rfstatus === 0))
        {
            funcOnSuccess(jsonFile, displayFile, rawFile.responseText);
        }
    };
    rawFile.send(null);
}
