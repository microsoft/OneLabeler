// Safely get the value of a property.
// Returns undefined if the object does not have the property.
export const getPropertyValue = (
  object: unknown,
  propertyName: string,
): unknown => {
  const propertyDescriptor = Object.getOwnPropertyDescriptor(
    object,
    propertyName,
  );
  if (propertyDescriptor === undefined) return undefined;
  if (propertyDescriptor.get) {
    try {
      return propertyDescriptor.get();
    } catch {
      return propertyDescriptor.get;
    }
  }

  return propertyDescriptor.value;
};

export type ObjectIterator = (object: unknown) => Generator<{
  name: unknown;
  data: unknown;
  isNonEnumerable: boolean;
}, void, unknown>;

// The type of compare function used by Array.prototype.sort
export type CompareFunction = ((a: string, b: string) => number) | undefined;

// Create a safe iterator that can iterate on arbitrary
// JavaScript variable's properties.
export const createIterator = (
  showNonEnumerable: boolean,
  sortObjectKeys: boolean | CompareFunction,
): ObjectIterator => {
  function* objectIterator(data: unknown) {
    const shouldIterate = (typeof data === 'object' && data !== null)
      || typeof data === 'function';
    if (!shouldIterate) return;

    const dataIsArray = Array.isArray(data);

    // iterable objects (except arrays)
    if (!dataIsArray && (data as Iterable<unknown>)[Symbol.iterator]) {
      let i = 0;
      // eslint-disable-next-line no-restricted-syntax
      for (const entry of data as Iterable<unknown>) {
        if (Array.isArray(entry) && entry.length === 2) {
          const [k, v] = entry;
          yield {
            name: k,
            data: v,
            isNonEnumerable: false,
          };
        } else {
          yield {
            name: i.toString(),
            data: entry,
            isNonEnumerable: false,
          };
        }
        i += 1;
      }
    } else {
      const keys = Object.getOwnPropertyNames(data);
      if (sortObjectKeys === true && !dataIsArray) {
        // Array keys should not be sorted in alphabetical order
        keys.sort();
      } else if (typeof sortObjectKeys === 'function') {
        keys.sort(sortObjectKeys);
      }

      // eslint-disable-next-line no-restricted-syntax
      for (const propertyName of keys) {
        if ({}.propertyIsEnumerable.call(data, propertyName)) {
          const propertyValue = getPropertyValue(data, propertyName);
          yield {
            name: propertyName || '""',
            data: propertyValue,
            isNonEnumerable: false,
          };
        } else if (showNonEnumerable) {
          // To work around the error
          // (happens some time when propertyName === 'caller' || propertyName === 'arguments')
          // 'caller' and 'arguments' are restricted function properties
          // and cannot be accessed in this context
          // http://stackoverflow.com/questions/31921189/caller-and-arguments-are-restricted-function-properties-and-cannot-be-access
          let propertyValue;
          try {
            propertyValue = getPropertyValue(data, propertyName);
          } catch (e) {
            // console.warn(e)
          }

          if (propertyValue !== undefined) {
            yield {
              name: propertyName,
              data: propertyValue,
              isNonEnumerable: true,
            };
          }
        }
      }

      // [[Prototype]] of the object: `Object.getPrototypeOf(data)`
      // the property name is shown as "__proto__"
      if (showNonEnumerable && data !== Object.prototype /* already added */) {
        yield {
          name: '__proto__',
          data: Object.getPrototypeOf(data),
          isNonEnumerable: true,
        };
      }
    }
  }

  return objectIterator;
};
