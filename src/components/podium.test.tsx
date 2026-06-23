import { render, screen, within } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { Podium } from '@/components/podium';
import type { RankedCard } from '@/lib/top-cards';
import type { Card } from '@/lib/ygoprodeck';

vi.mock('next/image', () => ({
  default: (props: Record<string, unknown>) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...(props as { src: string; alt: string })} />;
  },
}));

function ranked(id: number, rank: number): RankedCard {
  const card = {
    id,
    name: `Card ${id}`,
    type: 'Effect Monster',
    humanReadableCardType: 'Effect Monster',
    frameType: 'effect',
    desc: 'd',
    race: 'Warrior',
    card_images: [{ id, image_url: 'a', image_url_small: 'a', image_url_cropped: 'a' }],
  } as Card;
  return { rank, metric: 100 - rank, card };
}

describe('Podium', () => {
  test('renders the three cards in rank order in the DOM', () => {
    const cards = [ranked(1, 1), ranked(2, 2), ranked(3, 3)];
    render(<Podium cards={cards} lens="week" onSelect={vi.fn()} />);
    const list = screen.getByRole('list');
    const badges = within(list).getAllByText(/^#\d$/).map((el) => el.textContent);
    expect(badges).toEqual(['#1', '#2', '#3']);
  });

  test('renders nothing when there are no cards', () => {
    const { container } = render(<Podium cards={[]} lens="week" onSelect={vi.fn()} />);
    expect(container).toBeEmptyDOMElement();
  });
});
