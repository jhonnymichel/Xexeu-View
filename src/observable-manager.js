import { isObject } from './utils';

export default class ObservableManager {
  constructor(callbackStash) {
    this._callbackStash = callbackStash;
    this._createObservableProperty = this._createObservableProperty.bind(this);
    this.createObjectObservables = this.createObjectObservables.bind(this);
    this._updateObjectObservables = this._updateObjectObservables.bind(this);
    this._isPropertyObservable = this._isPropertyObservable.bind(this);
  }

  _isPropertyObservable(object, property) {
    return Boolean(Object.getOwnPropertyDescriptor(object, property));
  }

  _updateObjectObservables(object, stringBinding) {
    for (const property in object) {
      const possibleObservable = property.substring(1, property.length);
      if (!this._isPropertyObservable(object, possibleObservable)) {
        const propertyValue = object[property];
        delete object[property];
        this._createObservableProperty(property, object, stringBinding);
        object[property] = propertyValue;
      }
    }
  }

  _createObservableProperty(property, object, stringBinding) {
    const createObservableProperty = this._createObservableProperty;
    const createObjectObservables = this.createObjectObservables;
    const updateObjectObservables = this._updateObjectObservables;
    const isPropertyObservable = this._isPropertyObservable;
    const callbackStash = this._callbackStash;

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
    const _object = {};
    for (const property in object) {
      const _stringBinding = stringBinding ? stringBinding + '.' + property : property;

      if (isObject(object[property])) {
	      nestedObjects[property] = this.createObjectObservables(object[property], _stringBinding);
      }

      this._createObservableProperty(property, _object, _stringBinding);
    }

    for (const nestedObject in nestedObjects) {
      _object[nestedObject] = nestedObjects[nestedObject];
    }
    return _object;
  }
}