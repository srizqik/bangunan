import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import './index.css'

import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeProvider'
import ProtectedRoute from './components/ProtectedRoute'

import App from './App.jsx'
import HomePage from './pages/HomePage.jsx'
import AddExpensePage from './pages/AddExpensePage.jsx'
import EditExpensePage from './pages/EditExpensePage.jsx' // Import the new page
import LoginPage from './pages/LoginPage.jsx'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'add',
        element: (
          <ProtectedRoute>
            <AddExpensePage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'edit/:id', // Add the new dynamic route
        element: (
          <ProtectedRoute>
            <EditExpensePage />
          </ProtectedRoute>
        ),
      },
    ],
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>
)
