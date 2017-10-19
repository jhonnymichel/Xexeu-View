let directiveRegistryInstance = null;

class DirectiveRegistry {

  static registerDirective(name, initializer) {
    if (!directiveRegistryInstance) {
      new DirectiveRegistry();
    }

    if (!Directive.isPrototypeOf(initializer)) {
      directiveRegistryInstance[name] = class extends Directive {
        $modelChanged(model){
          initializer(model, this.node);
        }
      };
    } else {
      directiveRegistryInstance[name] = initializer;
    }
  }

  static getDirective(name) {
    return directiveRegistryInstance[name];
  }

  constructor() {
    if (!directiveRegistryInstance) {
      directiveRegistryInstance = this;
    } else {
      throw('This is a singleton. use the static methods');
    }

    return directiveRegistryInstance;
  }
}

class Directive {
  constructor(hook, node, xexeu) {
    this.node = node;
    this._hook = hook;
    this._xexeuController = xexeu.$controller;

    if (!this._xexeuController.callbacks[hook]) {
      this._xexeuController.callbacks[hook] = [];
    }
    if (this.$modelChanged) {
      this._xexeuController.callbacks[hook].push(this.$modelChanged.bind(this));
    }
    if (typeof this._xexeuController.$viewModel[hook] === 'function') {
      this.triggerHook = xexeu_.controller.$viewModel[hook];
    }

    if (this.$created) {
      this.$created(node);
    }
  }

  get model() {
    return this._xexeuController.$viewModel[this._hook];
  }

  set model(value) {
    this._xexeuController.$viewModel[this._hook] = value;
  }
}