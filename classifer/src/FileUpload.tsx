import React, { useState } from 'react'

interface FileUploadProps {
  onFileUpload: (file: File | null) => void
}

const FileUpload = ({ onFileUpload }: FileUploadProps) => {
  const [dragging, setDragging] = useState(false)
  const [file, setFile] = useState<File | null>(null)

  const handleDragEnter = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setDragging(true)
  }

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setDragging(false)
  }

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
  }

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setDragging(false)
    const droppedFile = event.dataTransfer.files[0]
    setFile(droppedFile)
    onFileUpload(droppedFile)
  }

  const handleFileInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const selectedFile = event.target.files?.[0] ?? null
    setFile(selectedFile)
    onFileUpload(selectedFile)
  }

  return (
    <div
      className={`file-upload ${dragging ? 'dragging' : ''}`}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {file ? (
        <div>
          <p>Selected file:</p>
          <p>{file.name}</p>
        </div>
      ) : (
        <div>
          <p>Drag and drop a file or click to select a file</p>
          <input type="file" onChange={handleFileInputChange} />
        </div>
      )}
    </div>
  )
}

export default FileUpload
