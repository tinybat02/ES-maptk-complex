import { DataFrame, Field, Vector } from '@grafana/data';

export interface GeoJSON {
  features: Array<{
    type: string;
    properties: {
      [key: string]: string;
      name: string;
    };
    geometry: {
      type: string;
      coordinates: number[][][];
    };
  }>;
}

export interface PanelOptions {
  center_lat: number;
  center_lon: number;
  zoom_level: number;
  geojson: GeoJSON | null;
  area_flat: { [key: string]: number } | null;
}

export const defaults: PanelOptions = {
  center_lat: 48.1239,
  center_lon: 11.60857,
  zoom_level: 18,
  geojson: null,
  area_flat: null,
};

export interface Buffer extends Vector {
  buffer: number[];
}

export interface FieldBuffer extends Field<any, Vector> {
  values: Buffer;
}

export interface Frame extends DataFrame {
  fields: FieldBuffer[];
}
