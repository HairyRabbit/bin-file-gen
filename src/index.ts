import fs from 'fs'
import path from 'path'
import readPkgUp from 'read-pkg-up'
import { Package } from 'normalize-package-data'
import { generate, Options as GenerateOptions } from './generate'

interface Options {
  name: string
  output: string
  project: string
  entry: string
}

const DEFAULT_OUTPUT: string = 'bin'
const DEFAULT_PROJECT: string = '.'
const DEFAULT_ENTRY: string = 'cli'

function makeDefaultOptions(options: Partial<Options>, pkg: Package, root: string): Options {
  const rootDir: string = path.dirname(root)
  const project: string = options.project || guessProject(rootDir, DEFAULT_PROJECT)
  return {
    ...options,
    name: options.name || pkg.name,
    project,
    output: options.output || path.join(project, DEFAULT_OUTPUT),
    entry: DEFAULT_ENTRY
  }
}

function guessProject(root: string, defaultValue: string): string {
  const list: string[] = fs.readdirSync(root)
  const tsConfigPath = list.find(name => name.startsWith(`tsconfig`))
  if(tsConfigPath) {
    const configPath = path.resolve(root, tsConfigPath)
    const content = fs.readFileSync(configPath, 'utf-8')
    const ma = content.match(/"outDir":\s*"([^"]+)"/)
    if(null === ma) return defaultValue
    return ma[1] || defaultValue
  } else {
    return defaultValue
  }
}

async function main(options: Partial<Options & GenerateOptions> = {}): Promise<void> {
  const result = await readPkgUp({ normalize: true })
  if(undefined === result) throw makePackageJSONNotFoundError()
  const { name, entry, output, project } = makeDefaultOptions(options, result.package, result.path)
  const absoluteProjectPath: string = path.resolve(project)
  const absoluteOutputPath: string = path.resolve(output)
  const relativePath: string = path.relative(absoluteOutputPath, absoluteProjectPath)
  const entryPath: string = path.isAbsolute(entry) ? entry : path.posix.join(relativePath, entry)
  const fileOptions: NameResolveResult = getFileOptions(result.package, name, output, entryPath)
  generate(makeGenerateOptions(fileOptions, entryPath, options))
}

function makeGenerateOptions(fileOptions: NameResolveResult, entry: string, options: Partial<Options & GenerateOptions>): Partial<GenerateOptions> {
  return {
    ...options,
    entry,
    output: fileOptions.path
  }
}

export interface NameResolveResult {
  name: string
  path: string
}

function getFileOptions(pkg: Package, name: string, output: string, entry: string, shouldReport: boolean = false): NameResolveResult {
  const { bin } = pkg
  const outputPath: string = path.resolve(output, name)

  if(`string` === typeof bin) {
    return {
      name,
      path: bin
    }
  } else if(undefined === bin) {
    if(shouldReport) reportWarning(name, entry)
    return {
      name, 
      path: outputPath
    }
  } else {
    const keys = Object.keys(bin)

    switch(keys.length) {
      case 0: {
        if(shouldReport) reportWarning(name, entry)
        return { 
          name, 
          path: outputPath
        }
      }
      case 1: {
        const binName: string = keys[0]
        const binPath: string = bin[binName].trim()

        return {
          name: binName,
          path: '' === binPath.trim() ? outputPath : binPath
        }

      }
      default: throw makeMultiBinSupportsError()
    }
  }
}

function reportWarning(name: string, entry: string) {
  console.warn(`\
[binit] Warning: would you forget to add "bin" field to package.json ?
Looks like you need add this field like this:

{
  "bin": {
    "${name}": "${entry}"
  }
}

or short for:

{
  "bin": "${entry}"
}
`)
}

function makePackageJSONNotFoundError(): Error {
  return new Error(`The package.json not found`)
}

function makeMultiBinSupportsError(): Error {
  return new Error(`Multi bin files not supports`)
}

export default main
