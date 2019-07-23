import * as path from 'path'

type TS = typeof import('typescript')

export default function resolveTsConfig(defaultValue: string): string {
  const ts: TS | null = tryToRequireTS()
  if(null === ts) return defaultValue
  const config = readConfig(ts)
  if(null === config) return defaultValue
  return config.options.outDir || defaultValue
}

function readConfig(ts: TS): ReturnType<typeof import('typescript').parseJsonConfigFileContent> | null {
  const configFilePath = ts.findConfigFile(process.cwd(), ts.sys.fileExists)
  if (undefined === configFilePath) return null
  const result = combineParentConfig(ts, configFilePath, readConfigContent(ts, configFilePath))
  return ts.parseJsonConfigFileContent(result, ts.sys, result.baseUrl || "./", undefined, configFilePath)
}

function readConfigContent(ts: TS, root: string): any {
  const { config, error } = ts.readConfigFile(root, content => ts.sys.readFile(content, "utf-8"))
  if (undefined !== error) throw makeConfigFileCanNotReadError(combineErrorMessageText(error.messageText).join("\n"))
  return config
}

function combineParentConfig(ts: TS, root: string, config: any): typeof config {
  if (!config.extends) return config
  const parentFilePath: string = path.resolve(root, config.extends)
  const parentConfig = readConfigContent(ts, parentFilePath)
  delete config.extends
  const combinedConfig = { ...parentConfig, ...config }
  return combineParentConfig(ts, parentFilePath, combinedConfig)
}

function combineErrorMessageText(msg: string | import('typescript').DiagnosticMessageChain): string[] {
  if ("string" === typeof msg) return [msg]
  let acc = []
  while (msg.next) acc.push(msg.messageText)
  return acc
}

function tryToRequireTS(): TS | null {
  try {
    return require('typescript')
  } catch(e) {
    // throw makeNoTypeScriptInstalledError()
    return null
  }
}

// function makeNoTypeScriptInstalledError(): Error {
//   return new Error(`The module "typescript" not required, do you forget to install it first?`)
// }

function makeConfigFileCanNotReadError(message: string): Error {
  return new Error(`config file read failed: \n${message}`)
}
