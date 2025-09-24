import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={
            <div className="flex items-center justify-center h-screen">
              <h1 className="text-4xl font-bold text-gray-900">
                Welcome to Self As System
              </h1>
            </div>
          } />
        </Routes>
      </div>
    </Router>
  )
}

export default App