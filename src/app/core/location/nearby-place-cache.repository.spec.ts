import type { GeoPoint, NearbyPlace, NearbySearch } from './location.model';
import { NearbyPlaceCacheRepository } from './nearby-place-cache.repository';

describe('NearbyPlaceCacheRepository', () => {
  const repository = new NearbyPlaceCacheRepository();
  const now = new Date('2026-07-15T12:00:00.000Z').getTime();
  const origin: GeoPoint = {
    latitude: 18.5,
    longitude: -69.9,
    accuracy: 5,
    altitude: null,
    speed: null,
    heading: null,
    timestamp: now,
  };
  const search: NearbySearch = { origin, radiusMeters: 1_000, category: 'all' };
  const places: NearbyPlace[] = [{
    id: 'node-1',
    name: 'Escuela',
    category: 'education',
    typeLabel: 'Escuela',
    latitude: 18.5001,
    longitude: -69.9001,
    distanceMeters: 15,
    address: 'Calle 1',
  }];

  beforeEach(() => {
    localStorage.clear();
    spyOn(Date, 'now').and.returnValue(now);
  });

  it('returns cached places for compatible recent searches', () => {
    repository.save(search, places);

    expect(repository.find({
      ...search,
      origin: { ...origin, latitude: 18.501 },
    })).toEqual(places);
  });

  it('rejects stale, distant or incompatible cached searches', () => {
    repository.save(search, places);

    (Date.now as jasmine.Spy).and.returnValue(now + 16 * 60_000);
    expect(repository.find(search)).toEqual([]);

    (Date.now as jasmine.Spy).and.returnValue(now);
    expect(repository.find({ ...search, category: 'shop' })).toEqual([]);
    expect(repository.find({ ...search, origin: { ...origin, latitude: 18.6 } })).toEqual([]);
  });

  it('clears malformed cache entries', () => {
    localStorage.setItem('educontrol.cache.nearby-places', '{bad json');

    expect(repository.find(search)).toEqual([]);
    expect(localStorage.getItem('educontrol.cache.nearby-places')).toBeNull();
  });
});
