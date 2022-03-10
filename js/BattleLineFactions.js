BattleLine.Factions = {}

BattleLine.Factions.initialize = function ( teamSize ) {
    BattleLine.Factions.team1 = [];
    BattleLine.Factions.team2 = [];
    
    var playerID = 0;
    for ( var i = 0; i < teamSize; i++ ) {
        BattleLine.Factions.team1.push({
            "id" : playerID++,
            "rank" : 1,
            "progression" : 4,
            "skill" : (Math.random() * 1000 + 1000),
            "faction" : 1
        });
        BattleLine.Factions.team2.push({
            "id" : playerID++,
            "rank" : 1,
            "progression" : 4,
            "skill" : (Math.random() * 1000 + 1000),
            "faction" : 2
        });
    }
}

BattleLine.Factions.playerWin = function ( player ) {
    player.progression++;
    if ( player.progression > 8 ) {
        player.rank = Math.min( player.rank + 1, 8 );
        player.progression = 4;
    }
}

BattleLine.Factions.playerLoss = function ( player ) {
    player.progression--;
    if ( player.progression < 0 ) {
        player.rank = Math.max( player.rank - 1, 1 );
        player.progression = 4;
    }
}

BattleLine.Factions.simBattle = function ( team1, team2 ) {
    var team1Skill = 0;
    var team2Skill = 0;
    
    team1.forEach( (player) => team1Skill += player.skill );
    team2.forEach( (player) => team2Skill += player.skill );
    
    if ( (team1Skill / team2Skill) > (Math.random() * 2) ) {
        team1.forEach( BattleLine.Factions.playerWin );
        team2.forEach( BattleLine.Factions.playerLoss );
        return 1;
    }
    else {
        team1.forEach( BattleLine.Factions.playerLoss );
        team2.forEach( BattleLine.Factions.playerWin );
        return 2;
    }
}

BattleLine.Factions.updateDisplay = function () {
    var Team1Box = "Team 1<br>";
    var Team2Box = "Team 2<br>";
    var PlanetBox = "Planets<br>";
    for ( var player of BattleLine.Factions.team1 ) {
        Team1Box += Math.round(player.skill) + "<br>";
    }
    for ( var player of BattleLine.Factions.team2 ) {
        Team2Box += Math.round(player.skill) + "<br>";
    }
    var sortedPlanets = [...BattleLine.mapData.Planets];
    sortedPlanets = sortedPlanets.sort((x,y) => y.priority[0] - x.priority[0]);
    for ( var planet of sortedPlanets ) {
        PlanetBox += "<span style='float:left'>" + planet.name + "</span><span style='float:right'> " + planet.priority + "</span><br>";
    }
    document.getElementById("team1").innerHTML = Team1Box;
    document.getElementById("team2").innerHTML = Team2Box;
    document.getElementById("planets").innerHTML = PlanetBox;
}