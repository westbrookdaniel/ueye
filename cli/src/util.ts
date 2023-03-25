import * as tf from '@tensorflow/tfjs'

export function isTensor(obj: any): obj is tf.Tensor {
  return obj instanceof tf.Tensor
}

export function is2DArray(obj: any): obj is number[][] {
  if (!Array.isArray(obj)) {
    return false
  }
  return obj.every(
    (elem) =>
      Array.isArray(elem) && elem.every((num) => typeof num === 'number')
  )
}
export function isComponentMap(obj: any): obj is Record<string, string> {
  if (typeof obj !== 'object' || obj === null) {
    return false
  }
  return Object.values(obj).every((val) => typeof val === 'string')
}
