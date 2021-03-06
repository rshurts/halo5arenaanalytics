import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';
import { Template } from 'meteor/templating';

import { Matches } from '../api/matches.js';
import { Maps } from '../api/maps.js';
import { GameVariants } from '../api/game-variants.js';

import '../api/game-variants.js';
import '../api/carnage-arena.js';
import '../api/match-events.js';

import './matchList.html';

Template.matchList.onCreated(function matchListOnCreated() {
  this.subscribe('Matches');
  this.subscribe('Maps');
  this.subscribe('GameBaseVariants');
  this.subscribe('GameVariants');
});

Template.matchList.helpers({
  hidden() {
    if (Session.get('player')) {
      return 'visible';
    }
    return 'hidden';
  },
  matches() {
    const player = Session.get('player');
    if (player) {
      return Matches.find(
        { player },
        { sort: { completionDate: -1, date: 1 }, limit: 5 }
      );
    }
    return null;
  },
  maps() {
    return Maps.findOne({ mapId: this.mapId });
  },
  gameVariants() {
    Meteor.call('getGameVariants', this.gameVariantId);
    return GameVariants.findOne({ gameVariantId: this.gameVariantId });
  },
  results() {
    switch (this.result) {
      case 0:
        return 'DNF';
      case 1:
        return 'Loss';
      case 2:
        return 'Tie';
      case 3:
        return 'Win';
      default:
        return '';
    }
  },
  selectedMatch() {
    if (this.matchId === Session.get('matchId')) {
      return 'info';
    }
    return null;
  },
});

Template.matchList.events({
  'click .match'() {
    Session.set('matchId', this.matchId);
    Session.set('killer', null);
    Session.set('victim', null);
    Meteor.call('getCarnageArena', this.matchId);
    Meteor.call('getMatchEvents', this.matchId);
  },
});
