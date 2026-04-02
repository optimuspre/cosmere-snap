import type { CardInstance } from '../../types';
import { CardComponent } from '../Card/CardComponent';

interface Props {
  cards: CardInstance[];
  pendingPlayIds: string[];
  draggingCardId: string | null;
  onDragStart: (cardId: string) => void;
  onDragEnd: () => void;
  onCardClick: (cardId: string) => void;
}

export function PlayerHand({ cards, pendingPlayIds, draggingCardId, onDragStart, onDragEnd, onCardClick }: Props) {
  return (
    <div className="flex gap-2 items-end justify-center flex-wrap">
      {cards.map((card) => {
        const isPending = pendingPlayIds.includes(card.instanceId);
        return (
          <div
            key={card.instanceId}
            style={{ opacity: isPending ? 0.5 : 1, transition: 'opacity 0.2s' }}
          >
            <CardComponent
              card={card}
              isPending={isPending}
              isSelected={draggingCardId === card.instanceId}
              onDragStart={() => onDragStart(card.instanceId)}
              onDragEnd={onDragEnd}
              onClick={() => onCardClick(card.instanceId)}
            />
          </div>
        );
      })}
    </div>
  );
}
