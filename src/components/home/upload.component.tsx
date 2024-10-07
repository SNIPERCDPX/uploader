import { useEffect, useState } from 'react'
import { useDropzone } from 'react-dropzone'

import { miraiHistory, UploadCard } from './uploadcard.component'

import '../../assets/styles/home.css'
import '../../assets/styles/animate.css'
  ; (
    window as unknown as {
      uploadLimit: number
    }
  ).uploadLimit = 1024 * 1024 * 100

export const Upload = () => {
  const [processCard, setProcessCard] = useState([] as File[])
  const local = localStorage.getItem('sniper_up.history')
  const [finishedCard, setFinishedCard] = useState([])

  const onUploadFile = (files: File[]) => {
    setProcessCard([...processCard, ...files])
    console.log(files, processCard)
  }
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDropAccepted(files) {
      console.log('Accepted files:', files)
      onUploadFile(files.map((f) => f).slice(0, 10))
    },
  })
  useEffect(() => {
    if (!local) {
      localStorage.setItem('sniper_up.history', JSON.stringify([]))
    }
    setFinishedCard(JSON.parse(local || JSON.stringify([])).reverse())
  }, [])

  return (
    <>
      <main>
        <div
          {...getRootProps()}
          className={`${isDragActive ? 'z-50 opacity-100' : 'z-30 opacity-0'} fixed flex h-screen w-screen items-center justify-center bg-black bg-opacity-80 duration-200`}
        >
          <h1 className='text-3xl font-bold text-white md:text-6xl'>Drag here to upload</h1>
          <input
            {...getInputProps()}
            type='file'
            title='Click to pick and upload'
            className='absolute h-full w-full opacity-0'
          />
        </div>
        <div className='absolute top-0 w-full p-6 text-white'>
          <div className='w-fit text-6xl font-bold italic'>
            UPLOAD.SNIPER.TECH
          </div>
          <div className='p-4 text-lg'>
            <p className='mb-2'>
              <span className='hidden md:inline'>Drag 'and drop or click</span>
              <span className='inline md:hidden'>Touch</span> anywhere to upload
            </p>
            <p>Up to 100MiB allowed</p>
            <p>
              If you want to spectate project or use in app, please contact _StarChaser to use project key
            </p>
            <p>
              And how to use with api endpoint
            </p>
            <p className='uppercase text-red-500 font-bold text-xl'>
              This upload page for use in test and wordpress embed only
            </p>
          </div>
          <div className='px-4 py-2'>
            {(finishedCard && finishedCard?.length > 0) ||
              (processCard && processCard?.length > 0 && 'History')}
          </div>
          <div className='hidden'>
            Pending: {processCard.length} | Local: {finishedCard.length}
          </div>
          <div className='grid grid-cols-[repeat(auto-fill,minmax(16rem,1fr))] gap-3 p-2'>
            {processCard.map((data, i) => (
              <UploadCard
                key={`process_${i}`}
                file={data}
                preData={null}
                isUploaded={false}
                index={i + 1}
              />
            ))}
            {finishedCard.map((data: miraiHistory, i: number) => (
              <UploadCard key={`finished_${i}`} file={null} preData={data} isUploaded={true} />
            ))}
          </div>
        </div>
      </main>
    </>
  )
}
