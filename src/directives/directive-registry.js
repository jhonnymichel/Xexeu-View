import {parseBindingsFromString} from '../utils';

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
  constructor(hooks, node, xexeu) {
    this.node = node;
    this._hooks = hooks;
    this._xexeuCallbacks = xexeu.$_callbacks;
    this._xexeuViewModel = xexeu.$viewModel;
    this._hookChanged = this._hookChanged.bind(this);
    this._hasSkipedFirstBinding = false;

    if (this.$modelChanged) {
      this.$modelChanged = this.$modelChanged.bind(this);
    }

    this._initializeHooks();

    if (this.$created) {
      this.$created(node);
    }
  }

  _initializeHooks() {
    this._hooks.dependencies.forEach((hook) => {
      if (!this._xexeuCallbacks[hook]) {
        this._xexeuCallbacks[hook] = [];
      }
      if (!this._xexeuCallbacks[hook].includes(this._hookChanged)) {
        this._xexeuCallbacks[hook].push(this._hookChanged);
      }
    });

    if (!this._xexeuCallbacks[this._hooks.computedBinding]) {
      this._xexeuCallbacks[this._hooks.computedBinding] = [];
    }

    if (this.$modelChanged && !this._xexeuCallbacks[this._hooks.computedBinding].includes(this.$modelChanged)) {
      this._xexeuCallbacks[this._hooks.computedBinding].push(this.$modelChanged);
    }
    if (typeof this.model === 'function') {
      this.triggerHook = this.model;
    }
  }

  _hookChanged() {
    if (this._hasSkipedFirstBinding) {
      this._hooks = parseBindingsFromString(this._hooks.stringBinding, this._xexeuViewModel);
      this._initializeHooks();
      if (this.$modelChanged) {
        this.$modelChanged(this.model);
      }
    } else {
      this._hasSkipedFirstBinding = true;
    }
  }

  get model() {
    const splitted = this._hooks.computedBinding.split('.');
    let property = this._xexeuViewModel;
    splitted.forEach((i) => property = property[i]);
    return property;
  }

  set model(value) {
    const splitted = this._hooks.computedBinding.split('.');
    let property = this._xexeuViewModel;

    splitted.forEach((i) => {
      if (typeof property[i] === 'object') {
        property = property[i]
      }
    });
    property[splitted[splitted.length-1]] = value;
  }
}
