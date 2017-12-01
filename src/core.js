import { DirectiveRegistry } from './directives/directive-registry'
import { isObject, parseBindingsFromString } from './utils'
import ObservableManager from './observable-manager';
import './directives/directives'

export default class Xexeu {
  constructor( {node, viewModel, methods} ) {
    this._viewNode = document.querySelector(node);
    this.$_callbackStash = {};
    this.$_domObservers = [];
    this._observableManager = new ObservableManager(this.$_callbackStash);
    Object.defineProperty(this, '$viewModel', {
      value: this._observableManager.createObjectObservables(JSON.parse(JSON.stringify(viewModel))),
      writable: false
    });
    this._originalViewModel = viewModel;
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

  _setupDirectives(directives) {
    directives.forEach(this._setupObserverListForNode.bind(this));
    for (let item of this.$_domObservers) {
      for (let xexeuBind in item) {
        const directive = DirectiveRegistry.getDirective(xexeuBind);
        if (directive) {
          new directive(parseBindingsFromString(item[xexeuBind], this._originalViewModel), item.domNode, this);
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
