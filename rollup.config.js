import { rollup } from 'rollup';
import json from 'rollup-plugin-json';
import nodeResolve from 'rollup-plugin-node-resolve';
import uglify from 'rollup-plugin-uglify';

var pkg = require('./package.json');

export default {
  entry: 'src/GeosearchInput.js',
  moduleName: 'BootstrapGeocoder',
  format: 'umd',
  external: ['leaflet'],
  plugins: [
    nodeResolve({
      jsnext: true,
      main: false,
      browser: false,
      extensions: [ '.js', '.json' ]
    }),
    json(),
    uglify()
  ],
  dest: 'built/bootstrap-geocoder.js',
  globals: {
    'leaflet': 'L',
    'esri-leaflet': 'L.esri'
  },
  sourceMap: 'inline'
}