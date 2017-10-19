class Xexeu {
  constructor( {node, viewModel, methods} ) {
    this._viewNode = document.querySelector(node);
    this.$_callbacks = {};
    this.$_domObservers = [];
    this.$viewModel = Object.create(
      {},
      this._getObservableProperties(JSON.parse(JSON.stringify(viewModel)))
    );
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
      parent[prop] = viewModel[prop];
      if (typeof viewModel[prop] === 'object') {
        this._renderInitialView(viewModel[prop], parent[prop]);
      }
    }
  }

  _parseDirectivesFromViewNode() {
    return [...this._viewNode.querySelectorAll('*')]
      .filter(
        el => [...el.attributes].some(attr => attr.nodeName.startsWith('xexeu-'))
      );
  }

  _getObservableProperties(viewModel) {
    const callbackList = this.$_callbacks;
    const _viewModel = {};
    for (let property in viewModel) {
      _viewModel[property] = {
        get() {
          return this[`_${property}`];
        },
        set(value) {
          if (callbackList[property]) {
            callbackList[property].forEach(callback => callback(value));
          }
          this[`_${property}`] = value;
        }
      }
    }
    return _viewModel;
  }

  _setupDirectives(observers) {
    observers.forEach(this._setupObserverListForNode.bind(this));
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
      });
  }
}