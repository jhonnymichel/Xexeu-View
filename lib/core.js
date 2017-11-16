import { DirectiveRegistry } from './directives/directive-registry'
import { isObject } from './utils'
import './directives/directives'

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

  _setupDirectives(directives) {
    directives.forEach(this._setupObserverListForNode.bind(this));
    for (let item of this.$_domObservers) {
      for (let xexeuBind in item) {
        const directive = DirectiveRegistry.getDirective(xexeuBind);
        if (directive) {
          new directive(item[xexeuBind], item.domNode, this);
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
      }
    );
  }
}
