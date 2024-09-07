import SyntaxHighlighter from 'react-syntax-highlighter'
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs'

export default function CodeBlock({ language, codeString }) {
  return (
    <SyntaxHighlighter language={language} style={docco}>
      {codeString}
    </SyntaxHighlighter>
  )
}