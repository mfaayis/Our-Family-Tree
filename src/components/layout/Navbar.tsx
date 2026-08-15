'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  TreePine,
  Search,
  GitBranch,
  Users,
  Image,
  Activity,
  LayoutDashboard,
  LogOut,
  User,
  Settings,
  Menu,
  X,
  Home,
  Bell,
} from 'lucide-react';
import { getInitials } from '@/lib/utils';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/tree', label: 'Family Tree', icon: TreePine },
  { href: '/search', label: 'Search', icon: Search },
  { href: '/my-branch', label: 'My Branch', icon: GitBranch },
  { href: '/people', label: 'People', icon: Users },
  { href: '/gallery', label: 'Gallery', icon: Image },
  { href: '/activity', label: 'Activity', icon: Activity },
];

export function Navbar() {
  const { user, userProfile, logout, isAdmin } = useAuth();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const displayName = userProfile?.displayName || user?.displayName || 'Family Member';

  if (!user) return null;

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/tree" className="flex items-center gap-2.5 font-bold text-stone-800 hover:text-amber-700 transition-colors">
              <div className="w-8 h-8 bg-amber-700 rounded-lg flex items-center justify-center">
                <TreePine className="w-4 h-4 text-white" />
              </div>
              <span className="hidden sm:block text-sm font-semibold">Kassim Pillai Family</span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-1">
              {NAV_ITEMS.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150',
                    pathname === item.href
                      ? 'bg-amber-50 text-amber-800'
                      : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              ))}
              {isAdmin && (
                <Link
                  href="/admin"
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150',
                    pathname.startsWith('/admin')
                      ? 'bg-amber-50 text-amber-800'
                      : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                  )}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Admin
                </Link>
              )}
            </div>

            {/* Right side */}
            <div className="flex items-center gap-2">
              {/* User menu */}
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-stone-100 transition-colors"
                  aria-label="User menu"
                >
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={userProfile?.profilePhoto || ''} />
                    <AvatarFallback className="text-xs">{getInitials(displayName)}</AvatarFallback>
                  </Avatar>
                  <span className="hidden md:block text-sm font-medium text-stone-700">{displayName.split(' ')[0]}</span>
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-lg border border-stone-200 py-1 z-50 animate-fade-in">
                    <div className="px-3 py-2 border-b border-stone-100">
                      <p className="text-sm font-semibold text-stone-800">{displayName}</p>
                      <p className="text-xs text-stone-500">{userProfile?.role}</p>
                    </div>
                    <Link
                      href="/profile"
                      className="flex items-center gap-2 px-3 py-2 text-sm text-stone-700 hover:bg-stone-50"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <User className="w-4 h-4" />
                      My Profile
                    </Link>
                    <Link
                      href="/my-branch"
                      className="flex items-center gap-2 px-3 py-2 text-sm text-stone-700 hover:bg-stone-50"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <GitBranch className="w-4 h-4" />
                      My Family
                    </Link>
                    <div className="border-t border-stone-100 mt-1 pt-1">
                      <button
                        onClick={async () => { setUserMenuOpen(false); await logout(); }}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile hamburger */}
              <button
                className="lg:hidden p-2 rounded-lg hover:bg-stone-100 text-stone-600"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="Toggle menu"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-stone-200 bg-white">
            <div className="px-4 py-3 space-y-1">
              {NAV_ITEMS.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors',
                    pathname === item.href
                      ? 'bg-amber-50 text-amber-800'
                      : 'text-stone-700 hover:bg-stone-100'
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </Link>
              ))}
              {isAdmin && (
                <Link
                  href="/admin"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-stone-700 hover:bg-stone-100"
                >
                  <LayoutDashboard className="w-5 h-5" />
                  Admin Dashboard
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Overlay */}
      {(mobileOpen || userMenuOpen) && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => { setMobileOpen(false); setUserMenuOpen(false); }}
        />
      )}
    </>
  );
}
