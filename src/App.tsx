import './App.css';
import { ToastContainer } from 'react-toastify';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MainForm } from './components/MainForm';
import { UserPortal } from './components/UserPortal';

function App() {
  return (
    <div>
      <BrowserRouter>
        <ToastContainer />
        <Routes>
          <Route path="/" element={<MainForm />} />
          <Route path="/userPortal" element={<UserPortal />} />
        </Routes>
      </BrowserRouter>  
    </div>
  )
}

export default App
