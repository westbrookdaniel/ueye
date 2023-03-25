import React, { useEffect, useState } from 'react'

interface Annotation {
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

const initialAnnotation: Annotation = {
  fileName: '',
  width: 0,
  height: 0,
  annotations: [],
}

const imageSrc = 'https://picsum.photos/800/600'

function getPositionOnImage(
  event: React.MouseEvent<HTMLDivElement>,
  imageRef: React.RefObject<HTMLImageElement>
) {
  const { clientX, clientY } = event
  const { current } = imageRef
  if (!current) return { x: 0, y: 0 }
  const { left, top } = current.getBoundingClientRect()
  const x = Math.floor(clientX - left)
  const y = Math.floor(clientY - top)
  return { x, y }
}

export default function App() {
  const [annotation, setAnnotation] = useState<Annotation>(initialAnnotation)
  const [currentClass, setCurrentClass] = useState<string>('')
  const [isDrawing, setIsDrawing] = useState<boolean>(false)
  const imageRef = React.useRef<HTMLImageElement>(null)

  useEffect(() => {
    console.log(annotation)
  }, [annotation])

  const handleImageLoad = (event: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = event.currentTarget
    setAnnotation({ ...annotation, width, height })
  }

  const handleMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    if (currentClass === '') return
    setIsDrawing(true)

    const { x: startX, y: startY } = getPositionOnImage(event, imageRef)
    const newAnnotation = {
      class: currentClass,
      xMin: startX,
      yMin: startY,
      xMax: startX,
      yMax: startY,
    }
    setAnnotation({
      ...annotation,
      annotations: [...annotation.annotations, newAnnotation],
    })
  }

  const handleMouseUp = () => {
    setIsDrawing(false)
  }

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (currentClass === '' || !isDrawing) return

    const { x: currentX, y: currentY } = getPositionOnImage(event, imageRef)
    const { annotations } = annotation
    const lastAnnotation = annotations[annotations.length - 1]
    const updatedAnnotation = {
      ...lastAnnotation,
      xMax: currentX,
      yMax: currentY,
    }
    setAnnotation({
      ...annotation,
      annotations: [...annotations.slice(0, -1), updatedAnnotation],
    })
  }

  const handleBoxDelete = (index: number) => {
    const { annotations } = annotation
    setAnnotation({
      ...annotation,
      annotations: [
        ...annotations.slice(0, index),
        ...annotations.slice(index + 1),
      ],
    })
  }

  const handleSubmit = (event: React.SyntheticEvent) => {
    event.preventDefault()
    console.log('Submit:', annotation)
    setAnnotation(initialAnnotation)
  }

  return (
    <div className="app">
      <h1>Image Annotator</h1>
      <div className="image-annotation-container">
        <div
          className="image-container"
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
        >
          <img
            ref={imageRef}
            src={imageSrc}
            alt="annotatable"
            onLoad={handleImageLoad}
          />
          {annotation.annotations.map((a, index) => (
            <div
              key={index}
              className="box"
              style={{
                top: a.yMin,
                left: a.xMin,
                width: a.xMax - a.xMin,
                height: a.yMax - a.yMin,
              }}
            >
              <div className="box-label">
                {index}: {a.class}
              </div>
            </div>
          ))}
        </div>
        <div className="annotation-form">
          <h2>Annotation Form</h2>
          <div className="form-group">
            <label htmlFor="class-input">Class:</label>
            <input
              type="text"
              id="class-input"
              value={currentClass}
              onChange={(event) => setCurrentClass(event.target.value)}
            />
          </div>
          <div className="form-actions">
            <button onClick={handleSubmit}>Submit</button>
          </div>

          <div className="current-annotation">
            <h3>Current Annotation</h3>
            {annotation.annotations.map((a, index) => (
              <div className="annotation-details" key={index}>
                <p>
                  {index}: {a.class}
                </p>
                <div>
                  <button
                    className="small-button"
                    onClick={() => handleBoxDelete(index)}
                  >
                    x
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
