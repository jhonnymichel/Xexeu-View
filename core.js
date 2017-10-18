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

  renderInitialView(viewModel, parent=this._controller) {
    for (let prop in viewModel) {
      parent[prop] = viewModel[prop];
      if (typeof viewModel[prop] === 'object') {
        this.renderInitialView(viewModel[prop], parent[prop]);
      }
    }
  }

  _parseObserverCandidatesFromViewNode() {
    return [...this._viewNode.querySelectorAll('*')]
      .filter(
        el => [...el.attributes].some(attr => attr.nodeName.startsWith('xexeu-'))
      );
  }

  _setupObservableGetters(viewModel, parent=this._controller, callbackName='', thisObj=this._controller) {
    for (let property in viewModel) {
      let _callbackName = callbackName ? `${callbackName}.${property}` : property;
      if (typeof viewModel[property] === 'object' && !parent.hasOwnProperty(property)) {
        parent[property] = viewModel[property];
        this._setupObservableGetters(viewModel[property], parent[property], _callbackName);
        _callbackName = callbackName ? `${callbackName}.${property}` : property;
      }
      thisObj[`_${_callbackName}`] = viewModel[property];
      Object.defineProperty(parent, property, {
        get() {
          return thisObj[`_${_callbackName}`];
        },
        set(value) {
          debugger
          if (thisObj.callbacks[_callbackName]) {
            let _value = value;
            if (typeof _value === 'object') {
              _value = JSON.stringify(_value);
            }
            thisObj.callbacks[_callbackName].forEach(callback => callback(_value));
          }
          thisObj[`_${_callbackName}`] = value;
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