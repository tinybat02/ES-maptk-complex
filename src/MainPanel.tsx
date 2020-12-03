import React, { PureComponent } from 'react';
import { PanelProps } from '@grafana/data';
import { PanelOptions, Frame } from 'types';
//@ts-ignore
import { Map, TileLayer, VectorLayer, control } from 'maptalks';
//@ts-ignore
//@ts-ignore
import { ThreeLayer } from 'maptalks.three';
import { createLayer, createNormalizeLayer } from './util/process';
import { nanoid } from 'nanoid';
import 'maptalks/dist/maptalks.css';
import './style/main.css';

interface Props extends PanelProps<PanelOptions> {}
interface State {
  normalize: boolean;
}

export class MainPanel extends PureComponent<Props, State> {
  id = 'id' + nanoid();
  map: Map;
  threeLayer: VectorLayer;
  normalizeLayer: VectorLayer;

  state: State = {
    normalize: false,
  };

  componentDidMount() {
    const { center_lat, center_lon, zoom_level } = this.props.options;
    this.map = new Map(this.id, {
      center: [center_lon, center_lat],
      zoom: zoom_level,
      pitch: 56,
      bearing: 60,
      baseLayer: new TileLayer('base', {
        urlTemplate: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
        subdomains: ['a', 'b', 'c', 'd'],
        attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
      }),
      touchGesture: true,
      doubleClickZoom: false,
    });

    if (!this.props.options.geojson || this.props.data.series.length == 0) return;

    this.threeLayer = createLayer(this.props.data.series as Frame[], this.props.options.geojson);
    this.map.addLayer(this.threeLayer);

    if (!this.props.options.area_flat) return;
    this.normalizeLayer = createNormalizeLayer(
      this.props.data.series as Frame[],
      this.props.options.geojson,
      this.props.options.area_flat
    );
  }

  componentDidUpdate(prevProps: Props, prevState: State) {
    if (prevProps.data.series !== this.props.data.series) {
      this.map.removeLayer(this.threeLayer);
      this.map.removeLayer(this.normalizeLayer);

      if (!this.props.options.geojson || this.props.data.series.length == 0) return;
      this.threeLayer = createLayer(this.props.data.series as Frame[], this.props.options.geojson);
      if (!this.state.normalize) this.map.addLayer(this.threeLayer);

      if (!this.props.options.area_flat) return;
      this.normalizeLayer = createNormalizeLayer(
        this.props.data.series as Frame[],
        this.props.options.geojson,
        this.props.options.area_flat
      );

      if (this.state.normalize) this.map.addLayer(this.normalizeLayer);
    }

    if (prevState.normalize != this.state.normalize) {
      this.map.removeLayer(this.threeLayer);
      this.map.removeLayer(this.normalizeLayer);

      if (!this.state.normalize && this.props.options.geojson) {
        this.threeLayer = createLayer(this.props.data.series as Frame[], this.props.options.geojson);
        this.map.addLayer(this.threeLayer);
      }

      if (this.state.normalize && this.props.options.geojson && this.props.options.area_flat) {
        this.normalizeLayer = createNormalizeLayer(
          this.props.data.series as Frame[],
          this.props.options.geojson,
          this.props.options.area_flat
        );
        this.map.addLayer(this.normalizeLayer);
      }
    }
  }

  switchMode = () => {
    this.setState({ normalize: !this.state.normalize });
  };

  render() {
    const { width, height } = this.props;
    const { normalize } = this.state;

    return (
      <>
        <div
          id={this.id}
          style={{
            width,
            height,
          }}
        />
        <div className="pane" onClick={this.switchMode}>
          {normalize ? 'Per/m2' : 'Per Store'}
        </div>
      </>
    );
  }
}
