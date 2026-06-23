import { render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { HoloCard } from '@/components/holo-card';
import type { Card } from '@/lib/ygoprodeck';

// next/image pulls in server-only internals in jsdom; render a plain <img>.
vi.mock('next/image', () => ({
  default: (props: Record<string, unknown>) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...(props as { src: string; alt: string })} />;
  },
}));

const card: Card = {
  id: 1,
  name: 'Ash Blossom',
  type: 'Effect Monster',
  humanReadableCardType: 'Effect Monster',
  frameType: 'effect',
  desc: 'd',
  race: 'Zombie',
  card_images: [
    { id: 1, image_url: 'a', image_url_small: 'a', image_url_cropped: 'a' },
  ],
};

describe('HoloCard', () => {
  test('shows a rank badge and metric when provided', () => {
    render(<HoloCard card={card} onSelect={vi.fn()} rank={1} metric="128.4k views" />);
    expect(screen.getByText('#1')).toBeInTheDocument();
    expect(screen.getByText('128.4k views')).toBeInTheDocument();
    expect(screen.getByText(/Rank 1/)).toBeInTheDocument();
  });

  test('renders no rank badge when rank is omitted', () => {
    render(<HoloCard card={card} onSelect={vi.fn()} />);
    expect(screen.queryByText('#1')).not.toBeInTheDocument();
  });
});
