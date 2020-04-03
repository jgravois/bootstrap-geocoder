import json from '@rollup/plugin-json';
import nodeResolve from '@rollup/plugin-node-resolve';
import { uglify } from 'rollup-plugin-uglify';

export default {
  plugins: [
    nodeResolve(),
    json(),
    uglify()
  ],
  input: 'src/GeosearchInput.js',
  output: {
    file: 'built/bootstrap-geocoder.js',
    globals: {
      'leaflet': 'L',
      'esri-leaflet': 'L.esri',
      'esri-leaflet-geocoder': 'L.esri.Geocoding'
    },
    sourcemap: true,
    format: 'umd',
    name: 'L.esri.BootstrapGeocoder'
  },
  external: [ 'leaflet', 'esri-leaflet', 'esri-leaflet-geocoder' ]
}
