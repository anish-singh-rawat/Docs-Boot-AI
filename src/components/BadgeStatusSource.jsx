import LoadingSpinner from '@/components/LoadingSpinner'
/*
Possible status values from the API:
  starting: the prediction is starting up. If this status lasts longer than a few seconds, then it's typically because a new worker is being started to run the prediction.
  indexing: the predict() method of the bot is currently running.
  processing: Only for crawlers. Crawler is finished indexing and is now processing the data.
  ready: the prediction completed successfully.
  failed: the prediction encountered an error during processing.
*/

export default function BadgeStatusSource({ source, small = false }) {
  const sizeClass = small ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-0.5 text-sm'

  if (source.status === 'indexing') {
    return (
      <span
        className={
          sizeClass + ' inline-flex items-center rounded-full bg-blue-100 font-medium text-blue-800'
        }
      >
        <LoadingSpinner small={small} /> Indexing
      </span>
    )
  }

  if (source.status === 'processing') {
    return (
      <span
        className={
          sizeClass + ' inline-flex items-center rounded-full bg-indigo-100 font-medium text-indigo-800'
        }
      >
        <LoadingSpinner small={small} /> Processing
      </span>
    )
  }

  if (source.status === 'ready') {
    return (
      <span
        className={
          sizeClass +
          ' inline-flex items-center rounded-full bg-green-100 font-medium text-green-800'
        }
      >
        Indexed
      </span>
    )
  }

  if (source.status === 'failed') {
    return (
      <span
        className={
          sizeClass +
          ' inline-flex cursor-help items-center rounded-full bg-red-100 font-medium text-red-800'
        }
        title={source.error}
      >
        Failed
      </span>
    )
  }

  //queued or default
  return (
    <span
      className={
        sizeClass + ' inline-flex items-center rounded-full bg-gray-100 font-medium text-gray-800'
      }
    >
      Queued
    </span>
  )
}
