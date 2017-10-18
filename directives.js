DirectiveRegistry.registerDirective('xexeu-bind', function(hook, node) {
  if (!this._controller.callbacks[hook]) {
    this._controller.callbacks[hook] = []
  }
  this._controller.callbacks[hook].push(
    (value) => {
      node.innerText = value;
    }
  );
})

DirectiveRegistry.registerDirective('xexeu-model', function(hook, node) {
  if (!this._controller.callbacks[hook]) {
    this._controller.callbacks[hook] = []
  }

  const changeCalback = (e) => {
    this._controller[hook] = (e.target.type !== 'text' ? e.target.checked : e.target.value);
  }

  node.addEventListener('change', changeCalback);
  node.addEventListener('input', changeCalback);

  this._controller.callbacks[hook].push(
    (value) => {
      node.value = value;
      node.checked = value;
    }
  );
});

DirectiveRegistry.registerDirective('xexeu-change', function(hook, node) {
  node.addEventListener('input', this._controller[hook]);
})