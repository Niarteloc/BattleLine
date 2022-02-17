BattleLine = {}

BattleLine.drawMap = function ( canvas, context, mapData ) {
    context.clearRect( 0, 0, canvas.width, canvas.height );
    
    //Offset for canvas dimensions not matching map dimensions, possibly future scrolling
    var xOffset = (canvas.width - mapData.Dimensions.width)/2;
    var yOffset = (canvas.height - mapData.Dimensions.height) / 2;
    
    //Draw bounding box
    context.strokeRect( xOffset, yOffset, mapData.Dimensions.width, mapData.Dimensions.height );
    
    //Draw edges first, so planets are on top
    for ( var cid in mapData.Connections ) {
        var edge = mapData.Connections[cid];
        
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
        
        if ( planet.owner == 1 ) {
            context.fillStyle = 'green';
        }
        else if ( planet.owner == 2 ) {
            context.fillStyle = 'red';
        }
        else {
            context.fillStyle = 'gray';
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
    }
    
}