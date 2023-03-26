import React, { useState } from 'react'

interface FileUploadProps {
  onFileUpload: (file: File[] | null) => void
  /**
   * @default 'Drag and drop a file or click to select a file'
   */
  label?: string
  /**
   * @default 'Selected file:'
   */
  selectedLabel?: string
  fileInputProps?: any
}

const FileUpload = ({
  onFileUpload,
  label = 'Drag and drop a file or click to select a file',
  selectedLabel = 'Selected file:',
  fileInputProps,
}: FileUploadProps) => {
  const [dragging, setDragging] = useState(false)
  const [files, setFile] = useState<File[] | null>(null)

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
    const droppedFile = Array.from(event.dataTransfer.files, (f) => f)
    setFile(droppedFile)
    onFileUpload(droppedFile)
  }

  const handleFileInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const fileList = event.target.files
    const selectedFile = fileList ? Array.from(fileList, (f) => f) : null
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
      {files ? (
        <div>
          <p>{selectedLabel}</p>
          {files.map((file, i) => (
            <p key={i}>{file.name}</p>
          ))}
        </div>
      ) : (
        <div>
          <p>{label}</p>
          <input
            type="file"
            onChange={handleFileInputChange}
            {...fileInputProps}
          />
        </div>
      )}
    </div>
  )
}

export default FileUpload
