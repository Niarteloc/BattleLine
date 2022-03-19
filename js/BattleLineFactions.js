BattleLine.Factions = {}

BattleLine.Factions.initialize = function ( teamSize, nameList ) {
    BattleLine.Factions.team1 = [];
    BattleLine.Factions.team2 = [];
    BattleLine.Factions.factionMetal = [0, 0];
    var name = "";
    
    var playerID = 0;
    for ( var i = 0; i < teamSize; i++ ) {
        if ( nameList ) {
            name = nameList.splice(Math.floor(Math.random()*nameList.length), 1);
        }
        BattleLine.Factions.team1.push({
            "id" : playerID++,
            "rank" : 1,
            "progression" : 4,
            "skill" : (Math.random() * 1000 + 1000),
            "faction" : 1,
            "active" : true,
            "name" : name
        });
        if ( nameList ) {
            name = nameList.splice(Math.floor(Math.random()*nameList.length), 1);
        }
        BattleLine.Factions.team2.push({
            "id" : playerID++,
            "rank" : 1,
            "progression" : 4,
            "skill" : (Math.random() * 1000 + 1000),
            "faction" : 2,
            "active" : true,
            "name" : name
        });
    }
}

BattleLine.Factions.togglePlayer = function ( playerID ) {
    var allPlayers = BattleLine.Factions.team1.concat(BattleLine.Factions.team2);
    var player = allPlayers.find( (x) => x.id == playerID );
    player.active = !player.active;
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

BattleLine.Factions.generateBattleQueue = function (team1Roster, team2Roster) {
    var battleQueue = [];
    var contestedPlanets = BattleLine.mapData.Planets.filter( p => p.owner == 0 );
    
    var playerCount = Math.min(team1Roster.length, team2Roster.length);
    var team1PVP = team1Roster.sort((x,y) => y.rank - x.rank).slice(0, playerCount);
    var team1PVE = team1Roster.slice(playerCount);
    var team2PVP = team2Roster.sort((x,y) => y.rank - x.rank).slice(0, playerCount);
    var team2PVE = team2Roster.slice(playerCount);
    
    var currentSelector = Math.random() > 0.5;
    
    while ( team1PVP.length > 0 ) {
        if ( contestedPlanets.length == 0 ) {
            contestedPlanets = BattleLine.mapData.Planets.filter( p => p.owner == 0 );
        }
        
        var teamIndex = currentSelector ? 0 : 1;
        contestedPlanets = contestedPlanets.sort((x,y) => y.priority[teamIndex] - x.priority[teamIndex]);
        currentSelector = !currentSelector;
        
        var targetPlanet = contestedPlanets.shift();
        
        var team1BattlePlayers = team1PVP.splice(0,2);
        var team2BattlePlayers = team2PVP.splice(0,2);
        
        battleQueue.push([targetPlanet, team1BattlePlayers, team2BattlePlayers]);
    }
    
    var PVEteam = [];
    var teamIndex;
    
    if ( team1PVE.length > 0 ) {
        PVEteam = team1PVE;
        teamIndex = 0;
    }
    else {
        PVEteam = team2PVE;
        teamIndex = 1;
    }
    
    while ( PVEteam.length > 0 ) {
        if ( contestedPlanets.length == 0 ) {
            contestedPlanets = BattleLine.mapData.Planets.filter( p => p.owner == 0 );
        }
        contestedPlanets = contestedPlanets.sort((x,y) => y.priority[teamIndex] - x.priority[teamIndex]);
        
        var targetPlanet = contestedPlanets.shift();
        
        var PVEBattlePlayers = PVEteam.splice(0,2);
        
        battleQueue.push([targetPlanet, PVEBattlePlayers, (teamIndex + 1)]);
    }
    return battleQueue;
}

BattleLine.Factions.computeDominanceDelta = function ( rankBonus, planetId, faction ) {
    var structureBonus = 0;
    var neighbors = BattleLine.util.getNeighbors( planetId );
    for ( var neighborId of neighbors ) {
        var planet = BattleLine.mapData.Planets[neighborId];
        for ( var structure of planet.structures ) {
            if ( planet.owner == faction ) {
                if ( structure.typeId == 3 && structure.activationTurns == 0 ) {
                    structureBonus += 2 // Wormhole
                }
                else if ( structure.typeId == 4 && structure.activationTurns == 0 ) {
                    structureBonus += 3 // Improved Wormhole
                }
            }
            else if ( planet.owner != 0 ) {
                if ( structure.typeId == 5 && structure.activationTurns == 0 ) {
                    structureBonus -= 3 // Wormhole Inhibitor
                }
            }
        }
    }
    return 12 + structureBonus + rankBonus;
}

BattleLine.Factions.evaluateBattleQueue = function ( battleQueue ) {
    for ( var battle of battleQueue ) {
        var planet = battle[0]
        
        if ( battle[2].length ) {
            var team1Roster = battle[1];
            var team2Roster = battle[2];
            var battleResult = BattleLine.Factions.simBattle( team1Roster, team2Roster );
            var rankBonus = Math.max(...(battleResult ? team1Roster : team2Roster).map( (o) => o.rank ));
            
            var dominanceDelta = BattleLine.Factions.computeDominanceDelta( rankBonus, planet.id, battleResult );
            BattleLine.Factions.factionMetal[0] += 100;
            BattleLine.Factions.factionMetal[1] += 100;
            BattleLine.processBattleResult( planet.id, dominanceDelta, battleResult );
        }
        else {
            var pveTeam = battle[1];
            var faction = battle[2];
            var rankBonus = Math.max(...pveTeam.map( (o) => o.rank ));
            var dominanceDelta = BattleLine.Factions.computeDominanceDelta( rankBonus, planet.id, faction );
            BattleLine.processBattleResult( planet.id, dominanceDelta, faction );
        }
    }
}