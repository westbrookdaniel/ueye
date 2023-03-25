import * as tf from '@tensorflow/tfjs-node'
import fs from 'fs/promises'

interface ImageAnnotation {
  fileName: string
  width: number
  height: number
  annotations: {
    class: string
    xMin: number
    yMin: number
    xMax: number
    yMax: number
  }[]
}

async function createDataset(
  imageAnnotations: ImageAnnotation[],
  imageDir: string
): Promise<tf.data.Dataset<{ xs: tf.Tensor; ys: tf.Tensor }>> {
  const imageTensors: tf.Tensor[] = []
  const labelTensors: tf.Tensor[] = []

  for (const imageAnnotation of imageAnnotations) {
    const imageData = await fs.readFile(
      `${imageDir}/${imageAnnotation.fileName}`
    )
    const image = tf.node.decodeImage(imageData)

    for (const annotation of imageAnnotation.annotations) {
      const xMin = annotation.xMin / imageAnnotation.width
      const yMin = annotation.yMin / imageAnnotation.height
      const xMax = annotation.xMax / imageAnnotation.width
      const yMax = annotation.yMax / imageAnnotation.height

      imageTensors.push(image)
      labelTensors.push(tf.tensor1d([xMin, yMin, xMax, yMax]))
    }
  }

  return tf.data.zip({
    xs: tf.data.array(imageTensors),
    ys: tf.data.array(labelTensors),
  })
}

function getNumberOfClasses(imageAnnotations: ImageAnnotation[]): number {
  const classes = new Set<string>()
  for (const imageAnnotation of imageAnnotations) {
    for (const annotation of imageAnnotation.annotations) {
      classes.add(annotation.class)
    }
  }
  return classes.size
}

async function createModel(numClasses: number): Promise<tf.LayersModel> {
  const baseModel = await tf.loadLayersModel(
    'https://tfhub.dev/tensorflow/efficientdet/d7/1',
    { fromTFHub: true }
  )
  const layers = baseModel.layers.slice(0, -10)
  const output = tf.layers
    .dense({
      units: numClasses * 4,
      kernelInitializer: 'glorotUniform',
      activation: 'sigmoid',
    })
    .apply(layers[layers.length - 1].output) as tf.SymbolicTensor

  const model = tf.model({
    inputs: baseModel.inputs,
    outputs: output,
  })

  return model
}

async function trainModel(
  model: tf.LayersModel,
  dataset: tf.data.Dataset<{ xs: tf.Tensor; ys: tf.Tensor }>
) {
  model.compile({
    optimizer: tf.train.adam(),
    loss: tf.losses.sigmoidCrossEntropy,
    metrics: [tf.metrics.binaryAccuracy],
  })

  await model.fitDataset(dataset.batch(32), {
    epochs: 10,
    callbacks: tf.node.tensorBoard('./logs'),
  })

  await model.save('file://./model')
}

export async function createAndTrainModel(
  pathToAnnotations: string,
  pathToImages: string
) {
  const annotations = JSON.parse(await fs.readFile(pathToAnnotations, 'utf-8'))

  const dataset = await createDataset(annotations, pathToImages)
  const model = await createModel(getNumberOfClasses(annotations))

  await trainModel(model, dataset)
}

createAndTrainModel('./annotations.json', './images')
