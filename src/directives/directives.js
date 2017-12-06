import { DirectiveRegistry, Directive } from './directive-registry'

DirectiveRegistry.registerDirective('xexeu-bind', (model, node) => {
  node.innerText = model;
});

class XexeuModel extends Directive {
  $created(node) {
    node.addEventListener('change', this.onInputChanged.bind(this));
    node.addEventListener('input', this.onInputChanged.bind(this));
  }

  $modelChanged(model) {
    debugger
    this.node.value = model;
    this.node.checked = model;
  }

  onInputChanged(e) {
    debugger
    this.model = (e.target.type !== 'text' ? e.target.checked : e.target.value);
  }
}

DirectiveRegistry.registerDirective('xexeu-model', XexeuModel);

function ActionCallbackDirectiveFactory(eventType, directiveName) {
  return class extends Directive {
    $created() {
      console.log(directiveName);
      this._addEventListener();
    }
  
    $hookChanged() {
      this.node.removeEventListener(eventType, this._currentHook);
      this._addEventListener();
    }
  
    _addEventListener() {
      if (!this.triggerHook) {
        return;
      }
      if (typeof this.triggerHook !== 'function') {
        return console.error(`${directiveName} binding should be a function`);
      }
      this._currentHook = this.triggerHook;
      this.node.addEventListener(eventType, this._currentHook);
    }
  }
}

DirectiveRegistry.registerDirective(
  'xexeu-submit',
  ActionCallbackDirectiveFactory('submit', 'xexeu-submit')
);

DirectiveRegistry.registerDirective(
  'xexeu-change',
  ActionCallbackDirectiveFactory('input', 'xexeu-change')
);

DirectiveRegistry.registerDirective(
  'xexeu-click',
  ActionCallbackDirectiveFactory('click', 'xexeu-click')
);
