import { useState } from 'react'
import ImageAnnotator from './ImageAnnotator'
import FileUpload from './FileUpload'
import { resizeImageFile } from './resizeImageFile'

export default function App() {
  const [image, setImage] = useState<File | null>(null)

  return (
    <div className="app">
      <h1>Image Annotator</h1>
      {image ? (
        <ImageAnnotator image={image} onSubmit={() => setImage(null)} />
      ) : (
        <FileUpload
          onFileUpload={async (originalImage) => {
            if (!originalImage) return
            const image = await resizeImageFile(originalImage)
            setImage(image)
          }}
        />
      )}
    </div>
  )
}
