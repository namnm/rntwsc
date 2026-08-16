import type { LoaderCallback, LoaderThis } from '#/devtools/babel-loader'

// Adapts a webpack-loader-shaped function into a Vite `transform` hook,
// reusing babel-loader/svg-loader instead of reimplementing them for Vite.
// See contribution/vite.md's "Reusing the existing babel and svg loaders".
export const webpackLoaderToVitePlugin = <T>(
  name: string,
  test: RegExp,
  loaderFn: (this: LoaderThis<T>, source: string) => void,
  getOptions: () => T,
) => ({
  name,
  enforce: 'pre' as const,
  transform: (code: string, id: string) => {
    if (!test.test(id)) {
      return
    }
    return new Promise<{ code: string; map?: unknown } | null>(
      (resolve, reject) => {
        const callback: LoaderCallback = (err, resultCode, map) => {
          if (err) {
            reject(err)
            return
          }
          resolve(
            resultCode === undefined
              ? null
              : {
                  code: resultCode,
                  map,
                },
          )
        }
        const ctx: LoaderThis<T> = {
          resourcePath: id,
          getOptions,
          async: () => callback,
          callback,
        }
        loaderFn.call(ctx, code)
      },
    )
  },
})
