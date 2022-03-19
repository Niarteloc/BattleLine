BattleLine = {};
BattleLine.util = {};

BattleLine.MAX_DOMINANCE = 100;
BattleLine.BREAKTHROUGH = 50;

BattleLine.drawMap = function ( canvas, context ) {
    var mapData = BattleLine.mapData;
    context.clearRect( 0, 0, canvas.width, canvas.height );
    
    //Offset for canvas dimensions not matching map dimensions, possibly future scrolling
    var xOffset = (canvas.width - mapData.Dimensions.width)/2;
    var yOffset = (canvas.height - mapData.Dimensions.height) / 2;
    
    //Draw bounding box
    context.strokeStyle = 'black';
    context.lineWidth = 2.0;
    context.strokeRect( xOffset, yOffset, mapData.Dimensions.width, mapData.Dimensions.height );
    
    //Draw edges first, so planets are on top
    for ( var edge of mapData.Connections ) {
        context.strokeStyle = 'black';
        context.lineWidth = 1.0;
        
        var startX = mapData.Planets[edge[0]].position.x;
        var startY = mapData.Planets[edge[0]].position.y;
        
        var endX = mapData.Planets[edge[1]].position.x;
        var endY = mapData.Planets[edge[1]].position.y;
        
        context.beginPath();
        context.moveTo( startX + xOffset, startY + yOffset );
        context.lineTo( endX + xOffset, endY + yOffset );
        context.stroke();
    }
    
    //Draw planets
    for ( var planet of mapData.Planets ) {
        
        context.strokeStyle = 'black';
        context.lineWidth = 1.0;
        
        if ( planet.owner == 1 ) {
            context.fillStyle = 'green';
        }
        else if ( planet.owner == 2 ) {
            context.fillStyle = 'red';
        }
        else {
            context.fillStyle = 'gray';
            context.lineWidth = 3.0;
            if ( planet.dominantFaction == 1 ) {
                context.strokeStyle = 'green';
            }
            else {
                context.strokeStyle = 'red';
            }
        }
        
        context.beginPath();
        context.arc( planet.position.x + xOffset, planet.position.y + yOffset, planet.size, 0, 2 * Math.PI );
        context.fill();
        context.stroke();
        
        //Add homeworld indicator
        if ( planet.homeworld ) {
            context.fillStyle = 'gold';
            context.beginPath();
            context.arc( planet.position.x + xOffset, planet.position.y + yOffset, 5, 0, 2 * Math.PI );
            context.fill();
        }
        
        //Add artifact indicator
        if ( planet.artifact ) {
            context.fillStyle = 'blue';
            context.beginPath();
            context.arc( planet.position.x + xOffset, planet.position.y + yOffset, 5, 0, 2 * Math.PI );
            context.fill();
        }
        
        //Draw Dominance
        if ( planet.owner == 0 ) {
            if ( planet.dominantFaction == 1 ) {
                context.fillStyle = 'green';
            }
            else {
                context.fillStyle = 'red';
            }
            
            context.textAlign = 'center';
            context.font = '20px sans-serif';
            context.textBaseline = 'middle';
            context.fillText( planet.dominance, planet.position.x + xOffset, planet.position.y + yOffset );
        }
    }
    
}

BattleLine.initialize = function ( mapData ) {
    //Initialize global data
    BattleLine.mapData = mapData;
    
    //Initialize planet dominance/faction
    for ( var planet of BattleLine.mapData.Planets ) {
        if ( planet.owner == 0 ) {
            planet.dominantFaction = (Math.random() > 0.5) ? 1 : 2;
            planet.dominance = 0;
        }
        else {
            planet.dominantFaction = planet.owner;
            planet.dominance = BattleLine.MAX_DOMINANCE;
        }
        
        planet.priority = [5,5];
    }
}

BattleLine.util.getNeighbors = function ( planetID ) {
    var neighborPlanets = [];
    for ( var edge of BattleLine.mapData.Connections ) {
        if ( edge[0] == planetID ) {
            neighborPlanets.push( edge[1] );
        }
        else if ( edge[1] == planetID ) {
            neighborPlanets.push( edge[0] );
        }
    }
    return neighborPlanets;
}

BattleLine.util.getPlanetAtXY = function ( x, y ) {
    for ( var planet of BattleLine.mapData.Planets ) {
        var xDelta = x - planet.position.x;
        var yDelta = y - planet.position.y;
        var distance = (xDelta * xDelta) + (yDelta * yDelta) - (planet.size * planet.size);
        if ( distance < 0 ) {
            return planet.id;
        }
    }
}

BattleLine.conquerPlanet = function ( planetID, faction ) {
    var planet = BattleLine.mapData.Planets[planetID];
    var neighbors = BattleLine.util.getNeighbors( planetID );
    
    planet.dominance = BattleLine.MAX_DOMINANCE;
    
    if ( neighbors.some( function( pid ) { return BattleLine.mapData.Planets[pid].homeworld && BattleLine.mapData.Planets[pid].owner != faction } ) )
        return;
    
    planet.owner = faction;
    planet.dominantFaction = faction;
    
    
    
    //Adjacent planets are no longer controlled
    for ( var pid of neighbors ) {
        var neighboringPlanet = BattleLine.mapData.Planets[pid];
        if ( neighboringPlanet.owner != faction && neighboringPlanet.dominantFaction != faction ) {
            neighboringPlanet.owner = 0;
            neighboringPlanet.dominance = Math.min( BattleLine.BREAKTHROUGH, neighboringPlanet.dominance );
        }
    }
    
    //Contested planets can become controlled
    for ( var pid of neighbors ) {
        var neighboringPlanet = BattleLine.mapData.Planets[pid];
        if ( neighboringPlanet.owner == 0 && neighboringPlanet.dominantFaction == faction ) {
            var nextNeighbors = BattleLine.util.getNeighbors( pid );
            var contested = nextNeighbors.some( function( pid ) { 
                return (BattleLine.mapData.Planets[pid].owner != 0 && BattleLine.mapData.Planets[pid].owner != faction);
            } );
            
            if ( !contested ){
                neighboringPlanet.owner = faction;
                neighboringPlanet.dominance = BattleLine.MAX_DOMINANCE;
            }
        }
    }
}

BattleLine.processBattleResult = function ( planetID, dominanceChange, victorFaction ) {
    var planet = BattleLine.mapData.Planets[planetID];
    
    if ( planet.owner != 0 ) {
        throw "Can't fight on a controlled planet!";
    }
    
    if ( planet.dominantFaction == victorFaction ) {
        planet.dominance += dominanceChange;
        if ( planet.dominance >= BattleLine.MAX_DOMINANCE ) {
            BattleLine.conquerPlanet( planetID, victorFaction );
        }
    }
    else {
        planet.dominance -= dominanceChange;
        if ( planet.dominance < 0 ) {
            planet.dominantFaction = victorFaction;
            planet.dominance = 0;
        }
    }
}