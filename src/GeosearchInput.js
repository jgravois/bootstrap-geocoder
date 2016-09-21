import L from 'leaflet';

import { Util } from 'esri-leaflet';
import { geosearchCore, arcgisOnlineProvider } from 'esri-leaflet-geocoder';

export var Search = L.Layer.extend({

  options: {
    allowMultipleResults: true,
    placeholder: 'Search for places or addresses',
    title: 'Location Search',
    wrapperStyle: 'input-group',
    suggestionGroupStyle: 'dropdown-menu',
    selectedStyle: 'geocoder-control-selected'
  },

  initialize: function (options) {
    L.Util.setOptions(this, options);

    // this demo only supports one provider
    if (!options.providers) {
      options.providers = [ arcgisOnlineProvider() ];
    }

    // instantiate the underlying class and pass along options
    this._geosearchCore = geosearchCore(this, options);
    this._geosearchCore.addEventParent(this);

    this._geosearchCore._pendingSuggestions = [];

    // bubble provider events up to the control
    this._geosearchCore._providers[0].addEventParent(this);
  },

  _renderSuggestions: function (suggestions) {
    var nodes = [];
    var list;
    var header;

    var currentGroup;
    this._suggestions.style.display = 'block';

    for (var i = 0; i < suggestions.length; i++) {
      var suggestion = suggestions[i];

      if (!list) {
        list = L.DomUtil.create('ul', null, this._suggestions);
        list.style.display = 'block';
      }

      var suggestionItem = L.DomUtil.create('li', 'geocoder-control-suggestion', list);

      suggestionItem.innerHTML = suggestion.text;
      suggestionItem.provider = suggestion.provider;
      suggestionItem['data-magic-key'] = suggestion.magicKey;
    }

    nodes.push(list);

    return nodes;
  },

  clear: function () {
    this._suggestions.innerHTML = '';
    this._suggestions.style.display = 'none';
    this._input.value = '';
  },

  clearSuggestions: function () {
    if (this._nodes) {
      for (var k = 0; k < this._nodes.length; k++) {
        if (this._nodes[k].parentElement) {
          this._suggestions.removeChild(this._nodes[k]);
        }
      }
    }
  },

  onAdd: function (map) {
    this._map = map;
    Util.setEsriAttribution(map);

    this._input = document.getElementById(this.options.inputTag);

    // create a wrapper div around the input
    this._wrapper = document.createElement('div');

    L.DomUtil.addClass(this._wrapper, this.options.wrapperStyle);

    this._input.parentNode.insertBefore(this._wrapper, this._input);
    this._wrapper.appendChild(this._input);

    this._input.title = this.options.title;

    // create dom node for suggestions and place it below the input
    this._suggestions = document.createElement('div');
    L.DomUtil.addClass(this._suggestions, this.options.suggestionGroupStyle);

    this._input.parentNode.insertBefore(this._suggestions, null);

    L.DomEvent.addListener(this._input, 'focus', function (e) {
      this._input.placeholder = this.options.placeholder;
    }, this);

    L.DomEvent.addListener(this._suggestions, 'mousedown', function (e) {
      var suggestionItem = e.target || e.srcElement;
      this._geosearchCore._geocode(suggestionItem.innerHTML, suggestionItem['data-magic-key'], suggestionItem.provider);
      this.clear();
    }, this);

    L.DomEvent.addListener(this._input, 'blur', function (e) {
      this._input.placeholder = '';
      this.clear();
    }, this);

    L.DomEvent.addListener(this._input, 'keydown', function (e) {
      var selectedStyle = this.options.selectedStyle;

      var list = this._suggestions.querySelectorAll('.' + 'geocoder-control-suggestion');
      var selected = this._suggestions.querySelectorAll('.' + selectedStyle)[0];
      var selectedPosition;

      for (var i = 0; i < list.length; i++) {
        if (list[i] === selected) {
          selectedPosition = i;
          break;
        }
      }

      switch (e.keyCode) {
        case 13:  // enter
          if (selected) {
            this._geosearchCore._geocode(selected.innerText, selected['data-magic-key'], selected.provider);
            this.clear();
          } else if (this.options.allowMultipleResults) {
            this._geosearchCore._geocode(this._input.value, undefined);
            this.clear();
          } else {
            L.DomUtil.addClass(list[0], selectedStyle);
          }
          L.DomEvent.preventDefault(e);
          break;
        case 38: // up arrow
          if (selected) {
            L.DomUtil.removeClass(selected, selectedStyle);
          }

          var previousItem = list[selectedPosition - 1];

          if (selected && previousItem) {
            L.DomUtil.addClass(previousItem, selectedStyle);
          } else {
            L.DomUtil.addClass(list[list.length - 1], selectedStyle);
          }
          L.DomEvent.preventDefault(e);
          break;
        case 40: // down arrow
          if (selected) {
            L.DomUtil.removeClass(selected, selectedStyle);
          }

          var nextItem = list[selectedPosition + 1];

          if (selected && nextItem) {
            L.DomUtil.addClass(nextItem, selectedStyle);
          } else {
            L.DomUtil.addClass(list[0], selectedStyle);
          }
          L.DomEvent.preventDefault(e);
          break;
        default:
          // when the input changes we should cancel all pending suggestion requests if possible to avoid result collisions
          for (var x = 0; x < this._geosearchCore._pendingSuggestions.length; x++) {
            var request = this._geosearchCore._pendingSuggestions[x];
            if (request && request.abort && !request.id) {
              request.abort();
            }
          }
          break;
      }
    }, this);

    L.DomEvent.addListener(this._input, 'keyup', L.Util.throttle(function (e) {
      var key = e.which || e.keyCode;
      var text = (e.target || e.srcElement).value;

      // require at least 2 characters for suggestions
      if (text.length < 2) {
        this._suggestions.innerHTML = '';
        this._suggestions.style.display = 'none';
        return;
      }

      // if this is the escape key it will clear the input so clear suggestions
      if (key === 27) {
        this._suggestions.innerHTML = '';
        this._suggestions.style.display = 'none';
        return;
      }

      // if this is NOT the up/down arrows or enter make a suggestion
      if (key !== 13 && key !== 38 && key !== 40) {
        if (this._input.value !== this._lastValue) {
          this._lastValue = this._input.value;
          this._geosearchCore._suggest(text);
        }
      }
    }, 50, this), this);
  }
});

export function search (options) {
  return new Search(options);
}

export default search;
