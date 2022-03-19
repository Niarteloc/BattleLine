BattleLine.Structures = {}

BattleLine.Structures.StructureTypes = [
    {
        "typeId" : 0,
        "name" : "Power Generator Unit",
        "activationTurns" : 2,
        "metalCost" : 100,
        "powerCost" : 0,
        "repairRequired" : 0
    },
    {
        "typeId" : 1,
        "name" : "Orbital Solar Array",
        "activationTurns" : 3,
        "metalCost" : 275,
        "powerCost" : 0
    },
    {
        "typeId" : 2,
        "name" : "Planetary Geothermal Tap",
        "activationTurns" : 6,
        "metalCost" : 625,
        "powerCost" : 0,
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
        "name" : "Artefact",
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

BattleLine.Structures.initialize = function() {
    BattleLine.Structures.StructureList = [];
    var structureId = 0;
    for ( var planet of BattleLine.mapData.Planets ) {
        planet.structures = [];
        if ( planet.owner != 0 ) {
            var wormhole = BattleLine.Structures.newStructure( 3 );
            wormhole.id = structureId;
            wormhole.planetId = planet.id;
            planet.structures.push( wormhole );
            BattleLine.Structures.StructureList.push(wormhole);
            structureId++;
        }
    }
}