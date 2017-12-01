export function isObject (obj) {
  return (obj !== null && typeof obj === 'object');
}

export function startAndEndsWith(str, char) {
  return (str.startsWith(char) && str.endsWith(char));
}

export function isValidBindingExpression(expression) {
  return ((expression.match(/\[/g) || []).length === (expression.match(/\]/g) || []).length);
}

export function deepBracket(obj, path) {
  if (!path.match(/\./)) {
    return path;
  }
  const splitted = path.split('.');
  let property = obj;
  splitted.forEach((i) => {
    if (property[i]) {
      property = property[i];
    } else {
      throw new Error(`Binding Error: Could not find property ${i} in ${property}`);
    }
  });
  return property;
}

export function parseDeepBindings(deepBindings, fullBindings) {
  while(deepBindings.match(/\./)) {
    const lastDot = deepBindings.lastIndexOf('.');
    const remainingBindings = deepBindings.substring(0, lastDot)
    fullBindings.push(remainingBindings);
    deepBindings = remainingBindings;
  }
}

export function getDeepestBinding(binding) {
  if (!binding.match(/\[|\]/)) {
    return binding;
  }
  let deepestBinding = binding.substring(binding.lastIndexOf('['), binding.length);
  const endOfSubstring = deepestBinding.indexOf(']');
  deepestBinding =   deepestBinding.substring(0, (endOfSubstring !== -1 ? endOfSubstring : deepestBinding.length));
  return deepestBinding;
}

export function parseBindingsFromString(binding, $viewModel) {
  if (!isValidBindingExpression(binding)) {
    throw new SyntaxError('Invalid binding expression');
  }
  const fullBindings = [];
  let computedBinding = binding;
  while(computedBinding.match(/\[|\]/)) {
    let bindToCompute = getDeepestBinding(computedBinding);
    bindToCompute = bindToCompute.replace(/\[|\]/g, '');
    if (startAndEndsWith(bindToCompute, '\'') || startAndEndsWith(bindToCompute, '"')) {
      const replaceString = bindToCompute.substring(0, 1);
      if (!$viewModel[bindToCompute]) {
        bindToCompute = bindToCompute.substring(1, bindToCompute.length -1);
        computedBinding = computedBinding.replace(`[${replaceString}${bindToCompute}${replaceString}]`, `.${bindToCompute}`);
        continue;
      }
    }
    fullBindings.push(bindToCompute);

    if (bindToCompute.match(/\./)) {
      parseDeepBindings(bindToCompute, fullBindings);
      const fatherObject = computedBinding.substring(0, computedBinding.indexOf('['));
      computedBinding = computedBinding.replace(
        /\[(.*?)\]/,
        `.${deepBracket($viewModel, bindToCompute)}`
      );
    }
    computedBinding = computedBinding.replace(`[${bindToCompute}]`, `.${$viewModel[bindToCompute]}`);

  }

  parseDeepBindings(computedBinding, fullBindings);

  return {
    stringBinding: binding,
    computedBinding, 
    dependencies: fullBindings
  }
}