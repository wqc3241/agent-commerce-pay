import { Toaster } from 'sonner'
import { AppShell } from '@/components/layout/AppShell'
import './App.css'

function App() {
  return (
    <>
      <AppShell />
      <Toaster
        position="top-right"
        theme="dark"
        toastOptions={{
          style: {
            background: '#18181b',
            border: '1px solid #3f3f46',
            color: '#fff',
          },
        }}
      />
    </>
  )
}

export default App
