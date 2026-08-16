// nextjs doesnt support typescript mix with cjs
// we need to use js here
require('tsx/cjs')
const {
 mergeWithArray 
} = require('rntwsc/libs/lodash')
const {
 config 
} = require('@/tailwind-config')
const {
 twrncConfig 
} = require('@/twrnc-config')

module.exports = mergeWithArray({
}, config, twrncConfig)
