import LoadingSpinner from '@/components/LoadingSpinner';
/*
Possible status values from the API:
  starting: the prediction is starting up. If this status lasts longer than a few seconds, then it's typically because a new worker is being started to run the prediction.
  processing: the predict() method of the bot is currently running.
  succeeded: the prediction completed successfully.
  failed: the prediction encountered an error during processing.
  canceled: the prediction was canceled by the user.
*/

export default function BadgeStatus({status, small = false}) {

  const sizeClass = small ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-0.5 text-sm';

  if (status === 'pending') {
    return (
      <span className={sizeClass + " inline-flex items-center rounded-full bg-yellow-100 font-medium text-yellow-800"}>
        Awaiting Sources
      </span>
    )
  }

  if (status === 'indexing') {
    return (
      <span className={sizeClass + " inline-flex items-center rounded-full bg-blue-100 font-medium text-blue-800"}>
        <LoadingSpinner small={small} /> Indexing
      </span>
    )
  }

  if (status === 'ready') {
    return (
      <span className={sizeClass + " inline-flex items-center rounded-full bg-green-100 font-medium text-green-800"}>
        Ready
      </span>
    )
  }

  //queued or default
  return (
    <span className={sizeClass + " inline-flex items-center rounded-full bg-gray-100 font-medium text-gray-800"}>
      Unknown
    </span>
  )

}