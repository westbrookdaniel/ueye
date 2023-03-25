import fs from 'fs'
import path from 'path'
import { Command } from 'commander'
import { processImageData } from './proccessImageData'

async function generateReactCode(imagePath: string, componentMapPath: string) {
  try {
    // Load the component map from the specified file path
    const componentMap = require(path.resolve(componentMapPath)).default

    // Process the image data and generate React code
    const reactCode = await processImageData(imagePath, componentMap)

    // Print the generated React code to the console
    console.log(reactCode)
  } catch (err) {
    console.error(
      `Error: ${err instanceof Error ? err.message : JSON.stringify(err)}`
    )
  }
}

const program = new Command()

program
  .name('ueye')
  .description('A CLI tool to generate React code from website images.')
  .argument('<imagePath>', 'Path to the image file')
  .argument('<componentMapPath>', 'Path to the component map file')
  .action((imagePath, componentMapPath) => {
    // Validate the image file exists
    if (!fs.existsSync(imagePath)) {
      console.error(`Error: Image file ${imagePath} not found.`)
      program.help()
      process.exit(1)
    }

    // Validate the component map file exists
    if (!fs.existsSync(componentMapPath)) {
      console.error(`Error: Component map file ${componentMapPath} not found.`)
      program.help()
      process.exit(1)
    }

    // Call the function to generate React code
    generateReactCode(imagePath, componentMapPath)
  })

program.parse(process.argv)
