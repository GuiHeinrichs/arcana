import { render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { HeaderNav } from '@/components/header-nav';

const pathname = vi.fn(() => '/top');
vi.mock('next/navigation', () => ({ usePathname: () => pathname() }));

describe('HeaderNav', () => {
  test('marks the active route with aria-current', () => {
    pathname.mockReturnValue('/top');
    render(<HeaderNav />);
    expect(screen.getByRole('link', { name: 'Top Cards' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Cards' })).not.toHaveAttribute('aria-current');
  });

  test('marks Cards active on the home route', () => {
    pathname.mockReturnValue('/');
    render(<HeaderNav />);
    expect(screen.getByRole('link', { name: 'Cards' })).toHaveAttribute('aria-current', 'page');
  });
});
