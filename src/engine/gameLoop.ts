import { produce } from 'immer';
import type { GameState, PlayerState } from '../types/game.types';
import type { GameStatePatch } from '../types/ability.types';
import { ALL_LOCATIONS } from '../data/locations';
import { STARTING_HAND, TOTAL_TURNS, MAX_ENERGY } from '../data/constants';
import { buildDeck } from './deckBuilder';
import { commitPendingPlays } from './cardPlacement';
import { resolveOnReveal, resolveEndOfTurnAbilities } from './abilityResolver';
import { recalculateAllPowers } from './powerCalculator';
import { applyPatches } from './patchApplier';
import { applyRevealEffects, applyBraizeEffect, applyWellOfAscensionEffect } from './locationEffects';
import { computeLocationWinners, computeGameWinner } from './winCondition';
import { pickNRandom } from '../utils/random';
import '../engine/abilities/index'; // register all abilities

function createInitialPlayerState(id: 'player' | 'ai'): PlayerState {
  const deck = buildDeck(id);
  const hand = deck.splice(0, STARTING_HAND);
  return {
    id,
    deck,
    hand,
    currentEnergy: 0,
    maxEnergy: 0,
    pendingPlays: [],
    hasEnergyDiscount: false,
  };
}

export function initGame(): GameState {
  const selectedLocDefs = pickNRandom(ALL_LOCATIONS, 3);

  const locations = selectedLocDefs.map((def) => ({
    definitionId: def.id,
    isRevealed: false,
    revealedOnTurn: null as number | null,
    cards: { player: [] as ReturnType<typeof buildDeck>, ai: [] as ReturnType<typeof buildDeck> },
    powerTotals: { player: 0, ai: 0 },
    winner: null as null,
    isLockedFor: null as null,
    maxCardsOverride: null as null,
    lastPlayedBy: null as null,
  }));

  return {
    phase: 'player_action',
    turn: 1,
    locations,
    players: {
      player: createInitialPlayerState('player'),
      ai: createInitialPlayerState('ai'),
    },
    eventLog: [],
    winner: null,
    pendingTargetSelection: null,
  };
}

export function startTurn(state: GameState): GameState {
  return produce(state, (draft) => {
    const energy = Math.min(draft.turn, MAX_ENERGY);
    draft.players.player.currentEnergy = energy;
    draft.players.player.maxEnergy = energy;
    draft.players.ai.currentEnergy = energy;
    draft.players.ai.maxEnergy = energy;
    draft.players.player.hasEnergyDiscount = false;
    draft.players.ai.hasEnergyDiscount = false;

    if (draft.turn <= 3) {
      const locIdx = draft.turn - 1;
      draft.locations[locIdx].isRevealed = true;
      draft.locations[locIdx].revealedOnTurn = draft.turn;
    }

    for (const pid of ['player', 'ai'] as const) {
      if (draft.players[pid].deck.length > 0) {
        const card = draft.players[pid].deck.shift()!;
        draft.players[pid].hand.push(card);
      }
    }

    draft.phase = 'player_action';
  });
}

export function revealTurn(state: GameState): GameState {
  let s = state;

  // Apply reveal effects for newly-revealed locations
  for (let i = 0; i < 3; i++) {
    if (s.locations[i].isRevealed && s.locations[i].revealedOnTurn === s.turn) {
      s = applyRevealEffects(s, i);
    }
  }

  // Place pending plays
  s = commitPendingPlays(s, 'player');
  s = commitPendingPlays(s, 'ai');

  // Fire On Reveal abilities
  const onRevealPatches: GameStatePatch[] = [];
  for (const pid of ['player', 'ai'] as const) {
    for (let locIdx = 0; locIdx < 3; locIdx++) {
      for (const card of s.locations[locIdx].cards[pid]) {
        if (card.isRevealed && card.turnsOnBoard === 0) {
          onRevealPatches.push(...resolveOnReveal(card, locIdx, s));
        }
      }
    }
  }
  s = applyPatches(s, onRevealPatches);

  s = recalculateAllPowers(s);
  return produce(s, (draft) => { draft.phase = 'end_of_turn'; });
}

export function endTurn(state: GameState): GameState {
  let s = state;

  s = applyPatches(s, resolveEndOfTurnAbilities(s));
  s = applyWellOfAscensionEffect(s);
  s = applyBraizeEffect(s);

  s = produce(s, (draft) => {
    for (const loc of draft.locations) {
      for (const pid of ['player', 'ai'] as const) {
        for (const card of loc.cards[pid]) {
          card.turnsOnBoard++;
        }
      }
    }
    for (const loc of draft.locations) {
      loc.lastPlayedBy = null;
    }
  });

  s = recalculateAllPowers(s);

  if (s.turn >= TOTAL_TURNS) {
    s = computeLocationWinners(s);
    const winner = computeGameWinner(s);
    return produce(s, (draft) => {
      draft.winner = winner;
      draft.phase = 'game_over';
    });
  }

  s = produce(s, (draft) => { draft.turn++; });
  return startTurn(s);
}

export function getInitializedGame(): GameState {
  const state = initGame();
  return startTurn(state);
}
