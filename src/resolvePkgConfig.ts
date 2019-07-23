import * as path from 'path'
import { Package } from 'normalize-package-data'

interface NameResolveResult {
  name: string
  path: string
}

interface ResolveOptions {
  report: boolean
}

const DEFAULT_RESOLVEOPTIONS: Readonly<Partial<ResolveOptions>> = {
  report: true
}

export default function resolvePKGConfig(pkg: Package, output: string, project: string, options: Readonly<Partial<ResolveOptions>> = {}): NameResolveResult {
  const opts = { ...DEFAULT_RESOLVEOPTIONS, ...options }
  const { report } = opts
  const { bin, name } = pkg
  const outputPath: string = path.resolve(output, name)

  if(undefined === bin) {
    if(report) reportWarning(name)
    return {
      name, 
      path: outputPath
    }
  } else if(`string` === typeof bin) {
    return {
      name,
      path: bin
    }
  } else {
    const keys: string[] = Object.keys(bin)

    switch(keys.length) {
      case 0: {
        if(report) reportWarning(name)
        return { 
          name,
          path: outputPath
        }
      }
      case 1: {
        const binDeclName: string = keys[0]
        const binPath: string = bin[binDeclName].trim()

        return {
          name: binDeclName,
          path: '' === binPath.trim() ? outputPath : path.isAbsolute(binPath) ? binPath : path.resolve(project, binPath)
        }

      }
      default: throw makeMultiBinSupportsError()
    }
  }
}

function reportWarning(name: string): void {
  console.warn(`\
[bin-file-gen] Warning: would you forget to add "bin" field to package.json ?
Looks like you need add this field like this:

{ "bin": { "${name}": "/path/to/your-bin-file" } }

or short for:

{ "bin": "/path/to/your-bin-file" }
`)
}

function makeMultiBinSupportsError(): Error {
  return new Error(`Multi bin files not supports`)
}
