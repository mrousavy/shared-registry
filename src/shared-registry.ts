/* global WeakRef */

/**
 * Can be used in filter functions to filter out empty values.
 * Can also be used to check for undefined values.
 * @param value
 */
const notEmpty = <TValue>(value: TValue | null | undefined): value is TValue =>
  value != null;

/**
 * A Map-like key-value storage for keeping weak references to objects, grouped by a specific key.
 *
 * Example:
 *
 * ```ts
 * const registry = new SharedRegistry()
 * const KEY = "myobj"
 *
 * // Create two objects, we retain a strong reference on first,
 * // but don't use `second` anywhere else so it will be deleted soon.
 * const first = new MyObject()
 * const second = new MyObject()
 *
 * // we add both entries to the registry. The registry
 * // only holds a weak reference to the objects.
 * registry.add(KEY, first)
 * registry.add(KEY, second)
 *
 * // here, both objects are still active and haven't been deleted yet.
 * console.log(registry.get(KEY)) // <-- "[first, second]"
 *
 * // let's set a timeout and wait for half a minute.
 * setTimeout(() => {
 *   // we use `first` here, so JS doesn't delete it. the reference is still strong.
 *   // notice however that we do not use `second` in here, no code is referencing
 *   // it anymore. the JS engine probably already deleted the `second` object. (garbage collector)
 *   console.log(`First is still alive: ${first != null}`) // true
 *
 *   // as we can see, the registry now only returns the `first` object.
 *   // the `second` object has been deleted by the JS engine's garbage collector.
 *   console.log(registry.get(KEY)) // <-- "[first]"
 * }, 30000)
 * ```
 */
export class SharedRegistry<K, V extends object> {
  private store = new Map<K, WeakRef<V>[]>();

  private getValues(key: K): WeakRef<V>[] {
    if (!this.store.has(key)) this.store.set(key, []);

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.store.get(key)!;
  }

  /**
   * Get all values for the given key that are still alive.
   * Values that have already been garbage collected will be skipped.
   */
  get(key: K): readonly V[] {
    const values = this.getValues(key);
    return values.map((v) => v.deref()).filter(notEmpty);
  }

  /**
   * Inserts a new `value` into the registry. The registry holds a weak reference to the value.
   *
   * If no strong reference to the `value` exists anymore and it gets garbage collected, it will
   * no longer be returned when calling `get(…)`.
   */
  add(key: K, value: V): void {
    const values = this.getValues(key);
    values.push(new WeakRef(value));
  }
}

const registry = new SharedRegistry();

class MyObject {}
