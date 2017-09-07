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
    
}