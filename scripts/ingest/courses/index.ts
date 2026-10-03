import type {CourseSeed} from './types'

// Each course lives in courses/<dir>.ts and exports `seed`.
export async function courseFromArgs(argv = process.argv.slice(2)): Promise<CourseSeed> {
  const dir = argv[0] ?? '6-0001'
  if (!/^[\w-]+$/.test(dir)) throw new Error(`Invalid course "${dir}"`)
  const {seed} = (await import(`./${dir}`)) as {seed: CourseSeed}
  if (!seed) throw new Error(`courses/${dir}.ts does not export a seed`)
  return seed
}
