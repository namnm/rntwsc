// tsconfig commonjs, some of the type definitions are not
// compatible with our setup, so we declare it here
declare module 'bezier-easing' {
  const m: Function
  export = m
}
