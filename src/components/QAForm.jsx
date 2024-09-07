import { useEffect, useState } from 'react'
import { XMarkIcon, PlusIcon, BookOpenIcon } from '@heroicons/react/24/outline'

const placeholders = [
  {
    question: 'How do I cancel my subscription?',
    answer: 'Rub your tummy, pat your head, and chant “I’m not a customer anymore” three times.',
  },
  {
    question: 'Can we expect more features?',
    answer: 'In life it’s really better to never expect anything at all.',
  },
  {
    question: 'Will using your product make me more attractive?',
    answer:
      'Our product will definitely make you more attractive to people who value a person with excellent taste in tech.',
  },
  {
    question: 'Why do you need access to my camera?',
    answer: "We don't really, but sometimes we get lonely and it's nice to see people.",
  },
  {
    question: 'Why is your interface so confusing?',
    answer:
      "It's a test. If you can navigate our software, you can navigate any labyrinth of tax legislation.",
  },
  {
    question: 'Why do I get so many emails from you?',
    answer: 'Honestly, we just love to talk. You should see our group chats.',
  },
  {
    question: 'How do you generate reports?',
    answer: 'We get our kids to draw beautiful charts for you using only the finest crayons.',
  },
  {
    question: 'Do you handle sales tax?',
    answer: 'Well no, but if you move your company offshore you can probably ignore it.',
  },
  {
    question: 'How do I apply for a job?',
    answer:
      'We only hire our customers, so subscribe for a minimum of 100 years and then let’s talk.',
  },
  {
    question: 'Your product sounds horrible but why do I still feel compelled to purchase?',
    answer:
      'This is the power of excellent visual design. You just can’t resist it, no matter how poorly it actually functions.',
  },
  {
    question: 'What happens if your site goes down?',
    answer: 'We suggest you have a quick panic attack and then call your therapist.',
  },
  {
    question: 'I lost my password, how do I get into my account?',
    answer:
      'Send us an email and we will send you a copy of our latest password spreadsheet so you can find your information.',
  },
  {
    question: 'I heard that you got hacked. Is my data safe?',
    answer: "We assure you, your data is now somewhere safe. We don't know where, but it's safe.",
  },
  {
    question: 'How do I get a refund?',
    answer:
      'We don’t do refunds, but we do offer a 10% discount on your next purchase if you promise to never ask for a refund again.',
  },
  {
    question: 'How do I contact support?',
    answer:
      'Email our support team and if you’re lucky someone will get back to you within a year.',
  },
  {
    question: 'Do I need to upgrade?',
    answer: 'You really should, we add new bugs in every update.',
  },
]

export default function QAForm({ setQuestions, questions, hideAdd }) {
  const addQuestion = () => {
    setQuestions((questions) => {
      const newQuestions = [...questions]
      newQuestions.push({ question: '', answer: '' })
      return newQuestions
    })
  }

  const removeQuestion = (index) => {
    setQuestions((questions) => {
      const newQuestions = [...questions]
      // make sure they can't remove the last question
      if (newQuestions.length > 1) {
        newQuestions.splice(index, 1)
      }
      return newQuestions
    })
  }

  const updateQuestion = (index, question) => {
    setQuestions((questions) => {
      const newQuestions = [...questions]
      newQuestions[index].question = question
      return newQuestions
    })
  }

  const updateAnswer = (index, answer) => {
    setQuestions((questions) => {
      const newQuestions = [...questions]
      newQuestions[index].answer = answer
      return newQuestions
    })
  }

  const QuestionPrompt = ({ index }) => {
    const [question, setQuestion] = useState(questions[index].question)
    const [answer, setAnswer] = useState(questions[index].answer)
    const [isModified, setIsModified] = useState(false)

    useEffect(() => {
      setQuestion(questions[index].question)
      setAnswer(questions[index].answer)
    }, [questions])

    function getPlaceholder(index) {
      const objectIndex = index % placeholders.length
      return placeholders[objectIndex]
    }

    return (
      <>
        {index > 0 && (
          <div className="relative mx-auto mb-2 mt-6 w-2/3">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-2 text-gray-400">
                <BookOpenIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </span>
            </div>
          </div>
        )}
        <div className="relative mb-2 flex items-start">
          <div className="w-full text-sm">
            <div>
              <label className="block text-sm font-medium text-gray-700">Question</label>
              <input
                type="text"
                value={question}
                autoComplete="off"
                onChange={(e) => {
                  if (e.target.value !== question) {
                    setQuestion(e.target.value)
                    setIsModified(true)
                  }
                }}
                onBlur={(e) => {
                  if (isModified) {
                    updateQuestion(index, e.target.value)
                  }
                }}
                tabIndex={(index * 2 + 1).toString()}
                placeholder={getPlaceholder(index).question}
                className="block w-full rounded-md border-gray-300 placeholder-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500 sm:text-sm"
              />
            </div>
            <div className="mt-2">
              <label className="block text-sm font-medium text-gray-700">Answer</label>
              <textarea
                type="text"
                value={answer}
                autoComplete="off"
                onChange={(e) => {
                  if (e.target.value !== answer) {
                    setAnswer(e.target.value)
                    setIsModified(true)
                  }
                }}
                onBlur={(e) => {
                  if (isModified) {
                    updateAnswer(index, e.target.value)
                  }
                }}
                tabIndex={(index * 2 + 2).toString()}
                placeholder={getPlaceholder(index).answer}
                className="block w-full rounded-md border-gray-300 placeholder-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500 sm:text-sm"
              />
            </div>
          </div>
          {!hideAdd && index > 0 && (
            <div className="absolute right-0 top-0">
              <button
                type="button"
                className="flex h-5 w-5 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={() => removeQuestion(index)}
              >
                <span className="sr-only">Remove question: {question}</span>
                <XMarkIcon className="h-5 w-5 text-gray-700" aria-hidden="true" />
              </button>
            </div>
          )}
        </div>
      </>
    )
  }

  return (
    <>
      {questions.map((question, index) => (
        <QuestionPrompt key={index} index={index} />
      ))}
      {!hideAdd && (
        <div className="relative mx-auto mt-4 w-2/3">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center">
            <button
              type="button"
              className="inline-flex items-center gap-x-1.5 rounded-full bg-white px-3 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
              onClick={() => addQuestion()}
            >
              <PlusIcon className="-ml-1 -mr-0.5 h-5 w-5 text-gray-400" aria-hidden="true" />
              Add
            </button>
          </div>
        </div>
      )}
    </>
  )
}
