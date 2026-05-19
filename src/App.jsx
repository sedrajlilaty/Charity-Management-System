import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Suspense, lazy } from 'react'

import DashboardLayout from './ui/DashboardLayout'
import { SpinnerPage }  from './ui/Spinner'
import { useAuth }      from './context/AuthContext'
import AIPage from './features/ai/AIPage'


const Dashboard     = lazy(() => import('./features/dashboard/Dashboard'))
const Donations     = lazy(() => import('./features/donations/Donations'))
const Beneficiaries = lazy(() => import('./features/beneficiaries/Beneficiaries'))
const Campaigns     = lazy(() => import('./features/campaigns/Campaigns'))
const Services      = lazy(() => import('./features/services/Services'))
const Users         = lazy(() => import('./features/users/Users'))
const Notifications = lazy(() => import('./features/notifications/Notifications'))
const Settings      = lazy(() => import('./features/settings/Settings'))
const Login         = lazy(() => import('./features/auth/Login'))
const NotFound      = lazy(() => import('./features/auth/NotFound'))
const Volunteers      = lazy(() => import('./features/volunteers/Volunteers'))
function ProtectedRoute({ children }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  return children
}


function PublicRoute({ children }) {
  const { user } = useAuth()
  if (user) return <Navigate to="/" replace />
  return children
}

export default function App() {
  return (
    <BrowserRouter>
      
      <Suspense fallback={<SpinnerPage />}>
        <Routes>

        
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />

      
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            
            <Route index          element={<Dashboard />}     />
            <Route path="donations"      element={<Donations />}     />
            <Route path="beneficiaries"  element={<Beneficiaries />} />
            <Route path="campaigns"      element={<Campaigns />}     />
            <Route path="services"       element={<Services />}      />
            <Route path="users"          element={<Users />}         />
            <Route path="notifications"  element={<Notifications />} />
            <Route path="settings"       element={<Settings />}      />
            <Route path="volunteers" element={<Volunteers />} />
           <Route path="ai-assistant" element={<AIPage />} />
          </Route>

        
          <Route path="*" element={<NotFound />} />

        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

