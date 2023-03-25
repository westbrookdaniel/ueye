import * as tf from '@tensorflow/tfjs-node-gpu'
import Jimp from 'jimp'
import { is2DArray, isComponentMap, isTensor } from './util'

export async function processImageData(
  imagePath: string,
  componentMap: any
): Promise<string> {
  /**
   * TODO: Label and train model from dataset https://www.kaggle.com/datasets/aydosphd/webscreenshots
   *
   * - Collect a dataset: Collect a dataset of images and label them with bounding boxes around
   *   the objects you want to detect. There are various tools available to annotate images,
   *   such as LabelImg, RectLabel, and VGG Image Annotator.
   *
   * - Prepare the dataset: Convert the annotated images to the format required by TensorFlow
   *   Object Detection API. The recommended format is the TFRecord format.
   *
   * - Choose a pre-trained model: Choose a pre-trained model that is suitable for your use case.
   *   TensorFlow Object Detection API provides several pre-trained models with varying performance
   *   and speed trade-offs. You can choose a model from the Model Zoo, which includes models
   *   trained on the COCO dataset, or train a model from scratch.
   *
   * - Fine-tune the model: Fine-tune the pre-trained model on your dataset using transfer learning.
   *   During the fine-tuning process, the weights of the pre-trained model are updated to improve
   *   the accuracy of the model on your dataset.
   *
   * - Evaluate the model: Evaluate the performance of the fine-tuned model on a validation dataset.
   *   Use metrics such as mean average precision (mAP) to measure the performance of the model.
   *
   * - Export the model: Export the fine-tuned model in the format required by your application.
   */

  // Define model path and load model
  const modelPath = 'path/to/model'
  const model = await tf.loadGraphModel(`file://${modelPath}`)

  // Define input size and box threshold
  const inputSize = 224
  const boxThreshold = 0.5

  // Load the image data using Jimp
  const imageData = await Jimp.read(imagePath)
  // Resize image to input size
  const resizedImage = imageData.resize(inputSize, inputSize)
  // Turn it into bitmap for the model
  const bitmap = resizedImage.bitmap

  // Convert image to tensor and normalize pixel values
  const imageTensor = tf.node.decodeImage(bitmap.data, 3).div(tf.scalar(255))

  // Add a batch dimension to the tensor
  const batchedTensor = imageTensor.expandDims(0)

  // Get predictions from the model
  const predictions = await model.predictAsync(batchedTensor)

  // Check if the predictions are a tensor
  if (!isTensor(predictions)) {
    throw new Error('Model prediction did not return a tensor')
  }

  // Extract boxes and classes from predictions
  const [boxes, classes] = tf.tidy(() => {
    const boxesTensor = predictions.squeeze().slice([0, 0], [-1, 4])
    const classesTensor = predictions.squeeze().slice([0, 4], [-1, -1])
    return [boxesTensor, classesTensor]
  })

  // Convert tensors to arrays
  const boxesArray = await boxes.array()
  const classesArray = await classes.array()

  // Check if the predictions are a 2D array
  if (!is2DArray(classesArray) || !is2DArray(boxesArray)) {
    throw new Error('Model prediction did not return a 2D array')
  }

  // Filter boxes above threshold
  const filteredBoxes = []
  for (let i = 0; i < classesArray.length; i++) {
    if (classesArray[i][0] > boxThreshold) {
      filteredBoxes.push(boxesArray[i])
    }
  }

  // Check if the component map is the correct type
  if (!isComponentMap(componentMap)) {
    throw new Error('Component map is not of the type Record<string, string>')
  }

  // TODO: Have the model determine what type each box is and get the correct component from the component map
  // TODO: Do the react heirarchy detection and return the react components

  return JSON.stringify(filteredBoxes)
}
