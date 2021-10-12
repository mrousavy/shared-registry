/* global WeakRef */

/**
 * Can be used in filter functions to filter out empty values.
 * Can also be used to check for undefined values.
 * @param value
 */
 const notEmpty = <TValue>(value: TValue | null | undefined): value is TValue => value != null


export class SharedRegistry<K, V extends object> {
  private store = new Map<K, WeakRef<V>[]>();

  private getValues(key: K): WeakRef<V>[] {
    if (!this.store.has(key)) 
      this.store.set(key, [])
    
    return this.store.get(key)!
  }

  get(key: K): readonly V[] {
    const values = this.getValues(key)
    return values.map((v) => v.deref()).filter(notEmpty)
  }

  register(key: K, value: V): void {
    const values = this.getValues(key)
    values.push(new WeakRef(value))
  }
}




const registry = new SharedRegistry()

class MyObject {

}
