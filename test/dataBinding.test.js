import {parseBindingsFromString} from '../src/utils';

describe('parseBindingsFromString', () => {
  it('should detect and isolate all computed properties presented in string', () => {
    const $viewModel = {
      currentUser: {name: 'John Doe'},
      users: {
        ['John Doe']: {
          age: 14
        },
        ['Mary Foe']: {
          age: 55
        }
      },
    };

    const bind = 'users[currentUser.name].age';
    const result = parseBindingsFromString(bind, $viewModel);
    expect(result).toEqual({
      computedBinding: 'users.John Doe.age',
      dependencies: [
        'currentUser.name',
        'currentUser',
        'users.John Doe',
        'users'
      ]
    });
  });

  it('should work even with any level of deepness', () => {
    const $viewModel = {
      currentUserFirstKey: 'name',
      currentUser: {name: 'John Doe'},
      users: {
        ['John Doe']: {
          age: 14
        },
        ['Mary Foe']: {
          age: 55
        }
      },
    };

    const bind = 'users[currentUser[currentUserFirstKey]].age';
    const result = parseBindingsFromString(bind, $viewModel);
    expect(result).toEqual({
      computedBinding: 'users.John Doe.age',
      dependencies: [
        'currentUserFirstKey',
        'currentUser.name',
        'currentUser',
        'users.John Doe',
        'users'
      ]
    });
  });

  it('should not parse what is inside strings', () => {
    const $viewModel = {
      ageKey: 'age',
      currentUserFirstKey: 'name',
      currentUser: {name: 'John Doe'},
      users: {
        ['John Doe']: {
          age: 14
        },
        ['Mary Foe']: {
          age: 55
        }
      },
    };

    const bind = 'users[currentUser["name"]]["age"]';
    const result = parseBindingsFromString(bind, $viewModel);
    expect(result).toEqual({
      computedBinding: 'users.John Doe.age',
      dependencies: [
       'currentUser.name',
       'currentUser',
       'users.John Doe',
       'users'
      ]
     });
  });

  it('should throw errors for invalid binding expressions', () => {
    const $viewModel = {
      ageKey: 'age',
      currentUserFirstKey: 'name',
      currentUser: {name: 'John Doe'},
      users: {
        ['John Doe']: {
          age: 14
        },
        ['Mary Foe']: {
          age: 55
        }
      },
    };

    const bind = 'users[currentUser["name"]][[[[[[]["age"]';
    function testError() {
      parseBindingsFromString(bind);
    }
    expect(testError).toThrowError('Invalid binding expression');
  });

  it('should work with everything using brackets', () => {
    const $viewModel = {
      ageKey: 'age',
      currentUserFirstKey: 'name',
      currentUser: {name: 'John Doe'},
      users: {
        ['John Doe']: {
          age: 14
        },
        ['Mary Foe']: {
          age: 55
        }
      },
    };

    const bind = 'users[currentUser[currentUserFirstKey]][ageKey]';
    const result = parseBindingsFromString(bind, $viewModel);
    expect(result).toEqual({
      computedBinding: 'users.John Doe.age',
      dependencies: [
        'ageKey',
        'currentUserFirstKey',
        'currentUser.name',
        'currentUser',
        'users.John Doe',
        'users'
      ]
    });
  });
})