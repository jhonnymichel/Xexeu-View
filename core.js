class Xexeu {
  constructor( {el, viewModel, methods} ) {
    this._viewNode = document.querySelector(el);
    this._controller = {};
    this._controller.callbacks = {};
    for (let method in methods) {
      this._controller[method] = methods[method].bind(this._controller);
    }
    this._domObservers = [];
    this._setupObservableGetters(JSON.parse(JSON.stringify(viewModel)));
    this.setupObservers(this._parseObserverCandidatesFromViewNode());
    this.renderInitialView(viewModel);
    window.xexeu = this;
  }

  renderInitialView(viewModel, parent=this._controller.$viewModel) {
    for (let prop in viewModel) {
      parent[prop] = viewModel[prop];
      if (typeof viewModel[prop] === 'object') {
        this.renderInitialView(viewModel[prop], parent[prop]);
      }
    }

    viewModel = this._controller;
  }

  _parseObserverCandidatesFromViewNode() {
    return [...this._viewNode.querySelectorAll('*')]
      .filter(
        el => [...el.attributes].some(attr => attr.nodeName.startsWith('xexeu-'))
      );
  }

  _setupObservableGetters(viewModel) {
    const callbackList = this._controller.callbacks;
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
    this._controller.$viewModel = Object.create({}, _viewModel);
  }

  setupObservers(observers) {
    observers.forEach(this._setupObserverListForNode.bind(this));
    for (let item of this._domObservers) {
      for (let xexeuBind in item) {
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