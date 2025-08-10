import { Outlet, Link } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

function App() {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100 font-sans text-gray-800">
      <header className="bg-white shadow-md">
        <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-gray-800">
            Rincian Biaya Kost Kiky
          </Link>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Link
                  to="/add"
                  className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
                >
                  Tambah Pengeluaran
                </Link>
                <span className="text-sm text-gray-600 hidden sm:block">{user.email}</span>
                <button
                  onClick={signOut}
                  className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
              >
                Login
              </Link>
            )}
          </div>
        </nav>
      </header>

      <main className="container mx-auto p-6">
        <Outlet />
      </main>
    </div>
  );
}

export default App;
