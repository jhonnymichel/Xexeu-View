import { DirectiveRegistry } from './directive-registry.js'
import { isObject } from './utils.js'
import './directives.js'

export default class Xexeu {
  constructor( {node, viewModel, methods} ) {
    this._viewNode = document.querySelector(node);
    this.$_callbacks = {};
    this.$_domObservers = [];
    this.$viewModel =
      this._getObservableProperties(JSON.parse(JSON.stringify(viewModel)));
    this._bindMethodsToViewModel(methods);
    this._setupDirectives(this._parseDirectivesFromViewNode());
    this._renderInitialView(viewModel);
  }

  _bindMethodsToViewModel(methods) {
    for (let method in methods) {
      this.$viewModel[method] = methods[method].bind(this.$viewModel);
    }
  }

  _renderInitialView(viewModel, parent=this.$viewModel) {
    for (let prop in viewModel) {
      if (isObject(viewModel[prop])) {
        this._renderInitialView(viewModel[prop], parent[prop]);
        continue;
      }
      parent[prop] = viewModel[prop];
    }
  }

  _parseDirectivesFromViewNode() {
    return [...this._viewNode.querySelectorAll('*')]
      .filter(
        el => [...el.attributes].some(attr => attr.nodeName.startsWith('xexeu-'))
      );
  }

  _getObservableProperties(viewModel, callbackPrep) {
    let callbackList = this.$_callbacks;
    let nestedObjects = {};
    const _viewModel = {};
    for (let property in viewModel) {
      let _callbackPrep = callbackPrep ? callbackPrep + '.' + property : property;

      if (isObject(viewModel[property])) {
        nestedObjects[property] = this._getObservableProperties(viewModel[property], _callbackPrep);
      }
      _viewModel[`_${property}`] = viewModel[property];

      Object.defineProperty(_viewModel, property, {
        get() {
          return this[`_${property}`];
        },
        set(value) {
          if (callbackList[_callbackPrep]) {
            callbackList[_callbackPrep].forEach(callback => callback(value));
          }
          this[`_${property}`] = value;
        }
      });
    }

    for (let nestedObject in nestedObjects) {
      _viewModel[nestedObject] = nestedObjects[nestedObject];
    }
    return _viewModel;
  }

  _shiftAndAppendNextBindingProperty(computedProperties, propertiesList, parent) {
    if (computedProperties[0].match(/\[/)) {
      computedProperties.unshift(computedProperties[0].split(/\]/).shift());
      computedProperties[1] = computedProperties[1].split(/\[/).pop();
    }
    let keyToConcat = computedProperties.shift().split(/\]/)[0];
    propertiesList[propertiesList.length -1] += `.${parent[keyToConcat]}`;
  }

  _cleanBindingListNoise(array) {
    while (!array[array.length -1]) {
      array.pop();
    }
  }

  _getBindingList(item, parent=this.$viewModel) {
    const propertiesList = [];
    let computedProperties = item.split(/\[(.*)|\](.*)/);
    if (computedProperties.length === 1) {
      return computedProperties;
    }

    this._cleanBindingListNoise(computedProperties)

    propertiesList.push(computedProperties.shift());

    while (computedProperties.length) {
      if (computedProperties[0].match((/\[/))) {
        if (computedProperties[0].indexOf('[') < computedProperties[0].indexOf[']']) {
          const binding = computedProperties[0];
          propertiesList.push(this._getBindingList(binding.split(']')[0]));
        } else {
          this._shiftAndAppendNextBindingProperty(computedProperties, propertiesList, parent);
        }
      } else {
        this._shiftAndAppendNextBindingProperty(computedProperties, propertiesList, parent);
      }
    }
    return propertiesList;
  }

  _resolveDeepBracket(selector) {
    const splitted = selector.split('.');
    let property = this.$viewModel;
    splitted.forEach((i) => property = property[i]);
    return property;
  }

  _shiftAndAppendNextBindingProperty(computedProperties, propertiesList, parent) {
    debugger
    if (computedProperties[0].match(/\[/)) {
      computedProperties.unshift(computedProperties[0].split(/\]/).shift());
      computedProperties[1] = computedProperties[1].split(/\[/).pop();
    }
    let keyToConcat = computedProperties.shift().split(/\]/)[0];
    propertiesList.push(keyToConcat);
    if (propertiesList[0].includes('.')) {
      propertiesList.push(propertiesList[0]);
    }
    if (keyToConcat.includes('.')) {
      keyToConcat = this._resolveDeepBracket(keyToConcat);
      return propertiesList[0] += `.${keyToConcat}`;
    }
    return propertiesList[0] += `.${parent[keyToConcat]}`;
  }

  _cleanBindingListNoise(array) {
    while (!array[array.length -1]) {
      array.pop();
    }
  }

  _getBindingList(item, parent=this.$viewModel) {
    debugger
    const propertiesList = [];
    let computedProperties = item.split(/\[(.*)|\](.*)/);
    if (computedProperties.length === 1) {
      return computedProperties;
    }

    this._cleanBindingListNoise(computedProperties)

    propertiesList.push(computedProperties.shift());

    while (computedProperties.length) {
      if (computedProperties[0].match((/\[/))) {
        if (computedProperties[0].indexOf('[') < computedProperties[0].indexOf(']')) {
          const binding = computedProperties[0];
          const computedBindings = this._getBindingList(binding.split(']')[0]);
          computedProperties[0] = computedProperties[0].replace(binding.split(']')[0] + ']]', computedBindings[0]);
          computedProperties = computedProperties[0].split(/\[(.*)|\](.*)/);
          this._cleanBindingListNoise(computedProperties);
          this._shiftAndAppendNextBindingProperty(computedProperties, propertiesList, parent);
        } else {
          this._shiftAndAppendNextBindingProperty(computedProperties, propertiesList, parent[propertiesList[0]]);
        }
      } else {
        this._shiftAndAppendNextBindingProperty(computedProperties, propertiesList, parent);
      }
    }
    return propertiesList;
  }

  _setupDirectives(directives) {
    directives.forEach(this._setupObserverListForNode.bind(this));
    for (let item of this.$_domObservers) {
      for (let xexeuBind in item) {
        const directive = DirectiveRegistry.getDirective(xexeuBind);
        if (directive) {
          new directive(this._getBindingList(item[xexeuBind]), item.domNode, this);
        }
      }
    }
  }

  _setupObserverListForNode(node) {
    const domObserver = this.$_domObservers[this.$_domObservers.push({}) - 1];
    domObserver.domNode = node;
    [...node.attributes]
      .filter(attr => attr.nodeName.startsWith('xexeu-'))
      .forEach(attr => {
        domObserver[attr.nodeName] = attr.value;
      });
  }
}