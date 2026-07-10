import { LocationAccuracyUtil } from './location-accuracy.util';

describe('LocationAccuracyUtil', () => {
  it('classifies GPS accuracy', () => {
    expect(LocationAccuracyUtil.quality(15)).toBe('high');
    expect(LocationAccuracyUtil.quality(60)).toBe('medium');
    expect(LocationAccuracyUtil.quality(180)).toBe('low');
  });

  it('calculates an approximate distance', () => {
    const distance = LocationAccuracyUtil.distanceMeters(
      { latitude: 18.4861, longitude: -69.9312 },
      { latitude: 18.4871, longitude: -69.9312 },
    );
    expect(distance).toBeGreaterThan(100);
    expect(distance).toBeLessThan(120);
  });
});
