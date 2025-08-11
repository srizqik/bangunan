import { Outlet, Link } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { ThemeToggle } from './components/ThemeToggle';
import { Button } from './components/ui/button';
import { Toaster } from "@/components/ui/sonner";
import BottomNav from './components/BottomNav';

function App() {
  const { user, signOut } = useAuth();

  return (
    <>
      <div className="min-h-screen bg-background font-sans text-foreground">
        {/* Desktop Header */}
        <header className="hidden md:flex bg-card shadow-sm border-b sticky top-0 z-40">
          <nav className="container mx-auto px-6 py-3 flex justify-between items-center">
            <Link to="/" className="text-xl font-bold">
              Rincian Biaya Kost Kiky
            </Link>

            <div className="flex items-center gap-4">
              {user ? (
                <>
                  <Button asChild>
                    <Link to="/add">Tambah Pengeluaran</Link>
                  </Button>
                  <span className="text-sm text-muted-foreground">{user.email}</span>
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

        {/* Mobile Header */}
        <header className="md:hidden bg-card shadow-sm border-b sticky top-0 z-40">
          <div className="container mx-auto px-4 h-16 flex justify-between items-center">
            <Link to="/" className="text-lg font-bold">
              Rincian Biaya Kost Kiky
            </Link>
            <ThemeToggle />
          </div>
        </header>

        <main className="container mx-auto p-4 md:p-6 pb-24 md:pb-6">
          <Outlet />
        </main>

        {/* Mobile Bottom Navigation */}
        <BottomNav />
      </div>
      <Toaster richColors />
    </>
  );
}

export default App;
