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
        Team1Box += "<span style='float:left'>" + Math.round(player.skill) + "</span><span style='float:right'> " + player.rank + "</span><br>";
    }
    for ( var player of BattleLine.Factions.team2 ) {
        Team2Box += "<span style='float:left'>" + Math.round(player.skill) + "</span><span style='float:right'> " + player.rank + "</span><br>";
    }
    var sortedPlanets = [...BattleLine.mapData.Planets].sort((x,y) => y.priority[0] - x.priority[0]);
    for ( var planet of sortedPlanets ) {
        PlanetBox += "<span style='float:left'>" + planet.name + "</span><span style='float:right'> " + planet.priority + "</span><br>";
    }
    document.getElementById("team1").innerHTML = Team1Box;
    document.getElementById("team2").innerHTML = Team2Box;
    document.getElementById("planets").innerHTML = PlanetBox;
}

BattleLine.Factions.generateBattleQueue = function () {
    var battleQueue = [];
    var contestedPlanets = BattleLine.mapData.Planets.filter( p => p.owner == 0 );
    
    var playerCount = Math.min(BattleLine.Factions.team1.length, BattleLine.Factions.team2.length);
    var team1roster = BattleLine.Factions.team1.sort((x,y) => y.rank - x.rank).slice(0, playerCount);
    var team2roster = BattleLine.Factions.team2.sort((x,y) => y.rank - x.rank).slice(0, playerCount);
    
    var currentSelector = Math.random() > 0.5;
    
    while ( team1roster.length > 0 ) {
        if ( contestedPlanets.length == 0 ) {
            contestedPlanets = BattleLine.mapData.Planets.filter( p => p.owner == 0 );
        }
        
        var teamIndex = currentSelector ? 0 : 1;
        contestedPlanets = contestedPlanets.sort((x,y) => y.priority[teamIndex] - x.priority[teamIndex]);
        currentSelector = !currentSelector;
        
        var targetPlanet = contestedPlanets.shift();
        
        var team1BattlePlayers = team1roster.splice(0,2);
        var team2BattlePlayers = team2roster.splice(0,2);
        
        battleQueue.push([targetPlanet, team1BattlePlayers, team2BattlePlayers]);
    }
    return battleQueue;
}

BattleLine.Factions.evaluateBattleQueue = function ( battleQueue ) {
    for ( var battle of battleQueue ) {
        var team1Roster = battle[1];
        var team2Roster = battle[2];
        var planet = battle[0]
        
        var battleResult = BattleLine.Factions.simBattle( team1Roster, team2Roster );
        console.log( battleResult );
        BattleLine.processBattleResult( planet.id, 10, battleResult );
    }
}