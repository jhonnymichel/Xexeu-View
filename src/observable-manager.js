import { isObject } from './utils';

export default class ObservableManager {
  constructor(callbackStash) {
    this._callbackStash = callbackStash;
    this.createObservableProperty = this.createObservableProperty.bind(this);
    this.createObjectObservables = this.createObjectObservables.bind(this);
    this.updateObjectObservables = this.updateObjectObservables.bind(this);
    this._isPropertyObservable = ObservableManager.isPropertyObservable.bind(this);
  }

  static isPropertyObservable(object, property) {
    return Boolean(Object.getOwnPropertyDescriptor(object, property));
  }

  updateObjectObservables(object, stringBinding) {
    for (const property in object) {
      const possibleObservable = property.substring(1, property.length);
      if (!this._isPropertyObservable(object, possibleObservable)) {
        const propertyValue = object[property];
        delete object[property];
        this.createObservableProperty(property, object, stringBinding);
        object[property] = propertyValue;
      }
    }
  }

  createObservableProperty(property, object, stringBinding) {
    const createObservableProperty = this.createObservableProperty;
    const createObjectObservables = this.createObjectObservables;
    const updateObjectObservables = this.updateObjectObservables;
    const isPropertyObservable = this._isPropertyObservable;
    const callbackStash = this._callbackStash;

    if (isPropertyObservable(object, property)) {
      return;
    }

    Object.defineProperty(object, property, {
      get() {
        return this[`_${property}`];
      },
      set(value) {
        this[`_${property}`] = value;

        if (isObject(value)) {
          if (isPropertyObservable(object, property)) {
            updateObjectObservables(value, stringBinding);
          } else {
            createObjectObservables(property, stringBinding);
          }
        }
        if (callbackStash[stringBinding]) {
          callbackStash[stringBinding].forEach(callback => callback(value, stringBinding));
        }
      }
    });
  }

  createObjectObservables(object, stringBinding) {
    let callbackList = this.$_callbacks;
    let nestedObjects = {};
    const _object = Array.isArray(object) && [] || {};
    for (const property in object) {
      const _stringBinding = stringBinding ? stringBinding + '.' + property : property;

      if (isObject(object[property])) {
	      nestedObjects[property] = this.createObjectObservables(object[property], _stringBinding);
      }

      this.createObservableProperty(property, _object, _stringBinding);
    }

    for (const nestedObject in nestedObjects) {
      _object[nestedObject] = nestedObjects[nestedObject];
    }
    return _object;
  }
}