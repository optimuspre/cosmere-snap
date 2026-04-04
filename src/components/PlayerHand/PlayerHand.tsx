import type { CardInstance } from '../../types';
import { CardComponent } from '../Card/CardComponent';
import { useIsMobile } from '../../hooks/useIsMobile';

interface Props {
  cards: CardInstance[];
  pendingPlayIds: string[];
  selectedHandCardId: string | null;
  draggingCardId: string | null;
  onDragStart: (cardId: string) => void;
  onDragEnd: () => void;
  onCardTap: (cardId: string) => void;
  onCardDetailClick: (card: CardInstance) => void;
}

export function PlayerHand({
  cards,
  pendingPlayIds,
  selectedHandCardId,
  draggingCardId: _draggingCardId,
  onDragStart,
  onDragEnd,
  onCardTap,
  onCardDetailClick,
}: Props) {
  const isMobile = useIsMobile();

  return (
    <div className="flex gap-1.5 items-end justify-center flex-wrap">
      {cards.map((card) => {
        const isPending = pendingPlayIds.includes(card.instanceId);
        const isSelected = selectedHandCardId === card.instanceId;
        return (
          <div
            key={card.instanceId}
            style={{
              opacity: isPending ? 0.45 : 1,
              transition: 'opacity 0.2s, transform 0.15s',
              transform: isSelected ? 'translateY(-8px)' : 'none',
            }}
          >
            <CardComponent
              card={card}
              size={isMobile ? 'xs' : 'md'}
              isPending={isPending}
              isSelected={isSelected}
              onDragStart={() => onDragStart(card.instanceId)}
              onDragEnd={onDragEnd}
              onClick={() => onCardTap(card.instanceId)}
              onDetailClick={() => onCardDetailClick(card)}
            />
          </div>
        );
      })}
    </div>
  );
}
