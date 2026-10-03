import React, { useEffect, useState } from 'react';
import { Link, useLocation } from '@/lib/next-router';
import { Menu, X, Phone, Mail, UserLock, ChevronDown, LayoutDashboard, Settings, LogOut, Search, Moon, Sun, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { SearchCommand, SearchCommandTrigger } from '../common/SearchCommand';
import { useTheme } from '@/contexts/ThemeContext';

const navItems = [
  { name: 'Home', path: '/' },
  { name: 'About Us', path: '/about' },
  { name: 'Services', path: '/services' },
  { name: 'Industries', path: '/industries' },
  { name: 'AMC Plans', path: '/amc-plans' },
  { name: 'Portfolio', path: '/demo' },
  { name: 'Contact Us', path: '/contact' },
];

const resourceItems = [
  { name: 'Demo Showcase', path: '/demo' },
  { name: 'Tech Blog', path: '/blog' },
  { name: 'Why Choose Us', path: '/why-us' },
  { name: 'IT Support', path: '/support' },
];

const Header: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const location = useLocation();
  const { setTheme, theme } = useTheme();

  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [isEmployeeLoggedIn, setIsEmployeeLoggedIn] = useState(false);
  const [adminName, setAdminName] = useState('Admin');
  const [employeeName, setEmployeeName] = useState('Employee');

  useEffect(() => {
    setIsAdminLoggedIn(!!localStorage.getItem('vts_admin_auth'));
    setIsEmployeeLoggedIn(!!localStorage.getItem('vts_engineer_auth'));
    setAdminName(localStorage.getItem('vts_admin_email')?.split('@')[0] || 'Admin');
    setEmployeeName(localStorage.getItem('vts_engineer_name') || 'Employee');
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center space-x-3">
            <img
              src="https://miaoda-conversation-file.s3cdn.medo.dev/user-8t7j0johoxds/conv-99gjdx4fbuv4/20260302/file-9znj7azzuakg.png"
              alt="VedTech Services Logo"
              className="h-12 w-12 rounded-full"
              data-editor-config="%7B%22defaultSrc%22%3A%22https%3A%2F%2Fmiaoda-conversation-file.s3cdn.medo.dev%2Fuser-8t7j0johoxds%2Fconv-99gjdx4fbuv4%2F20260302%2Ffile-9znj7azzuakg.png%22%7D" />
            <span className="text-xl font-bold tracking-tight text-primary hidden sm:inline">VedTech <span className="text-foreground">Services</span></span>
          </Link>
        </div>

        <div className="flex-1 max-w-md mx-4 hidden md:block">
          <SearchCommandTrigger onClick={() => setIsSearchOpen(true)} />
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "transition-colors hover:text-primary",
                location.pathname === item.path ? "text-primary font-semibold" : "text-muted-foreground"
              )}
            >
              {item.name}
            </Link>
          ))}

          {/* Resources Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild id="header-resources-menu-trigger">
              <button className="flex items-center gap-1 text-muted-foreground transition-colors hover:text-primary focus:outline-none">
                Resources <ChevronDown className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {resourceItems.map((item) => (
                <DropdownMenuItem key={item.path} asChild>
                  <Link to={item.path} className="w-full cursor-pointer">
                    {item.name}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="flex items-center justify-center w-9 h-9 rounded-lg border border-border bg-background hover:bg-muted transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4 text-muted-foreground" /> : <Moon className="h-4 w-4 text-muted-foreground" />}
            </button>

            {isAdminLoggedIn || isEmployeeLoggedIn ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="border-primary text-primary hover:bg-primary/5 font-semibold">
                    <LayoutDashboard className="h-4 w-4 mr-2" />
                    My Dashboard
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold">{isAdminLoggedIn ? adminName : employeeName}</span>
                      <span className="text-[10px] text-muted-foreground uppercase">{isAdminLoggedIn ? 'Administrator' : 'Engineering Professional'}</span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to={isAdminLoggedIn ? '/admin/dashboard' : '/engineer/dashboard'} className="cursor-pointer">
                      <LayoutDashboard className="h-4 w-4 mr-2" /> Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/settings" className="cursor-pointer">
                      <Settings className="h-4 w-4 mr-2" /> Account Settings
                    </Link>
                  </DropdownMenuItem>
                  {isAdminLoggedIn && (
                    <DropdownMenuItem asChild>
                      <Link to="/admin/logs" className="cursor-pointer">
                        <Settings className="h-4 w-4 mr-2" /> Audit Logs
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-600 focus:text-red-600 cursor-pointer" onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-2" /> Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild variant="outline" size="sm" className="border-primary text-primary hover:bg-primary/5 font-semibold">
                <Link to="/employee/login" className="flex items-center gap-2">
                  <UserLock className="h-4 w-4" />
                  Employee Login
                </Link>
              </Button>
            )}
            <Button asChild variant="default" size="sm" className="bg-primary hover:bg-primary/90 text-white font-semibold">
              <Link to="/contact">Book Service</Link>
            </Button>
          </div>
        </nav>

        {/* Mobile Navigation */}
        <div className="md:hidden flex items-center gap-2">
          <SearchCommandTrigger onClick={() => setIsSearchOpen(true)} />
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] md:w-[400px]">
              <nav className="flex flex-col space-y-4 mt-8">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      "text-lg font-medium transition-colors hover:text-primary",
                      location.pathname === item.path ? "text-primary font-bold" : "text-muted-foreground"
                    )}
                    onClick={() => setIsOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}

                <div className="pt-4 border-t">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">Resources</p>
                  {resourceItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className="block text-lg font-medium text-muted-foreground hover:text-primary mb-3"
                      onClick={() => setIsOpen(false)}
                    >
                      {item.name}
                    </Link>
                  ))}
                  <div className="flex items-center gap-4 mt-4">
                    <Button variant="outline" size="icon" onClick={() => setTheme('light')} className={cn(theme === 'light' && "border-primary")}>
                      <Sun className="h-5 w-5" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => setTheme('dark')} className={cn(theme === 'dark' && "border-primary")}>
                      <Moon className="h-5 w-5" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => setTheme('system')} className={cn(theme === 'system' && "border-primary")}>
                      <Monitor className="h-5 w-5" />
                    </Button>
                  </div>
                </div>

                <div className="flex flex-col gap-3 mt-4 pt-4 border-t">
                  {isAdminLoggedIn || isEmployeeLoggedIn ? (
                    <>
                      <Button asChild variant="outline" className="w-full border-primary text-primary font-bold">
                        <Link to={isAdminLoggedIn ? '/admin/dashboard' : '/engineer/dashboard'} onClick={() => setIsOpen(false)}>
                          Go to Dashboard
                        </Link>
                      </Button>
                      <Button asChild variant="ghost" className="w-full text-slate-600 font-bold">
                        <Link to="/settings" onClick={() => setIsOpen(false)}>
                          <Settings className="h-5 w-5 mr-2" />
                          Account Settings
                        </Link>
                      </Button>
                      <Button variant="ghost" className="text-red-600 font-bold" onClick={handleLogout}>
                        Logout Account
                      </Button>
                    </>
                  ) : (
                    <Button asChild variant="outline" className="w-full border-primary text-primary hover:bg-primary/5 font-semibold">
                      <Link to="/employee/login" onClick={() => setIsOpen(false)} className="flex items-center justify-center gap-2">
                        <UserLock className="h-5 w-5" />
                        Employee Login
                      </Link>
                    </Button>
                  )}
                  <Button asChild className="w-full bg-primary hover:bg-primary/90 text-white font-semibold shadow-lg">
                    <Link to="/contact" onClick={() => setIsOpen(false)}>Contact Us</Link>
                  </Button>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
      <SearchCommand open={isSearchOpen} onOpenChange={setIsSearchOpen} />
    </header>
  );
};

export default Header;
