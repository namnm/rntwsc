let repoRoot = ''

module.exports = Object.defineProperties(
  {
    /** @param {string} dir */
    setRepoRoot: dir => {
      repoRoot = dir
    },
  },
  {
    repoRoot: {
      get: () => {
        if (!repoRoot) {
          throw new Error('Missing repoRoot in entrypoint')
        }
        return repoRoot
      },
      enumerable: true,
    },
  },
)
