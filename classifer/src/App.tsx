import { useState } from 'react'
import ImageAnnotator from './ImageAnnotator'
import FileUpload from './FileUpload'
import { resizeImageFile } from './resizeImageFile'

export interface Annotation {
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

interface Image {
  id: number
  file: File
  annotation: Annotation | null
  error: string | null
}

export default function App() {
  const [images, setImages] = useState<Image[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const handleStart = async () => {
    setIsLoading(true)
    // Save all resized images
    // check if showDirectoryPicker exists otherwise throw with ts check
    if (
      !('showDirectoryPicker' in window) ||
      typeof window.showDirectoryPicker !== 'function'
    ) {
      throw new Error('showDirectoryPicker not supported')
    }
    const outputDirectory: FileSystemDirectoryHandle =
      await window.showDirectoryPicker({ mode: 'readwrite' })

    for (const image of images) {
      if (image.annotation) {
        // TODO: This write isn't working
        const outputFileHandle = await outputDirectory.getFileHandle(
          image.file.name,
          { create: true }
        )
        if (
          !('createWritable' in outputFileHandle) ||
          typeof outputFileHandle.createWritable !== 'function'
        ) {
          throw new Error('createWritable not supported')
        }
        const writable = await outputFileHandle.createWritable()
        await writable.write(image.file)
        await writable.close()
      }
    }
    setIsLoading(false)
  }

  const currentImage = images.find((image) => image.annotation === null)

  // TODO: If you have images and they're all anottated, show a message and write all the annotations to a file

  return (
    <div className="app">
      <h1>Image Annotator</h1>
      {currentImage ? (
        <ImageAnnotator
          image={currentImage.file}
          onSubmit={(annotation) => {
            setImages((prevImages) => {
              const index = prevImages.findIndex(
                (prevImage) => prevImage.id === currentImage.id
              )
              const newImages = [...prevImages]
              newImages[index] = { ...currentImage, annotation }
              return newImages
            })
          }}
        />
      ) : (
        <div className="setup-container">
          <FileUpload
            label="Select source images"
            onFileUpload={async (originalImages) => {
              if (!originalImages) return
              const images = await Promise.all(
                originalImages.map((originalImage) =>
                  resizeImageFile(originalImage)
                )
              )
              setImages(
                // Use the index as an id
                images.map((file, id) => ({
                  id,
                  file,
                  annotation: null,
                  error: null,
                }))
              )

              // TODO: Write the annotation to a file as they are created (in case they exit early)
            }}
            fileInputProps={{ multiple: true }}
          />

          {images.length > 0 && (
            <>
              <h2>Seleted Images</h2>
              {images.map((image) => (
                <div className="annotation-details" key={image.id}>
                  <img
                    src={URL.createObjectURL(image.file)}
                    width="50"
                    height="50"
                  />
                  <p>({image.annotation ? 'y' : 'n'})</p>
                  <p>{image.file.name}</p>
                </div>
              ))}

              {isLoading ? (
                <p>Preparing images...</p>
              ) : (
                <button onClick={handleStart}>Select Output and Start</button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
