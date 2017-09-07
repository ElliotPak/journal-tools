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