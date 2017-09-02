xmlDoc = null;

function loadFile()
{
    //var myFile = $("#uploadFile")
    input = document.getElementById("uploadFile");
    if (!input){
        alert("1");
    }
    else if (!input.files)
    {
        alert("2");
    }
    else if (!input.files[0])
    {
        alert("3");
    }
    else
    {
        file = input.files[0];
        fr = new FileReader();
        fr.onload = function () {
            xmlText = fr.result;
            xmlDoc = new DOMParser().parseFromString(xmlText, "text/xml");
            if (typeof window.taggerLoaded != 'undefined')
            {
                startEditing(xmlDoc.documentElement);
            }
            if (typeof window.viewerLoaded != 'undefined')
            {
                startViewing(xmlDoc.documentElement);
            }
        };
        fr.readAsText(file);
    }
}
