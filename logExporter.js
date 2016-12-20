const xmlParser = require('lazy-xml-parser');
const fs = require('fs');

function processFile(path){
    xmlParser.toJs(path, (err, xml) => {
        var pathToSave = path.split('.xml').join('.csv');
        var csvToWrite = '';

        var taskNode = xml.nodes[0];
        var fileNodes = [];

        //get all file nodes
        for(var i = 0; i < taskNode.nodes.length; i++){
            if(taskNode.nodes[i].name == 'file'){
                fileNodes.push(taskNode.nodes[i]);
            }
        }

        csvToWrite += 'Filename,Reps,100% (TM),99% - 95%,99% - 95%,94% - 85%,94% - 85%,84% - 75%,84% - 75%,74% - 50%,74% - 50%,New,Total Words\n';

        for(var i = 0; i < fileNodes.length; i++){
            var file = fileNodes[i];
            var fileName = file.attributes[0].value;
            var analyseNodes = file.nodes[0].nodes;

            var perfect = parseInt(analyseNodes[0].attributes[1].value);
            var contextExact = parseInt(analyseNodes[1].attributes[1].value);
            var exact = parseInt(analyseNodes[2].attributes[1].value);
            var crossFileRepeats = parseInt(analyseNodes[3].attributes[1].value);
            var repeated = parseInt(analyseNodes[4].attributes[1].value);
            var total = parseInt(analyseNodes[5].attributes[1].value);
            var news = parseInt(analyseNodes[6].attributes[1].value);
            var fuzzy50 = parseInt(analyseNodes[7].attributes[3].value);
            var fuzzy75 = parseInt(analyseNodes[8].attributes[3].value);
            var fuzzy85 = parseInt(analyseNodes[9].attributes[3].value);
            var fuzzy95 = parseInt(analyseNodes[10].attributes[3].value);
            var ifuzzy50 = parseInt(analyseNodes[11].attributes[3].value);
            var ifuzzy75 = parseInt(analyseNodes[12].attributes[3].value);
            var ifuzzy85 = parseInt(analyseNodes[13].attributes[3].value);
            var ifuzzy95 = parseInt(analyseNodes[14].attributes[3].value);

            //filename - reps - 100% - 95% - 95% - 85% - 85% - 75% - 75% - 50% - 50% - new - total
            csvToWrite += fileName + ',' +
                (crossFileRepeats + repeated) + ',' +
                (perfect + contextExact + exact) + ',' +
                (fuzzy95) + ',' + 
                (ifuzzy95) + ',' + 
                (fuzzy75) + ',' +
                (ifuzzy75) + ',' +
                (fuzzy85) + ',' + 
                (ifuzzy85) + ',' + 
                (fuzzy50) + ',' + 
                (ifuzzy50) + ',' +
                (news) + ',' +
                total + '\n';
        }

        fs.writeFileSync(pathToSave, csvToWrite);
    });
}


if(process.argv.length < 3){
    console.log('dude, you forgot to send me the path to the folder where the files are!');
    return;
}

var folder = process.argv[2];
if(folder[folder.length - 1] != '/' && folder[folder.length-1] != '\\'){
    folder = folder + '/';
}

var files = fs.readdirSync(folder);

files.forEach(file => {
    var fullFileName = folder + file;
    var fileStats = fs.stat(fullFileName);
    if(fileStats.isFile()){
        processFile(fullFileName);
    }
});

console.log('done');