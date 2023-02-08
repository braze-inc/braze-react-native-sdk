/**
 * This default callback logs errors and null or false results. BrazeReactBridge methods with callbacks will
 * default to this if there is no user-provided callback.
 * @callback brazeCallback
 * @param {object} error - The callback error object
 * @param {object} result - The method return value
 */
export function brazeCallback(error, result) {
  if (error) {
    console.log(error);
  } else if (result == null || result === false) {
    console.log('Braze API method returned null or false.');
  }
}

/**
 * A helper method that wraps calls to BrazeReactBridge and passes in the
 * default Braze callback if no callback is provided.
 * @param {function} methodName - The BrazeReactBridge function to call
 * @param {array} argsArray - An array of arguments to pass into methodName
 * @param {function(error, result)} callback - The user-provided callback
 */
export function callFunctionWithCallback(methodName, argsArray, callback) {
  // If user-provided callback is null, undefined, or not a function, use default Braze callback
  if (
    typeof callback === 'undefined' ||
    callback == null ||
    typeof callback !== 'function'
  ) {
    callback = brazeCallback;
  }
  argsArray.push(callback);

  methodName.apply(this, argsArray);
}

export function parseNestedProperties(object) {
  if (object instanceof Array) {
    for (let i = 0; i < object.length; i++) {
      if (object[i] instanceof Date) {
        let dateProp = object[i];
        object[i] = {
          type: 'UNIX_timestamp',
          value: dateProp.valueOf()
        };
      } else {
        parseNestedProperties(object[i]);
      }
    }
  } else if (object instanceof Object) {
    for (const key of Object.keys(object)) {
      if (object[key] instanceof Date) {
        let dateProp = object[key];
        object[key] = {
          type: 'UNIX_timestamp',
          value: dateProp.valueOf()
        };
      } else {
        parseNestedProperties(object[key]);
      }
    }
  }
}
