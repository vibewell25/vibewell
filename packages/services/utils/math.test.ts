import { sumInts } from './math';

describe('sumInts', () => {
  it('returns 0n when no values are provided', () => {
    expect(sumInts()).toBe(0n);
  });

  it('sums number values correctly', () => {
    expect(sumInts(1, 2, 3)).toBe(6n);
  });

  it('sums bigint values correctly', () => {
    expect(sumInts(1n, 2n, 3n)).toBe(6n);
  });

  it('mixes numbers and bigints correctly', () => {
    expect(sumInts(100, 200n, 300)).toBe(600n);
  });

  it('handles values beyond MAX_SAFE_INTEGER reliably', () => {
    const big = BigInt(Number.MAX_SAFE_INTEGER) + 1n;
    expect(sumInts(big, big)).toBe(big * 2n);
  });
}); 