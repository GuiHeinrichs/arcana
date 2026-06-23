import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { TopCards } from '@/components/top-cards';
import type { RankedCard, TopLens } from '@/lib/top-cards';
import type { Card } from '@/lib/ygoprodeck';

vi.mock('next/image', () => ({
  default: (props: Record<string, unknown>) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...(props as { src: string; alt: string })} />;
  },
}));

function ranked(id: number, rank: number, name: string): RankedCard {
  const card = {
    id,
    name,
    type: 'Effect Monster',
    humanReadableCardType: 'Effect Monster',
    frameType: 'effect',
    desc: 'd',
    race: 'Warrior',
    card_images: [{ id, image_url: 'a', image_url_small: 'a', image_url_cropped: 'a' }],
  } as Card;
  return { rank, metric: 1000 - rank, card };
}

const lenses: Record<TopLens, RankedCard[]> = {
  week: [ranked(1, 1, 'Ash Blossom'), ranked(2, 2, 'Maxx C'), ranked(3, 3, 'Nibiru'), ranked(4, 4, 'Pot')],
  views: [ranked(5, 1, 'Raigeki')],
  likes: [],
  staples: [ranked(6, 1, 'Called by the Grave')],
};

beforeEach(() => {
  window.history.replaceState(null, '', '/top');
});

describe('TopCards', () => {
  test('shows the initial lens with the winner in the podium', () => {
    render(<TopCards initialLens="week" lenses={lenses} />);
    expect(screen.getByRole('tab', { name: 'Em alta' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('Ash Blossom')).toBeInTheDocument();
  });

  test('switching tabs swaps the lens content and selection', async () => {
    const user = userEvent.setup();
    render(<TopCards initialLens="week" lenses={lenses} />);
    await user.click(screen.getByRole('tab', { name: 'Mais vistas' }));
    expect(screen.getByRole('tab', { name: 'Mais vistas' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('Raigeki')).toBeInTheDocument();
    expect(screen.queryByText('Ash Blossom')).not.toBeInTheDocument();
  });

  test('shows an empty state for a ranking lens with no data', async () => {
    const user = userEvent.setup();
    render(<TopCards initialLens="week" lenses={lenses} />);
    await user.click(screen.getByRole('tab', { name: 'Curtidas' }));
    expect(screen.getByText(/indispon/i)).toBeInTheDocument();
  });

  test('updates the URL when switching lenses', async () => {
    const user = userEvent.setup();
    render(<TopCards initialLens="week" lenses={lenses} />);
    await user.click(screen.getByRole('tab', { name: 'Staples' }));
    expect(window.location.search).toBe('?lens=staples');
  });
});
