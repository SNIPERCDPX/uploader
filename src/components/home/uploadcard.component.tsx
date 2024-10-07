import { useEffect, useState } from 'react'
import axios from 'axios'

import { humanFileSize } from '../../libs/utils'

export interface miraiHistory {
  name: string
  url: string
  size: number
  date: Date
}

export const UploadCard = ({
  index,
  file,
  isUploaded,
  preData,
}: {
  index?: number
  file: File | null
  isUploaded: boolean
  preData: miraiHistory | null
}) => {
  const [copyState, setCopyState] = useState(false)
  const [progress, setProgress] = useState(0)
  const [progressData, setProgressData] = useState('0/0')
  const [errorMessage, setErrorMessage] = useState('')
  const [isOK, setIsOK] = useState(isUploaded)
  const [showCompleteText, setShowCompleteText] = useState(false)
  const [displayData, setDisplayData] = useState<miraiHistory>(
    preData || {
      name: 'Unknown file name',
      url: '',
      size: 0,
      date: new Date(),
    }
  )
  let isUploading = false

  const UPLOAD_ENDPOINT = 'https://upload.sniper.tech/upload'
  useEffect(() => {
    if (!file || isUploaded || isUploading || isOK) return
    const LIMIT_SIZE = 1024 * 1024 * 100 // 100MB

    const uploadFile = async () => {
      if (file.size > LIMIT_SIZE) {
        setErrorMessage('File size exceeds the limit (100MB)')
        setProgress(100)
        return
      }
      const formData = new FormData()
      formData.append('token', 'DEFAULT')
      formData.append('file', file)

      try {
        isUploading = true
        const response = await axios.post(UPLOAD_ENDPOINT, formData, {
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / (progressEvent.total || 0)
            )
            setProgress(percentCompleted)
            setProgressData(
              `${humanFileSize(progressEvent.loaded)} / ${humanFileSize(progressEvent.total || 0)}`
            )
          },
        })

        const newHistory: miraiHistory = {
          name: file.name,
          url: response.data,
          size: file.size,
          date: new Date(),
        }

        isUploading = false
        setDisplayData(newHistory)
        setIsOK(true)
        setShowCompleteText(true)
        updateLocalStorage(newHistory)
      } catch (error: any) {
        setErrorMessage(error.response?.data?.message || 'Upload failed')
        setIsOK(false)
      }
    }

    uploadFile()
  }, [file, isUploaded, preData])

  const updateLocalStorage = (newData: miraiHistory) => {
    const history = JSON.parse(localStorage.getItem('sniper_up.history') || '[]')
    history.push(newData)
    localStorage.setItem('sniper_up.history', JSON.stringify(history))
  }
  let timer: NodeJS.Timeout
  const handleCopyClick = () => {
    navigator.clipboard.writeText(displayData.url).then(() => {
      clearInterval(timer)
      setCopyState(true)
      setTimeout(() => setCopyState(false), 1500)
    })
  }

  return (
    <div
      className={`relative cursor-pointer rounded border border-[#c5b78a]`}
      style={{
        order: index ? -999 - index : 0,
      }}
    >
      {showCompleteText && (
        <div className='upload-text fixed bottom-4 right-6 -z-10 text-6xl text-white opacity-0'>
          UPLOAD COMPLETE
        </div>
      )}
      {isOK && (
        <div
          onClick={() => {
            handleCopyClick()
          }}
          className={`border-2 ${
            copyState ? 'copy coped' : 'copy'
          } absolute z-30 flex h-full w-full items-center justify-center rounded bg-[#0c0a03] bg-opacity-80 text-center text-xl font-bold opacity-0 duration-200 hover:opacity-100 text-[${
            copyState ? '#cb9500' : '#0c0a03'
          }]`}
        >
          {copyState ? 'COPIED!' : 'CLICK TO COPY'}
        </div>
      )}
      <div
        style={{
          width: `${progress}%`,
          backgroundColor:
            progress < 100
              ? 'rgba(203, 149, 0, 0.3)'
              : errorMessage
                ? 'rgba(255, 0, 0, 0.3)'
                : !isOK
                  ? 'rgba(255, 255, 0, 0.3)'
                  : '',
        }}
        className='absolute -z-10 h-full bg-opacity-30 transition-all duration-200'
      />
      {isOK && displayData.name.match(/\.(jpeg|jpg|gif|png|svg)$/i) && (
        <img
          src={displayData.url}
          loading='lazy'
          className='aspect-video object-cover'
          alt='Preview Image'
        />
      )}
      <div
        className={`p-3 transition-all ${
          isOK && displayData.name.match(/\.(jpeg|jpg|gif|png|svg)$/i) && '!pt-2'
        }`}
      >
        <div className='w-full overflow-hidden text-ellipsis font-bold'>
          {isOK ? displayData.name : file?.name || displayData.name}
        </div>
        <div className='w-full overflow-hidden text-ellipsis text-xs'>
          {displayData.date.toLocaleString()}
        </div>
        <div
          className={`${
            errorMessage && 'font-bold text-red-500'
          } w-full overflow-hidden text-ellipsis text-xs`}
        >
          {isOK ? (
            humanFileSize(displayData.size)
          ) : errorMessage ? (
            errorMessage
          ) : (
            <span>
              {progressData} ({progress > 99 ? 'Processing...' : progress + '%'})
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
