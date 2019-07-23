import path from 'path'
import readPkgUp from 'read-pkg-up'
import { generate, Options as GenerateOptions } from './generate'
import resolvePkgConfig from './resolvePkgConfig'
import resolveTsConfig from './resolveTsConfig'
import createBinFile, { BinFile } from './createBinFile'


type Options = {
  project: string
  silent: boolean
} & BinFile & GenerateOptions

const DEFAULT_OUTPUT: string = 'bin'
const DEFAULT_PROJECT: string = '.'
const DEFAULT_SCRIPT: string = 'cli'

function getOutputAndScript(project: string, output: string, script: string): [ string, string ] {
  const absoluteProjectPath: string = path.resolve(project)
  const absoluteFilePath: string = path.isAbsolute(output) ? output : path.resolve(absoluteProjectPath, output)
  const dir: string = path.dirname(absoluteFilePath)
  const relativePath: string = path.relative(dir, absoluteProjectPath)
  return [ dir, path.posix.join(relativePath, script) ]
}

async function main(options: Partial<Options & GenerateOptions> = {}): Promise<void> {
  const result = await readPkgUp({ normalize: true })
  if(undefined === result) throw makePackageJSONNotFoundError()
  const name = result.package.name
  const project: string = options.project || resolveTsConfig(DEFAULT_PROJECT)
  const file: string = options.file || DEFAULT_OUTPUT + '/' + name
  const [ output, script ]: [ string, string ] = getOutputAndScript(project, file, options.script || DEFAULT_SCRIPT)
  const { name: fileName, path: filePath }: NameResolveResult = resolvePkgConfig(result.package, output, project, { report: !options.silent })
  const binFile: BinFile = createBinFile(fileName, filePath, script)
  
  generate(binFile, {
    silent: options.silent,
    dryrun: options.dryrun
  })
}

export interface NameResolveResult {
  name: string
  path: string
}

function makePackageJSONNotFoundError(): Error {
  return new Error(`The package.json not found`)
}

export default main
