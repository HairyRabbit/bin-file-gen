import yargs from 'yargs'
import gen from './'

export default function main() {
  const args = yargs
    .strict()
    .usage(`$0 [options]`, `Generate bin file`)
    .option(`output`, {
      alias: `o`,
      type: `string`,
      describe: `Output file path, ignore when package.json has "bin" field`
    })
    .option(`project`, {
      alias: `p`,
      type: `string`,
      describe: `Project path, used for compute script path`
    })
    .option(`dryrun`, {
      type: `boolean`,
      describe: `Dryrun`
    })
    .option(`silent`, {
      type: `boolean`,
      alias: `q`,
      describe: `Keep slient, not print any info to stdout`,
      default: false
    })
    .option(`yes`, {
      type: `boolean`,
      alias: `y`,
      describe: `Skip Y/n questions`
    })
    .help()
    .alias('help', 'h')
    .argv

  gen(args)
}
