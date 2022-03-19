BattleLine.Structures = {}

BattleLine.Structures.StructureTypes = [
    {
        "typeId" : 0,
        "name" : "Power Generator Unit",
        "activationTurns" : 2,
        "metalCost" : 100,
        "powerCost" : -50,
        "repairRequired" : 0
    },
    {
        "typeId" : 1,
        "name" : "Orbital Solar Array",
        "activationTurns" : 3,
        "metalCost" : 275,
        "powerCost" : -100
    },
    {
        "typeId" : 2,
        "name" : "Planetary Geothermal Tap",
        "activationTurns" : 6,
        "metalCost" : 625,
        "powerCost" : -250,
        "repairRequired" : 0
    },
    {
        "typeId" : 3,
        "name" : "Wormhole Generator",
        "activationTurns" : 3,
        "metalCost" : 150,
        "powerCost" : 0,
        "repairRequired" : 0
    },
    {
        "typeId" : 4,
        "name" : "Improved Wormhole Generator",
        "activationTurns" : 4,
        "metalCost" : 250,
        "powerCost" : 80,
        "repairRequired" : 0
    },
    {
        "typeId" : 5,
        "name" : "Wormhole Inhibitor",
        "activationTurns" : 3,
        "metalCost" : 300,
        "powerCost" : 150,
        "repairRequired" : 0
    },
    {
        "typeId" : 6,
        "name" : "Field Garrison",
        "activationTurns" : 3,
        "metalCost" : 200,
        "powerCost" : 120,
        "repairRequired" : 0
    },
    {
        "typeId" : 7,
        "name" : "Interception Network",
        "activationTurns" : 4,
        "metalCost" : 250,
        "powerCost" : 160,
        "repairRequired" : 0
    },
    {
        "typeId" : 8,
        "name" : "Dropship Factory",
        "activationTurns" : 6,
        "metalCost" : 400,
        "powerCost" : 150,
        "repairRequired" : 0
    },
    {
        "typeId" : 9,
        "name" : "Bomber Factory",
        "activationTurns" : 6,
        "metalCost" : 500,
        "powerCost" : 180,
        "repairRequired" : 0
    },
    {
        "typeId" : 10,
        "name" : "Planetary Defense Grid",
        "activationTurns" : 6,
        "metalCost" : 600,
        "powerCost" : 240,
        "repairRequired" : 0
    },
    {
        "typeId" : 11,
        "name" : "Artifact",
        "activationTurns" : 24,
        "metalCost" : 500, //Cost is for accelerating activation, not able to build this structure!
        "powerCost" : 300,
        "repairRequired" : 100
    },
]

BattleLine.Structures.newStructure = function ( typeId ) {
    var newStructure = {};
    var targetStructure = BattleLine.Structures.StructureTypes[typeId];
    for ( var property in targetStructure ) {
        newStructure[property] = targetStructure[property];
    }
    return newStructure;
}

BattleLine.Structures.initialize = function () {
    BattleLine.Structures.StructureList = [];
    var structureId = 0;
    for ( var planet of BattleLine.mapData.Planets ) {
        planet.structures = [];
        if ( planet.owner != 0 ) {
            var wormhole = BattleLine.Structures.newStructure( 3 );
            wormhole.id = structureId;
            wormhole.planetId = planet.id;
            planet.structures.push( wormhole );
            BattleLine.Structures.StructureList.push( wormhole );
            structureId++;
        }
        if ( planet.artifact ) {
            var artifact = BattleLine.Structures.newStructure( 11 );
            artifact.id = structureId;
            artifact.planetId = planet.id;
            planet.structures.push( artifact );
            BattleLine.Structures.StructureList.push( artifact );
            structureId++;
        }
    }
}

BattleLine.Structures.buildStructure = function ( planetId, typeId, faction ) {
    var planet = BattleLine.mapData.Planets[planetId];
    
    if ( planet.owner != faction ) throw "Can't build on unowned planet!";
    if ( BattleLine.Structures.StructureTypes[typeId].metalCost > BattleLine.Factions.factionMetal[faction - 1] ) throw "Not enough metal to build!";
    
    var structure = BattleLine.Structures.newStructure( typeId );
    structure.id = BattleLine.Structures.StructureList.length;
    structure.planetId = planetId;
    planet.structures.push(structure);
    BattleLine.Structures.StructureList.push(structure);
}

BattleLine.Structures.activateStructures = function () {
    var energyProducers = BattleLine.Structures.StructureList.filter( (structure) => structure.typeId < 3 );
    var energyConsumers = BattleLine.Structures.StructureList.filter( (structure) => structure.typeId >= 3 );
    var factionEnergy = [];
    
    for ( var eStruct of energyProducers ) {
        if ( eStruct.activationTurns == 0 ) {
            var structureOwner = BattleLine.mapData.Planets[eStruct.planetId].owner;
            factionEnergy[structureOwner] -= eStruct.powerCost;
        }
        else {
            eStruct.activationTurns--;
        }
    }
    
    for ( var structure of energyConsumers ) {
        var structureOwner = BattleLine.mapData.Planets[structure.planetId].owner;
        if ( factionEnergy[structureOwner] >= structure.powerCost ) {
            factionEnergy[structureOwner] -= structure.powerCost;
            if ( structure.activationTurns > 0 ) {
                structure.activationTurns--;
            }
        }
        else {
            structure.activationTurns = BattleLine.Structures.StructureTypes[structure.typeId].activationTurns;
        }
    }
}

BattleLine.Structures.drawStructures = function ( canvas, context ) {
    //Offset for canvas dimensions not matching map dimensions, possibly future scrolling
    var xOffset = (canvas.width - BattleLine.mapData.Dimensions.width) / 2;
    var yOffset = (canvas.height - BattleLine.mapData.Dimensions.height) / 2;
    
    for ( var planet of BattleLine.mapData.Planets ) {
        var structures = planet.structures;
        var structureCounts = [0,0,0,0,0,0,0,0,0,0,0,0];
        structures.forEach( (s) => structureCounts[s.typeId]++ );
        var row = 0;
        for ( var sID in structureCounts ) {
            var sCount = structureCounts[sID];
            if ( sCount > 0 ) {
                var boxColor;
                var boxCount;
                
                switch( Number(sID) ) {
                    case 0: // T1 Power
                        boxColor = "yellow";
                        boxCount = 1;
                        break;
                    case 1: // T2 Power
                        boxColor = "yellow";
                        boxCount = 2;
                        break;
                    case 2: // T3 Power
                        boxColor = "yellow";
                        boxCount = 3;
                        break;
                    case 3: // Wormhole
                        boxColor = "purple";
                        boxCount = 1;
                        break;
                    case 4: // Improved Wormhole
                        boxColor = "purple";
                        boxCount = 2;
                        break;
                    case 5: // Wormhole Inhibitor
                        boxColor = "red";
                        boxCount = 1;
                        break;
                    case 6: // Field Garrison
                        boxColor = "green";
                        boxCount = 1;
                        break;
                    case 7: // Interception Network
                        boxColor = "cyan";
                        boxCount = 1;
                        break;
                    case 8: // Dropship Factory
                        boxColor = "orange";
                        boxCount = 1;
                        break;
                    case 9: // Bomber Factory
                        boxColor = "blue";
                        boxCount = 1;
                        break;
                    case 10: // Planetary Defense Grid
                        boxColor = "green";
                        boxCount = 2;
                        break;
                    case 11: // Artifact
                        boxColor = "black";
                        boxCount = 0;
                        break;
                }
                
                console.log(sID,boxCount,boxColor);
                context.strokeStyle = 'black';
                context.lineWidth = 1.0;
                context.fillStyle = boxColor;
                for ( var i = 0; i < boxCount; i++ ){
                    var xPos = planet.position.x - planet.size + xOffset;
                    var yPos = planet.position.y - planet.size + yOffset + 5 * row;
                    context.fillRect( xPos, yPos, 4, 4 );
                    context.strokeRect( xPos, yPos, 4, 4 );
                }
                
                row++;
            }
        }
    }
}