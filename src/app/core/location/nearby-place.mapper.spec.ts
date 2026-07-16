import type { GeoPoint } from './location.model';
import { NearbyPlaceMapper } from './nearby-place.mapper';

describe('NearbyPlaceMapper', () => {
  const mapper = new NearbyPlaceMapper();
  const origin: GeoPoint = {
    latitude: 18.5,
    longitude: -69.9,
    accuracy: 8,
    altitude: null,
    speed: null,
    heading: null,
    timestamp: 1,
  };

  it('maps point elements with specific OSM type labels and address', () => {
    const place = mapper.fromElement({
      type: 'node',
      id: 10,
      lat: 18.5005,
      lon: -69.9005,
      tags: {
        name: 'Farmacia Central',
        amenity: 'pharmacy',
        'addr:street': 'Duarte',
        'addr:housenumber': '12',
        'addr:city': 'Santo Domingo',
      },
    }, origin);

    expect(place).toEqual(jasmine.objectContaining({
      id: 'node-10',
      name: 'Farmacia Central',
      category: 'health',
      typeLabel: 'Farmacia',
      address: 'Duarte 12 Santo Domingo',
    }));
    expect(place?.distanceMeters).toBeGreaterThan(0);
  });

  it('uses center coordinates, brand names and humanized unknown tags', () => {
    const place = mapper.fromElement({
      type: 'way',
      id: 20,
      center: { lat: 18.501, lon: -69.901 },
      tags: { brand: 'Móvil RD', shop: 'mobile_phone' },
    }, origin);

    expect(place).toEqual(jasmine.objectContaining({
      id: 'way-20',
      name: 'Móvil RD',
      category: 'shop',
      typeLabel: 'Celulares',
      address: 'Dirección no disponible',
    }));
  });

  it('returns null when coordinates are missing and creates generic fallbacks', () => {
    expect(mapper.fromElement({ type: 'node', id: 30 }, origin)).toBeNull();

    const place = mapper.fromElement({
      type: 'node',
      id: 31,
      lat: 18.5,
      lon: -69.9,
      tags: { tourism: 'viewpoint' },
    }, origin);

    expect(place?.name).toBe('viewpoint');
    expect(place?.category).toBe('tourism');
    expect(place?.typeLabel).toBe('Mirador');
  });

  it('classifies restaurants and education amenities', () => {
    expect(mapper.fromElement({
      type: 'node',
      id: 40,
      lat: 18.5,
      lon: -69.9,
      tags: { amenity: 'fast_food' },
    }, origin)?.category).toBe('restaurant');

    expect(mapper.fromElement({
      type: 'node',
      id: 41,
      lat: 18.5,
      lon: -69.9,
      tags: { amenity: 'university' },
    }, origin)?.category).toBe('education');
  });

  it('humanizes unknown known-key tag values', () => {
    const place = mapper.fromElement({
      type: 'node',
      id: 42,
      lat: 18.5,
      lon: -69.9,
      tags: { shop: 'pet_store' },
    }, origin);

    expect(place?.typeLabel).toBe('Pet store');
  });
});
