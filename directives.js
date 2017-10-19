import { DirectiveRegistry, Directive } from './directive-registry.js';

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
