// Type-safe field selection DSL, e.g. selectFields<Product>(p => p.name.variants(v => v.sku)).
// Builds the Selection tree dynamic.ts renders. See contribution/internals.md#graphql-codegen.

export type Selection = {
  [field: string]: true | Selection
}

// Expandable means the field's type has its own selectable fields - a
// relation, or a list of them. Scalars resolve to never and stay chainable.
type ExpandableOf<V> =
  NonNullable<V> extends readonly (infer U)[]
    ? U extends object
      ? U
      : never
    : NonNullable<V> extends object
      ? NonNullable<V>
      : never

// Puts NestedAcc back inside Original's own wrapper (array/nullable/plain),
// so selecting fields on a `Variant[]` relation still comes back as an array.
type ReplaceItem<Original, Item, NestedAcc> =
  Original extends Array<infer U>
    ? U extends Item
      ? Array<NestedAcc>
      : Original
    : Original extends Item
      ? NestedAcc
      : Original

type DunderKeys<T> = Extract<keyof T, `__${string}`>

// Keys always included without being selectable: dunder keys, plus `id` when
// T has one (stamped onto every record by makeSelectorProxy below).
export type AutoKeys<T> = DunderKeys<T> | Extract<'id', keyof T>

// Acc accumulates the selected shape as fields fold in, so re-selecting a
// key is a type error. See contribution/internals.md#graphql-codegen.
export type Selector<T, Acc = Pick<T, AutoKeys<T>>> = {
  readonly [K in Exclude<keyof T, AutoKeys<T> | keyof Acc>]-?: [
    ExpandableOf<T[K]>,
  ] extends [never]
    ? Selector<T, Acc & Record<K, T[K]>>
    : Selector<T, Acc & Record<K, T[K]>> &
        (<NestedAcc>(
          build: (
            p: Selector<ExpandableOf<T[K]>>,
          ) => Selector<ExpandableOf<T[K]>, NestedAcc>,
        ) => Selector<
          T,
          Acc & Record<K, ReplaceItem<T[K], ExpandableOf<T[K]>, NestedAcc>>
        >)
}

// Pulls Acc back out of a select callback's return type S; S = never means
// no select was given. See contribution/internals.md#graphql-codegen.
export type SelectedShape<T, S> = [S] extends [never]
  ? T
  : S extends Selector<T, infer Acc>
    ? Acc
    : T

const makeSelectorProxy = (record: Selection): unknown => {
  record.__typename = true
  record.id = true

  let lastKey: string | null = null

  // The proxy target must be a function for the `apply` trap below to be
  // valid - it is never called directly, only reached through the proxy.
  const target = () => undefined

  const proxy: unknown = new Proxy(target, {
    get: (_target, prop) => {
      if (typeof prop !== 'string') {
        return undefined
      }
      lastKey = prop
      if (!(prop in record)) {
        record[prop] = true
      }
      return proxy
    },
    apply: (_target, _thisArg, args: unknown[]) => {
      if (lastKey === null) {
        return proxy
      }
      const build = args[0] as ((p: unknown) => unknown) | undefined
      if (build) {
        const childRecord: Selection = {}
        build(makeSelectorProxy(childRecord))
        record[lastKey] = childRecord
      }
      return proxy
    },
  })

  return proxy
}

export const selectFields = <T>(
  build: (p: Selector<T>) => unknown,
): Selection => {
  const record: Selection = {}
  build(makeSelectorProxy(record) as Selector<T>)
  return record
}
