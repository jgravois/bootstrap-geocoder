import json from '@rollup/plugin-json';
import nodeResolve from '@rollup/plugin-node-resolve';
import { uglify } from 'rollup-plugin-uglify';

export default {
  entry: 'src/GeosearchInput.js',
  moduleName: 'BootstrapGeocoder',
  format: 'umd',
  external: ['leaflet'],
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
      'esri-leaflet': 'L.esri'
    },
    sourceMap: true,
    format: 'umd',
    name: 'L.esri.BootstrapGeocoder'
  }
}
