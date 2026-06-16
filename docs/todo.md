# TODO

## Hydration / Core

### Native: tach `index.native.ts` thanh implementation rieng

Hien tai `index.native.ts` o ca `core/fetch` va `core/graphql` chi la stub re-export browser code.
Native co the can:

- Offline cache (MMKV / AsyncStorage)
- Re-fetch on app focus / network reconnect
- Background fetch
- Push notification invalidation

Khi native can bat ky behavior nao trong so nay, phai co file rieng thay vi re-export.

---

### Request cancellation / race condition

`useFetch` va `useApollo` khong cancel pending request khi:

- Component unmount giua chung fetch
- URL / variables thay doi truoc khi request truoc done

Result cua request cu van set vao store, co the ghi de data moi hon.

Fix huong: dung `AbortController` trong `useFetch`, dung `r.refetch` cancel semantic trong Apollo.
Scope: `packages/core/fetch/index.browser.ts`, `packages/core/graphql/index.browser.ts`.

---

### Apollo auto-refetch khong clear `hydrationErr`

`clearHydrationErr` chi duoc goi khi user manual click refetch. Neu Apollo tu refetch
(polling, cache invalidation, network recovery) va thanh cong, `hydrationErr` van con set.
Consumer thay data moi nhung `err` field van hien.

Fix huong: subscribe Apollo's `client.watchQuery` observable de detect khi Apollo co result
moi ma khong phai tu `refetch()` cua chung ta. Hoac: clear `hydrationErr` khi `r.loading`
chuyen tu `true` sang `false` va `r.data` thay doi.
Scope: `packages/core/graphql/index.browser.ts`, `packages/core/graphql/store.ts`.
