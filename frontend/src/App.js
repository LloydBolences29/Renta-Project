
import {createBrowserRouter, 
        createRoutesFromElements, 
        Route, 
        RouterProvider} 
        from "react-router-dom"
import HomeLayout from '../src/layout/homeLayout'
import HomeLandingPage from "./layout/homeLandingPage";
import './App.css';
import SignupLanding from "./layout/signupLayout";
//import Dashboard from "./DashboardPages/dashboard";
import TenantsPage from './DashboardPages/demoTenants'
import ProtectedRoute from "./Context/protectedRoute";
import {UserProvider} from "./Context/useUserContext";
import AdminPage from './DashboardPages/adminPage'
import Payrent from './DashboardPages/payrent'

import  DashboardLayout  from "./layout/dashboardLayout";
import DashboardPage from "./DashboardPages/dashboard";
import UnitsPage from "./DashboardPages/unit";
//import MaintenanceRequestsPage from "./DashboardPages/maintenance";
import PetRegistrationPage from "./DashboardPages/pets";
import ReportsPage from "./DashboardPages/report";
import MaintenanceRequestForm from './DashboardPages/maintenanceForm';
import ResetPassword from "./pages/resetPassword";
import Availroom from "./pages/availRoom";
import MaintenanceReports from "./DashboardPages/maintenanceReport";
import PetReports from "./DashboardPages/petReports";
import Home from "./DashboardPages/Home";
import AdminCalendar from "./DashboardPages/adminCalendar";
import VirtualTour from "./DashboardPages/virtualTour";
import  VirtualLayoutPage  from "./layout/virtualLayout";
import  AvailLayoutPage from "./layout/availUnitLayout";
import  TermAndConditionPage from "./layout/termAndConditionLAyout";
import Statement from "./DashboardPages/Statement";
import Notification from "./DashboardPages/notification";
import Profile from "./DashboardPages/profile";










const router = createBrowserRouter(
  createRoutesFromElements(
  <Route path='/' element={<HomeLayout />}> 
      <Route index element={<HomeLandingPage />} />
      <Route path='/signup' element={<SignupLanding />} />
      <Route path='/reset-password' element={<ResetPassword />} />
      {/* <Route path='/avail-room' element={<Availroom />} /> */}

      <Route
        path="/termAndCondition"
        element={
              <TermAndConditionPage />
        }
      />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <DashboardPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/tenants"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <TenantsPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

        <Route
        path="/statement"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Statement />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Profile />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

        
      <Route
        path="/home"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Home />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

        <Route
        path="/pay"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Payrent />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/units"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <UnitsPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/maintenance"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <MaintenanceRequestForm />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/pets"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <PetRegistrationPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <ReportsPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/maintenanceReports"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <MaintenanceReports />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/petReports"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <PetReports />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/adminCalendar"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <AdminCalendar />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/virtualTour"
        element={
          <VirtualLayoutPage />

        }
      />

      <Route
        path="/available-unit"
        element={
          <AvailLayoutPage />

        }
      />
      
      
      <Route
        path="/admin"
        element={
          <ProtectedRoute>            
              <DashboardLayout>
                <AdminPage />
              </DashboardLayout>
          </ProtectedRoute>
        }
      />
    </Route>



  )
);


function App() {
  return (
    <>

      <RouterProvider router={router} />

    </>
  )
}

export default App;
 
