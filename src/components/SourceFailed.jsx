import { useEffect, useState } from 'react'
import { sourceTypes } from '@/constants/sourceTypes.constants'
import { ArrowPathIcon } from '@heroicons/react/24/outline'
import Alert from '@/components/Alert'

export default function SourceFailed({ sources, deleteSource, retrySource }) {
  const [fullSources, setFullSources] = useState([])

  useEffect(() => {
    const newSources = []
    sources.map((source) => {
      source.icon = sourceArg(source.type, 'icon')
      source.name = sourceArg(source.type, 'title')
      if (source.status === 'failed' && ! source.refreshing) {
        console.log(source)
        newSources.push(source)
      }
    })
    setFullSources(newSources)
  }, [sources])

  const sourceArg = (type, arg) => {
    const sourceType = sourceTypes.find((sourceType) => sourceType.id === type)
    return sourceType[arg] || null
  }

  //if no sources, show empty state
  if (!fullSources || fullSources.length === 0) {
    return null
  }

  return (
    <div>
      <h2 className="mt-8 text-xl font-semibold text-gray-800">Indexing Errors</h2>

      {fullSources.map((source) => (
        <Alert key={source.id} type="warning" title={source.name + ": " + (source.error || 'Unknown error')} onClose={() => deleteSource(source.id)}>
            <div className="w-full flex-1 text-sm mb-2">
              <p className="truncate text-xs text-gray-600">{source.title}</p>
              <p className="truncate text-xs text-gray-500">{source.url}</p>
            </div>
            {source.warnsList?.length > 0 && (
              <>
                <h1 className="mt-6 text-sm font-medium text-gray-600 pb-2">Warnings:</h1>
                <div className="rounded-md bg-slate-100 border-solid border-2 border-slate-200">
                  <pre className="p-2 text-sm font-mono text-orange-600 whitespace-pre-wrap">
                      {source.warnsList.join('\n')}
                  </pre>
                </div>
              </>
            )}
            <button
              className="text-gray-400 hover:text-gray-600 focus:text-gray-500 flex items-center"
              type="button"
              onClick={(e) => {
                e.preventDefault()
                retrySource(source.id)
              }}
            >
              <ArrowPathIcon className="h-4 w-4 mr-1" aria-hidden="true" /> Retry
            </button>
        </Alert>
      ))}
    </div>
  )
}
