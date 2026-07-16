import { LocationAccuracyUtil } from './location-accuracy.util';
import type { GeoPoint, NearbyPlace } from './location.model';

export interface OverpassElement {
  type: string;
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

export class NearbyPlaceMapper {
  fromElement(element: OverpassElement, origin: GeoPoint): NearbyPlace | null {
    const latitude = element.lat ?? element.center?.lat;
    const longitude = element.lon ?? element.center?.lon;
    if (latitude === undefined || longitude === undefined) return null;

    const tags = element.tags ?? {};
    return {
      id: `${element.type}-${element.id}`,
      name: tags['name'] || tags['brand'] || this.fallbackName(tags),
      category: this.category(tags),
      typeLabel: this.typeLabel(tags),
      latitude,
      longitude,
      distanceMeters: LocationAccuracyUtil.distanceMeters(origin, { latitude, longitude }),
      address: this.address(tags),
    };
  }

  private category(tags: Record<string, string>): NearbyPlace['category'] {
    if (tags['amenity'] === 'restaurant' || tags['amenity'] === 'cafe' || tags['amenity'] === 'fast_food') {
      return 'restaurant';
    }
    if (tags['shop']) return 'shop';
    if (tags['tourism'] || tags['historic']) return 'tourism';
    if (tags['amenity'] === 'hospital' || tags['amenity'] === 'clinic' || tags['amenity'] === 'pharmacy') {
      return 'health';
    }
    if (tags['amenity'] === 'school' || tags['amenity'] === 'college' || tags['amenity'] === 'university') {
      return 'education';
    }
    return 'other';
  }

  private typeLabel(tags: Record<string, string>): string {
    const amenityLabels: Record<string, string> = {
      restaurant: 'Restaurante',
      cafe: 'Cafetería',
      fast_food: 'Comida rápida',
      bar: 'Bar',
      pub: 'Pub',
      hospital: 'Hospital',
      clinic: 'Clínica',
      doctors: 'Consultorio médico',
      dentist: 'Dentista',
      pharmacy: 'Farmacia',
      school: 'Escuela',
      college: 'Colegio',
      university: 'Universidad',
      kindergarten: 'Preescolar',
      library: 'Biblioteca',
      bank: 'Banco',
      atm: 'Cajero automático',
      fuel: 'Estación de combustible',
      parking: 'Parqueo',
      place_of_worship: 'Lugar de culto',
      police: 'Policía',
      post_office: 'Correo',
    };
    const shopLabels: Record<string, string> = {
      supermarket: 'Supermercado',
      convenience: 'Colmado',
      bakery: 'Panadería',
      clothes: 'Tienda de ropa',
      shoes: 'Zapatería',
      hardware: 'Ferretería',
      electronics: 'Electrónica',
      mobile_phone: 'Celulares',
      beauty: 'Belleza',
      hairdresser: 'Peluquería',
      pharmacy: 'Farmacia',
      mall: 'Centro comercial',
      department_store: 'Tienda por departamentos',
      car_repair: 'Taller',
    };
    const tourismLabels: Record<string, string> = {
      attraction: 'Atracción turística',
      hotel: 'Hotel',
      guest_house: 'Hospedaje',
      museum: 'Museo',
      information: 'Información turística',
      artwork: 'Arte público',
      viewpoint: 'Mirador',
    };
    const historicLabels: Record<string, string> = {
      monument: 'Monumento',
      memorial: 'Memorial',
      ruins: 'Ruinas',
      building: 'Edificio histórico',
      church: 'Iglesia histórica',
    };

    if (tags['amenity']) return amenityLabels[tags['amenity']] ?? this.humanize(tags['amenity']);
    if (tags['shop']) return shopLabels[tags['shop']] ?? this.humanize(tags['shop']);
    if (tags['tourism']) return tourismLabels[tags['tourism']] ?? this.humanize(tags['tourism']);
    if (tags['historic']) return historicLabels[tags['historic']] ?? this.humanize(tags['historic']);
    return 'Lugar cercano';
  }

  private fallbackName(tags: Record<string, string>): string {
    return tags['amenity'] || tags['shop'] || tags['tourism'] || 'Lugar cercano';
  }

  private humanize(value: string): string {
    const normalized = value.replace(/_/g, ' ').trim();
    return normalized.charAt(0).toUpperCase() + normalized.slice(1);
  }

  private address(tags: Record<string, string>): string {
    return [
      tags['addr:street'],
      tags['addr:housenumber'],
      tags['addr:city'],
    ].filter(Boolean).join(' ') || 'Dirección no disponible';
  }
}
