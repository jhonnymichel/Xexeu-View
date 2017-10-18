let directiveRegistryInstance = null;

class DirectiveRegistry {

  static registerDirective(name, initializer) {
    if (!directiveRegistryInstance) {
      new DirectiveRegistry();
    }

    directiveRegistryInstance[name] = initializer;
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