let repoRoot = ''

module.exports = Object.defineProperties(
  {
    /** @param {string} dir */
    // eslint-disable-next-line prefer-arrow/prefer-arrow-functions
    setRepoRoot(dir) {
      repoRoot = dir
    },
  },
  {
    repoRoot: {
      // eslint-disable-next-line prefer-arrow/prefer-arrow-functions
      get() {
        if (!repoRoot) {
          throw new Error('Missing repoRoot in entrypoint')
        }
        return repoRoot
      },
      enumerable: true,
    },
  },
)
