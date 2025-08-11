import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, PlusSquare, User } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from './ui/button';

const BottomNav = () => {
  const { user, signOut } = useAuth();

  const navLinkClass = ({ isActive }) =>
    `flex flex-col items-center gap-1 px-2 py-1 text-xs ${
      isActive ? 'text-primary' : 'text-muted-foreground'
    }`;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t md:hidden z-50">
      <div className="flex justify-around items-center h-16">
        <NavLink to="/" className={navLinkClass}>
          <Home className="h-6 w-6" />
          <span>Beranda</span>
        </NavLink>

        {user && (
          <NavLink to="/add" className={navLinkClass}>
            <PlusSquare className="h-6 w-6" />
            <span>Tambah</span>
          </NavLink>
        )}

        {user ? (
          <button onClick={signOut} className="flex flex-col items-center gap-1 px-2 py-1 text-xs text-muted-foreground">
            <User className="h-6 w-6" />
            <span>Logout</span>
          </button>
        ) : (
          <NavLink to="/login" className={navLinkClass}>
            <User className="h-6 w-6" />
            <span>Login</span>
          </NavLink>
        )}
      </div>
    </nav>
  );
};

export default BottomNav;
