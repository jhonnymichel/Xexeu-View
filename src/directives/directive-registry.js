import {parseBindingsFromString, deepBracket, isObject} from '../utils';
import ObservableManager from '../observable-manager';

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
    this._callbackStash = xexeu.$_callbackStash;
    this._xexeuViewModel = xexeu.$viewModel;
    this._hookChanged = this._hookChanged.bind(this);
    this._hasSkipedFirstBinding = false;
    this._observableManager = xexeu._observableManager;

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
      if (!this._callbackStash[hook]) {
        this._callbackStash[hook] = [];
      }
      if (!this._callbackStash[hook].includes(this._hookChanged)) {
        this._callbackStash[hook].push(this._hookChanged);
      }
    });

    if (!this._callbackStash[this._hooks.computedBinding]) {
      this._callbackStash[this._hooks.computedBinding] = [];
    }

    if (this.$modelChanged && !this._callbackStash[this._hooks.computedBinding].includes(this.$modelChanged)) {
      this._callbackStash[this._hooks.computedBinding].push(this.$modelChanged);
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
    try {
      return deepBracket(this._xexeuViewModel, this._hooks.computedBinding, true)
    } catch (e) {
      return '';
    }
  }

  set model(value) {
    try {
      const splitted = this._hooks.computedBinding.split('.');
      let objectToChange = this._xexeuViewModel;
      let parentObject;

      splitted.forEach((i) => {
        if (isObject(objectToChange[i])) {
          parentObject = objectToChange;
          objectToChange = objectToChange[i]
        }
      });
      const keyToSet = splitted[splitted.length-1];
      if (!ObservableManager.isPropertyObservable(objectToChange, keyToSet)) {
        if (splitted.length === 1) {
          this._observableManager.createObservableProperty(keyToSet, this._xexeuViewModel, this._hooks.computedBinding);
        } else {
          const keyFromObjectToChange = splitted[splitted.length-2];
          parentObject[keyFromObjectToChange] = Object.assign(objectToChange, {
            [keyToSet]: value
          });
        }
      }
      objectToChange[keyToSet] = value;
    } catch (e) {
      return;
    }
  }
}
