class Xexeu {
  constructor( {el, viewModel, methods} ) {
    this._viewNode = document.querySelector(el);
    this._controller = {};
    this._controller.callbacks = {};
    for (let method in methods) {
      this._controller[method] = methods[method].bind(this._controller);
    }
    this._domObservers = [];
    this._setupObservableGetters(viewModel);
    this.setupObservers(this._parseObserverCandidatesFromViewNode());
    this.renderInitialView(viewModel);
  }

  renderInitialView(viewModel) {
    for (let prop in viewModel) {
      this._controller[prop] = viewModel[prop];
    }
  }

  _parseObserverCandidatesFromViewNode() {
    return [...this._viewNode.querySelectorAll('*')]
      .filter(
        el => [...el.attributes].some(attr => attr.nodeName.startsWith('xexeu-'))
      );
  }

  _setupObservableGetters(viewModel) {
    for (let property in viewModel) {
      Object.defineProperty(this._controller, property, {
        get() {
          return this._property;
        },
        set(value) {
          if (this.callbacks[property]) {
            this.callbacks[property].forEach(callback => callback(value));
          }
          this._property = value;
        }
      })
    }
  }

  setupObservers(observers) {
    observers.forEach(this._setupObserverListForNode.bind(this));
    for (let item of this._domObservers) {
      for (let xexeuBind in item) {
        if (!this._controller.hasOwnProperty(item[xexeuBind]) && xexeuBind !== 'domNode') {
          this._setupObservableGetters({[item[xexeuBind]]: '' });
        }
        const directive = DirectiveRegistry.getDirective(xexeuBind);
        if (directive) {
          new directive(item[xexeuBind], item.domNode, this);
        }
      }
    }
  }

  _setupObserverListForNode(node) {
    const domObserver = this._domObservers[this._domObservers.push({}) - 1];
    domObserver.domNode = node;
    [...node.attributes]
      .filter(attr => attr.nodeName.startsWith('xexeu-'))
      .forEach(attr => {
        domObserver[attr.nodeName] = attr.value;
      });
  }
}