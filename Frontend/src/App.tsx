import './App.css';
import { ToastContainer } from 'react-toastify';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MainForm } from './components/MainForm';
import { UserPortal } from './components/UserPortal';
import { PasswordReset } from './components/PasswordReset';
import { ResetNewPassword } from './components/ResetNewPassword';

function App() {
  return (
    <div>
      <BrowserRouter>
        <ToastContainer />
        <Routes>
          <Route path="/" element={<MainForm />} />
          <Route path="/userPortal" element={<UserPortal />} />
          <Route path="/forgot-password" element={<PasswordReset />} />
          <Route path="/reset-password/:token" element={<ResetNewPassword />} />
        </Routes>
      </BrowserRouter>  
    </div>
  )
}

export default App
