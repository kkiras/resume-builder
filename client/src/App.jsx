import './styles/components.css'
import ResumeEditor from './components/cv-edit/ResumeEditor'
import Login from './components/login/Login'
import ResetPassword from './components/login/ResetPassword'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import DashBoard from './components/dashboard/DashBoard'
import Resumes from './components/dashboard/resumes/Resumes'
import ResumeCompare from './components/cv-compare/ResumeCompare'
import SharedItem from './components/cv-share/SharedItem'
import Profile from './components/dashboard/profile/Profile'

function App() {

  return (
    <Router>

      <Routes>
        <Route path="/shared" element={<SharedItem />} /> 
        <Route path="/login" element={<Login />} /> 
        <Route path="/reset-password" element={<ResetPassword />} /> 
        <Route path="/dashboard" element={<DashBoard />} >
          <Route path="resumes" element={<Resumes />} />
          <Route path="compare" element={<ResumeCompare />} />
          <Route path="profile" element={<Profile />} />
        </Route>
        <Route path="/edit" element={<ResumeEditor />} />
      </Routes>
    </Router>
  )
}

export default App
