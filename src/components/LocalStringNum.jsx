import NoSSR from '@mpth/react-no-ssr'

export default function LocalStringNum({ value }) {
  return <NoSSR>{value.toLocaleString()}</NoSSR>
}
