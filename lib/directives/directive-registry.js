class _DirectiveRegistry {
  registerDirective(name, initializer) {
    if (!Directive.isPrototypeOf(initializer)) {
      this[name] = class extends Directive {
        $modelChanged(model){
          initializer(model, this.node);
        }
      };
    } else {
      this[name] = initializer;
    }
  }

  getDirective(name) {
    return this[name];
  }
}

export const DirectiveRegistry = new _DirectiveRegistry() 

export class Directive {
  constructor(hook, node, xexeu) {
    this.node = node;
    this._hook = hook;
    this._xexeuCallbacks = xexeu.$_callbacks;
    this._xexeuViewModel = xexeu.$viewModel;

    if (!this._xexeuCallbacks[hook]) {
      this._xexeuCallbacks[hook] = [];
    }
    if (this.$modelChanged) {
      this._xexeuCallbacks[hook].push(this.$modelChanged.bind(this));
    }
    if (typeof this._xexeuViewModel[hook] === 'function') {
      this.triggerHook = this._xexeuViewModel[hook];
    }

    if (this.$created) {
      this.$created(node);
    }
  }

  get model() {
    const splitted = this._hook.split('.');
    let property = this._xexeuViewModel;
    splitted.forEach((i) => property = property[i]);
    return property;
  }

  set model(value) {
    const splitted = this._hook.split('.');
    let property = this._xexeuViewModel;

    splitted.forEach((i) => {
      if (typeof property[i] === 'object') {
        property = property[i]
      }
    });
    property[splitted[splitted.length-1]] = value;
  }
}
