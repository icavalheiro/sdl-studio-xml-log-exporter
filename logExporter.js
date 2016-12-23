#!/usr/bin/env node

const xmlParser = require('lazy-xml-parser');
const fs = require('fs');

//function that reads a xml file and converts into csv
function processXml(path){
    //get the xml js obj
    xmlParser.toJs(path, (err, xml) => {
        //determine path to save csv
        var pathToSave = path.split('.xml').join('.csv');
        
        //creates the writing stream
        var csv = fs.createWriteStream(pathToSave, {flags: 'w'});
        
        //writes header
        csv.write('Filename,Reps,100% (TM),99% - 95%,99% - 95%,94% - 85%,94% - 85%,84% - 75%,84% - 75%,74% - 50%,74% - 50%,New,Total Words\n');
        
        //holder of the analyse task node
        var analyseTaskNode = null;
        
        //lets loop through the node to find the analyse one
        for(var i = 0; i < xml.nodes.length; i++){
            if(xml.nodes[i].name == 'task'){
                if(xml.nodes[i].getAttributeValue('name') == 'analyse'){
                    analyseTaskNode = xml.nodes[i];
                }
            }
        }
        
        if(analyseTaskNode == null){
            console.log('this file does not contain analyses reports');
            return;
        }
        
        var files = analyseTaskNode.getChildsByName('file');
        for(var i = 0; i < files.length; i++){
            var file = files[i];
            
            //writes name
            csv.write(file.getAttributeValue('name') + ',');
            
            //reads the word counts in order to make proper calculations
            var analysis = file.getChildByName('analyse');
            
            //define function to get words from nodes
            function getWc(node){
                if(node == null)
                    return 0;
                
                var value = node.getAttributeValue('words');
                if(value === ''){
                    return 0;
                } else {
                    return parseInt(value);
                }
            }
            
            //start collecting the data
            var perfect = analysis.getChildByName('perfect');
            var perfectWC = getWc(perfect);
            var contextExact = analysis.getChildByName('inContextExact');
            var contextExactWC = getWc(contextExact);
            var exact = analysis.getChildByName('exact');
            var exactWC = getWc(exact);
            var crossFileRepeats = analysis.getChildByName('crossFileRepeated');
            var crossFileRepeatsWC = getWc(crossFileRepeats);
            var repeated = analysis.getChildByName('repeated');
            var repeatedWC = getWc(repeated);
            var total = analysis.getChildByName('total');
            var totalWC = getWc(total);
            var news = analysis.getChildByName('new');
            var newsWC = getWc(news);
            
            //load the fuzzyies is a bit trikier
            function getFuzzyNode(name, fuzzyPercentage){
                var nodes = analysis.getChildsByName(name);
                for(var j = 0; j < nodes.length; j++){
                    if(nodes[j].getAttributeValue('min') == fuzzyPercentage.toString()){
                        return nodes[j];
                    }
                }
                
                return null;
            }
            
            //normal fuzzies
            var fuzzy50 = getFuzzyNode('fuzzy', 50);
            var fuzzy50WC = getWc(fuzzy50);
            var fuzzy75 = getFuzzyNode('fuzzy', 75);
            var fuzzy75WC = getWc(fuzzy75);
            var fuzzy85 = getFuzzyNode('fuzzy', 85);
            var fuzzy85WC = getWc(fuzzy85);
            var fuzzy95 = getFuzzyNode('fuzzy', 95);
            var fuzzy95WC = getWc(fuzzy95);
            
            //internal fuzzies (between multiple files)
            var internalFuzzy50 = getFuzzyNode('internalFuzzy', 50);
            var internalFuzzy50WC = getWc(internalFuzzy50);
            var internalFuzzy75 = getFuzzyNode('internalFuzzy', 75);
            var internalFuzzy75WC = getWc(internalFuzzy75);
            var internalFuzzy85 = getFuzzyNode('internalFuzzy', 85);
            var internalFuzzy85WC = getWc(internalFuzzy85);
            var internalFuzzy95 = getFuzzyNode('internalFuzzy', 95);
            var internalFuzzy95WC = getWc(internalFuzzy95);
            
            //write down to the csv
            csv.write((crossFileRepeatsWC + repeatedWC) + ',');
            csv.write((perfectWC + contextExactWC + exactWC) + ',');
            csv.write((fuzzy95WC) + ',');
            csv.write((internalFuzzy95WC) + ',');
            csv.write((fuzzy85WC) + ',');
            csv.write((internalFuzzy85WC) + ',');
            csv.write((fuzzy75WC) + ',');
            csv.write((internalFuzzy75WC) + ',');
            csv.write((fuzzy50WC) + ',');
            csv.write((internalFuzzy50WC) + ',');
            csv.write((newsWC) + ',');
            csv.write((totalWC) + '\n');
        }
        
        //closes the writing stream, this makes sure everything in the cache gets writted down
        csv.end();
        
    });
}


if(process.argv.length < 3){
    console.log('dude, you forgot to send me the file to convert!');
    return;
}

var file = process.argv[2];
processXml(file);

console.log('done');