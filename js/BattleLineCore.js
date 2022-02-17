BattleLine = {}

BattleLine.MAX_DOMINANCE = 100;

BattleLine.drawMap = function ( canvas, context ) {
    var mapData = BattleLine.mapData;
    context.clearRect( 0, 0, canvas.width, canvas.height );
    
    //Offset for canvas dimensions not matching map dimensions, possibly future scrolling
    var xOffset = (canvas.width - mapData.Dimensions.width)/2;
    var yOffset = (canvas.height - mapData.Dimensions.height) / 2;
    
    //Draw bounding box
    context.strokeRect( xOffset, yOffset, mapData.Dimensions.width, mapData.Dimensions.height );
    
    //Draw edges first, so planets are on top
    for ( var cid in mapData.Connections ) {
        var edge = mapData.Connections[cid];
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
    for ( var pid in mapData.Planets ) {
        var planet = mapData.Planets[pid];
        
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

BattleLine.initialize = function ( mapData, team1, team2 ) {
    //Initialize global data
    BattleLine.mapData = mapData;
    BattleLine.rosters = {
        "team1" : team1,
        "team2" : team2
    };
    BattleLine.battleList = [];
    
    //Initialize planet dominance/faction
    for ( pid in BattleLine.mapData.Planets ) {
        var planet = BattleLine.mapData.Planets[pid];
        
        if ( planet.owner == 0 ) {
            planet.dominantFaction = (Math.random() > 0.5) ? 1 : 2;
            planet.dominance = 0;
        }
        else {
            planet.dominantFaction = planet.owner;
            planet.dominace = BattleLine.MAX_DOMINANCE;
        }
    }
}