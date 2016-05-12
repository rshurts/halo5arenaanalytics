import { Session } from 'meteor/session';
import { Template } from 'meteor/templating';

import { CarnageArena } from '../api/carnage-arena.js';
import { MatchEvents } from '../api/match-events.js';
import { Weapons } from '../api/weapons.js';

import './victimReport.html';

Template.victimReport.onCreated(function victimReportOnCreated() {
  this.subscribe('CarnageArena');
  this.subscribe('MatchEvents');
  this.subscribe('Weapons');
});

Template.victimReport.helpers({
  hidden() {
    if (Session.get('victim')) {
      return 'visible';
    }
    return 'hidden';
  },
  victimDetails() {
    return CarnageArena.findOne({
      matchId: Session.get('matchId'),
      player: Session.get('victim'),
    });
  },
  accuracy(fired, landed) {
    let accuracy = 0;
    if (fired !== undefined && landed !== undefined && landed !== 0) {
      accuracy = Math.trunc((fired / landed) * 100);
    }
    return accuracy;
  },
  KDA(kills, assists, deaths) {
    let divisorDeaths = deaths;
    if (deaths === 0) {
      divisorDeaths = 1;
    }
    return ((kills + (assists / 3)) / divisorDeaths).toFixed(1);
  },
  weaponStats() {
    const weaponStats = [];
    const matchEvents = MatchEvents.find({
      matchId: Session.get('matchId'),
      eventName: 'Death',
      'killer.Gamertag': Session.get('player'),
      'victim.Gamertag': Session.get('victim'),
    });

    matchEvents.forEach(matchEvent => {
      const weaponId = matchEvent.killerWeaponStockId;
      const weaponMetaData = Weapons.findOne(
        { weaponId: weaponId.toString() }
      );
      if (! _.findWhere(weaponStats, { weaponId })) {
        weaponStats.push({
          weaponId,
          weaponKills: MatchEvents.find({
            matchId: Session.get('matchId'),
            eventName: 'Death',
            'killer.Gamertag': Session.get('player'),
            'victim.Gamertag': Session.get('victim'),
            killerWeaponStockId: weaponId,
          }).count(),
          weaponHeadshots: MatchEvents.find({
            matchId: Session.get('matchId'),
            eventName: 'Death',
            'killer.Gamertag': Session.get('player'),
            'victim.Gamertag': Session.get('victim'),
            killerWeaponStockId: weaponId,
            isHeadshot: true,
          }).count(),
          weaponName: weaponMetaData.name,
          weaponImageUrl: weaponMetaData.imageUrl,
        });
      }
    });
    return weaponStats;
  },
});
