// Build-time data loader for the Engineering blog.
// Components consume it with:  import { data as posts } from '../engineering.data'
// See https://vitepress.dev/guide/data-loading#createcontentloader

import { createEngineeringLoader } from './engineeringPosts'
import type { EngineeringPost } from './engineeringPosts'

export type { EngineeringPost }

declare const data: EngineeringPost[]
export { data }

export default createEngineeringLoader()
