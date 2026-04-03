import { produce } from 'immer';
import type { GameState } from '../types/game.types';
import type { GameStatePatch } from '../types/ability.types';
import { generateId } from '../utils/idGenerator';

export function applyPatches(state: GameState, patches: GameStatePatch[]): GameState {
  return produce(state, (draft) => {
    for (const patch of patches) {
      switch (patch.type) {
        case 'modify_power': {
          for (const loc of draft.locations) {
            for (const pid of ['player', 'ai'] as const) {
              const card = loc.cards[pid].find((c) => c.instanceId === patch.targetInstanceId);
              if (card) {
                const isLocked = card.statusEffects.some((s) => s.type === 'power_locked');
                if (isLocked && patch.amount < 0) break;
                if (patch.isPermanent) {
                  card.powerModifiers.push({
                    sourceId: 'permanent',
                    amount: patch.amount,
                    isPermanent: true,
                    turnsRemaining: null,
                  });
                }
                card.currentPower += patch.amount;
              }
            }
          }
          break;
        }
        case 'move_card': {
          for (const pid of ['player', 'ai'] as const) {
            const fromCards = draft.locations[patch.fromLocation].cards[pid];
            const idx = fromCards.findIndex((c) => c.instanceId === patch.targetInstanceId);
            if (idx !== -1) {
              const [card] = fromCards.splice(idx, 1);
              card.locationIndex = patch.toLocation;
              draft.locations[patch.toLocation].cards[pid].push(card);
              break;
            }
          }
          break;
        }
        case 'destroy_card': {
          for (const loc of draft.locations) {
            for (const pid of ['player', 'ai'] as const) {
              const card = loc.cards[pid].find((c) => c.instanceId === patch.targetInstanceId);
              if (card) {
                if (card.isImmune) break;
                card.isDestroyed = true;
                loc.cards[pid] = loc.cards[pid].filter((c) => c.instanceId !== patch.targetInstanceId);
              }
            }
          }
          break;
        }
        case 'draw_card': {
          const player = draft.players[patch.playerId];
          for (let i = 0; i < patch.count; i++) {
            if (player.deck.length > 0) {
              const card = player.deck.shift()!;
              player.hand.push(card);
            }
          }
          break;
        }
        case 'set_energy': {
          draft.players[patch.playerId].currentEnergy = Math.max(
            0,
            draft.players[patch.playerId].currentEnergy + patch.delta
          );
          break;
        }
        case 'set_status': {
          for (const loc of draft.locations) {
            for (const pid of ['player', 'ai'] as const) {
              const card = loc.cards[pid].find((c) => c.instanceId === patch.targetInstanceId);
              if (card) {
                card.statusEffects.push(patch.effect);
              }
            }
          }
          break;
        }
        case 'remove_status': {
          for (const loc of draft.locations) {
            for (const pid of ['player', 'ai'] as const) {
              const card = loc.cards[pid].find((c) => c.instanceId === patch.targetInstanceId);
              if (card) {
                card.statusEffects = card.statusEffects.filter(
                  (s) => s.type !== patch.effectType
                );
              }
            }
          }
          break;
        }
        case 'lock_location': {
          draft.locations[patch.locationIndex].isLockedFor = patch.lockedFor;
          break;
        }
        case 'set_max_cards': {
          draft.locations[patch.locationIndex].maxCardsOverride = patch.max;
          break;
        }
        case 'set_immune': {
          for (const loc of draft.locations) {
            for (const pid of ['player', 'ai'] as const) {
              const card = loc.cards[pid].find((c) => c.instanceId === patch.targetInstanceId);
              if (card) card.isImmune = true;
            }
          }
          break;
        }
        case 'set_energy_discount': {
          draft.players[patch.playerId].hasEnergyDiscount = patch.value;
          break;
        }
        case 'set_last_played': {
          draft.locations[patch.locationIndex].lastPlayedBy = patch.playerId;
          break;
        }
        case 'log_event': {
          draft.eventLog.push({ ...patch.event, id: generateId('evt') });
          break;
        }
        case 'request_card_target': {
          draft.pendingTargetSelection = {
            cardInstanceId: patch.triggeringCardInstanceId,
            type: 'card',
            playerId: patch.playerId,
            abilityKey: patch.abilityKey,
          };
          break;
        }
      }
    }
  });
}

export function findCardById(state: GameState, instanceId: string) {
  for (const loc of state.locations) {
    for (const pid of ['player', 'ai'] as const) {
      const card = loc.cards[pid].find((c) => c.instanceId === instanceId);
      if (card) return { card, locationIndex: state.locations.indexOf(loc), ownerId: pid };
    }
  }
  return null;
}
