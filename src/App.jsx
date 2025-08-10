import { Outlet, Link } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { ThemeToggle } from './components/ThemeToggle';
import { Button } from './components/ui/button';
import { Toaster } from "@/components/ui/sonner";

function App() {
  const { user, signOut } = useAuth();

  return (
    <>
      <div className="min-h-screen bg-background font-sans text-foreground">
        <header className="bg-card shadow-sm border-b">
          <nav className="container mx-auto px-6 py-3 flex justify-between items-center">
            <Link to="/" className="text-2xl font-bold">
              Rincian Biaya Kost Kiky
            </Link>

            <div className="flex items-center gap-4">
              {user ? (
                <>
                  <Button asChild>
                    <Link to="/add">Tambah Pengeluaran</Link>
                  </Button>
                  <span className="text-sm text-muted-foreground hidden sm:block">{user.email}</span>
                  <Button variant="outline" onClick={signOut}>
                    Logout
                  </Button>
                </>
              ) : (
                <Button asChild>
                  <Link to="/login">Login</Link>
                </Button>
              )}
              <ThemeToggle />
            </div>
          </nav>
        </header>

        <main className="container mx-auto p-6">
          <Outlet />
        </main>
      </div>
      <Toaster richColors />
    </>
  );
}

export default App;
