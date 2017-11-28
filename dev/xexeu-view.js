(function(l, i, v, e) { v = l.createElement(i); v.async = 1; v.src = '//' + (location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; e = l.getElementsByTagName(i)[0]; e.parentNode.insertBefore(v, e)})(document, 'script');
var Xexeu = (function () {
'use strict';

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

const DirectiveRegistry = new _DirectiveRegistry(); 

class Directive {
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
        property = property[i];
      }
    });
    property[splitted[splitted.length-1]] = value;
  }
}

function isObject (obj) {
  return (obj !== null && typeof obj === 'object');
}

DirectiveRegistry.registerDirective('xexeu-bind', (model, node) => {
  node.innerText = model;
});

class XexeuModel extends Directive {
  $created(node) {
    node.addEventListener('change', this.onInputChanged.bind(this));
    node.addEventListener('input', this.onInputChanged.bind(this));
  }

  $modelChanged(model) {
    this.node.value = model;
    this.node.checked = model;
  }

  onInputChanged(e) {
    this.model = (e.target.type !== 'text' ? e.target.checked : e.target.value);
  }
}

DirectiveRegistry.registerDirective('xexeu-model', XexeuModel);

class XexeuChange extends Directive {
  $created(node) {
    node.addEventListener('input', this.triggerHook);
  }
}

DirectiveRegistry.registerDirective('xexeu-change', XexeuChange);

class Xexeu$1 {
  constructor( {node, viewModel, methods} ) {
    this._viewNode = document.querySelector(node);
    this.$_callbacks = {};
    this.$_domObservers = [];
    this.$viewModel =
      this._getObservableProperties(JSON.parse(JSON.stringify(viewModel)));
    this._bindMethodsToViewModel(methods);
    this._setupDirectives(this._parseDirectivesFromViewNode());
    this._renderInitialView(viewModel);
  }

  _bindMethodsToViewModel(methods) {
    for (let method in methods) {
      this.$viewModel[method] = methods[method].bind(this.$viewModel);
    }
  }

  _renderInitialView(viewModel, parent=this.$viewModel) {
    for (let prop in viewModel) {
      if (isObject(viewModel[prop])) {
        this._renderInitialView(viewModel[prop], parent[prop]);
        continue;
      }
      parent[prop] = viewModel[prop];
    }
  }

  _parseDirectivesFromViewNode() {
    return [...this._viewNode.querySelectorAll('*')]
      .filter(
	      el => [...el.attributes].some(attr => attr.nodeName.startsWith('xexeu-'))
      );
  }

  _getObservableProperties(viewModel, callbackPrep) {
    let callbackList = this.$_callbacks;
    let nestedObjects = {};
    const _viewModel = {};
    for (let property in viewModel) {
      let _callbackPrep = callbackPrep ? callbackPrep + '.' + property : property;

      if (isObject(viewModel[property])) {
	      nestedObjects[property] = this._getObservableProperties(viewModel[property], _callbackPrep);
      }

      Object.defineProperty(_viewModel, property, {
        get() {
          return this[`_${property}`];
        },
        set(value) {
          if (callbackList[_callbackPrep]) {
            callbackList[_callbackPrep].forEach(callback => callback(value));
          }
          this[`_${property}`] = value;
        }
      });
    }

    for (let nestedObject in nestedObjects) {
      _viewModel[nestedObject] = nestedObjects[nestedObject];
    }
    return _viewModel;
  }

  _setupDirectives(directives) {
    directives.forEach(this._setupObserverListForNode.bind(this));
    for (let item of this.$_domObservers) {
      for (let xexeuBind in item) {
        const directive = DirectiveRegistry.getDirective(xexeuBind);
        if (directive) {
          new directive(item[xexeuBind], item.domNode, this);
        }
      }
    }
  }

  _setupObserverListForNode(node) {
    const domObserver = this.$_domObservers[this.$_domObservers.push({}) - 1];
    domObserver.domNode = node;
    [...node.attributes]
      .filter(attr => attr.nodeName.startsWith('xexeu-'))
      .forEach(attr => {
	      domObserver[attr.nodeName] = attr.value;
      }
    );
  }
}

return Xexeu$1;

}());
//# sourceMappingURL=xexeu-view.js.map
