import path from 'path'
import readPkgUp from 'read-pkg-up'
import { generate, Options as GenerateOptions } from './generate'
import resolvePkgConfig from './resolvePkgConfig'
import resolveTsConfig from './resolveTsConfig'
import createBinFile, { BinFile } from './createBinFile'

type Options = {
  project: string
  silent: boolean
  output: string
} & BinFile & GenerateOptions

const DEFAULT_OUTPUT: string = 'bin'
const DEFAULT_PROJECT: string = '.'
const DEFAULT_SCRIPT: string = 'cli'

function getOutputAndScript(project: string, output: string, script: string): [ string, string ] {
  const absoluteProjectPath: string = path.resolve(project)
  const absoluteFilePath: string = path.isAbsolute(output) ? output : path.resolve(absoluteProjectPath, output)
  const dir: string = path.dirname(absoluteFilePath)
  const relativePath: string = path.relative(dir, absoluteProjectPath)
  return [ absoluteFilePath, path.join(relativePath, script).replace(/\\/g, '/') ]
}

async function main(options: Partial<Options> = {}): Promise<void> {
  const result = await readPkgUp({ normalize: true })
  if(undefined === result) throw makePackageJSONNotFoundError()
  const root = path.dirname(result.path)
  const name = getPackageName(result.package.name)
  const project: string = options.project || resolveTsConfig(root, DEFAULT_PROJECT)
  const file: string = options.output || DEFAULT_OUTPUT + '/' + name
  const [ output, script ]: [ string, string ] = getOutputAndScript(project, file, options.script || DEFAULT_SCRIPT)
  const { name: fileName, path: filePath }: NameResolveResult = resolvePkgConfig(result.package, output, project, { report: !options.silent })
  const binFile: BinFile = createBinFile(fileName, filePath, script)
  
  generate(binFile, {
    silent: options.silent,
    dryrun: options.dryrun
  })
}

function getPackageName(pkgName: string) {
  if(pkgName.startsWith(`@`)) return pkgName.split(`/`)[1]
  return pkgName
}

export interface NameResolveResult {
  name: string
  path: string
}

function makePackageJSONNotFoundError(): Error {
  return new Error(`The package.json not found`)
}

export default main
