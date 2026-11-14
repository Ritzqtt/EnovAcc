import { useState } from 'react'
import Hero from './components/Hero'
import LoadingScreen from './components/LoadingScreen'

function App() {
  const [loading, setLoading] = useState(true)
  const [entering, setEntering] = useState(false)

  return (
    <>
      <Hero entering={entering} />
      {loading ? (
        <LoadingScreen
          onReveal={() => setEntering(true)}
          onDone={() => setLoading(false)}
        />
      ) : null}
    </>
  )
}

export default App
