export function resizeImageFile(file: File): Promise<File> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => {
      const canvas = document.createElement('canvas')
      const width = image.width
      const height = image.height
      const targetWidth = 800
      const targetHeight = 600
      const scale = Math.min(targetWidth / width, targetHeight / height)
      const canvasWidth = width * scale
      const canvasHeight = height * scale
      canvas.width = canvasWidth
      canvas.height = canvasHeight
      const context = canvas.getContext('2d')
      if (!context) {
        reject(new Error('Failed to get canvas context'))
        return
      }
      context.drawImage(image, 0, 0, canvasWidth, canvasHeight)
      const imageData = context.getImageData(0, 0, canvasWidth, canvasHeight)
      canvas.width = targetWidth
      canvas.height = targetHeight
      const newContext = canvas.getContext('2d')
      newContext.putImageData(imageData, 0, 0)
      canvas.toBlob((blob) => {
        const resultFile = new File([blob], file.name, { type: file.type })
        resolve(resultFile)
      }, file.type)
    }
    image.onerror = (event) => {
      reject(event)
    }
    image.src = URL.createObjectURL(file)
  })
}
