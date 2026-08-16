// Stand-in for next-unchecked/navigation; real usePathname()/useSearchParams()
// need a mounted App Router. See docs/contribution/dev.md "Running unit tests".
export const usePathname = () => '/'
export const useSearchParams = () => new URLSearchParams()
