import { check } from "meteor/check";

//method to check whether an object has any empty field.
//if so, it returns the relevant field key or array index
//if not, it returns false
//goes through objects and array recursively
export const ObjectHasEmptyField = (object) => {
  //empty array case
  if (object instanceof Array && object.length === 0) {
    return "some empty array";
  }

  //empty object case
  if (JSON.stringify(object) === JSON.stringify({})) {
    return "some empty object";
  }

  for (let key in object) {
    if (typeof object[key] === "object") {
      return ObjectHasEmptyField(object[key]);
    } else {
      if (object[key] === false) {
        continue;
      } else if (!object[key] && object[key] !== 0) {
        return key;
      }
    }
  }
  return false;
};

//method to compare two objects
//if anything differs it returns false, it returns true otherwise
export const ObjectEq = (object1, object2) => {
  return JSON.stringify(object1) === JSON.stringify(object2);
};

//method to convert 'true' and 'false' booleans to
//human-readable format 'Yes' and 'No'
export const BooleanToText = (boolean) => {
  if (boolean) {
    return "Yes";
  } else {
    return "No";
  }
};

//method to compare whether two arrays contain the exact same elements
//performs strict comparison on elements (includes type)
//returns true if the elements are the same, false otherwise
export const ArrayEq = (array1, array2) => {
  return JSON.stringify(array1.sort()) === JSON.stringify(array2.sort());
};

//method to compare whether two objects contain the exact same keys and the same types for each value
//essentially compares whether two objects have the same 'schema'
//returns true if so, false otherwise
export const checkKeys = (object, template) => {
  //first, check keys are the same
  if (!ArrayEq(Object.keys(object), Object.keys(template))) {
    return false;
  }

  //then, check types of values
  Object.keys(object).forEach((key) => {
    check(typeof object[key], typeof template[key]);
  });

  //if all went well, return true
  return true;
};

//method to round a floating point number without trailing zeroes and without scientific notation
//takes in a float and returns a rounded string
//gotten from: https://stackoverflow.com/questions/4689142/how-to-display-the-result-of-toprecision-without-the-scientific-notation
export const ToDecimalPrecision = (val, digits) => {
  val = (+val).toPrecision(digits);
  if (val.indexOf("e") >= 0) {
    val = (+val).toString();
  } else if (val.indexOf(".") >= 0) {
    val = val.replace(/(\.|)0+$/, "");
  }
  return Number(val);
};

//method to use as filter parameter to get unique values only from an array with duplicates
//from: https://stackoverflow.com/questions/1960473/get-all-unique-values-in-a-javascript-array-remove-duplicates
export const OnlyUnique = (value, index, self) => {
  return self.indexOf(value) === index;
};

//method to deep-freeze an object, making it immutable recursively
//returns new deep-frozen object
//from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/freeze
export const DeepFreeze = (object) => {
  // Retrieve the property names defined on object
  const propNames = Object.getOwnPropertyNames(object);

  // Freeze properties before freezing self

  for (const name of propNames) {
    const value = object[name];

    if (value && typeof value === "object") {
      DeepFreeze(value);
    }
  }

  return Object.freeze(object);
};

//method to capitalize a string
export const Capitalize = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

//method to interpret string as literal in regex
//returns sanitized string
export const EscapeRegex = (string) => {
  return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
};
