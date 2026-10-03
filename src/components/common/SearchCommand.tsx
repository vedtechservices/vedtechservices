import React, { useEffect, useCallback } from 'react';
import { useNavigate } from '@/lib/next-router';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import {
  Search, Laptop, Globe, Smartphone, Wrench,
  Network, Shield, HelpCircle, Phone, BookOpen,
  LayoutDashboard, School, Building2, Store,
  Lightbulb, Briefcase, FileText, Zap, MessageSquare, PlusCircle
} from 'lucide-react';

const searchData = [
  {
    group: 'Quick Actions', items: [
      { name: 'Request a Free Quote', path: '/contact', icon: <Zap className="mr-2 h-4 w-4 text-amber-500" />, keywords: 'price cost estimate quote' },
      { name: 'Call IT Support', path: 'tel:+917858971869', icon: <Phone className="mr-2 h-4 w-4 text-green-500" />, isExternal: true, keywords: 'help urgent call phone' },
      { name: 'WhatsApp Us', path: 'https://wa.me/917858971869', icon: <MessageSquare className="mr-2 h-4 w-4 text-green-400" />, isExternal: true, keywords: 'chat message whatsapp' },
      { name: 'Raise Support Ticket', path: '/support', icon: <PlusCircle className="mr-2 h-4 w-4 text-blue-500" />, keywords: 'issue fix problem bug' },
    ]
  },
  {
    group: 'Main Pages', items: [
      { name: 'Home', path: '/', icon: <Globe className="mr-2 h-4 w-4" />, keywords: 'start index main' },
      { name: 'About Us', path: '/about', icon: <Briefcase className="mr-2 h-4 w-4" />, keywords: 'company team mission vision' },
      { name: 'Why Choose Us', path: '/why-us', icon: <Lightbulb className="mr-2 h-4 w-4" />, keywords: 'benefits advantages trust' },
      { name: 'Contact Us', path: '/contact', icon: <Phone className="mr-2 h-4 w-4" />, keywords: 'reach email address location' },
      { name: 'Support / Raise Ticket', path: '/support', icon: <HelpCircle className="mr-2 h-4 w-4" />, keywords: 'help desk issue ticket' },
    ]
  },
  {
    group: 'Services', items: [
      { name: 'All Services', path: '/services', icon: <Shield className="mr-2 h-4 w-4" />, keywords: 'solutions hardware software list' },
      { name: 'Web Development', path: '/services/web-development', icon: <Globe className="mr-2 h-4 w-4" />, keywords: 'website design coding portal' },
      { name: 'Mobile App Development', path: '/services/mobile-app-development', icon: <Smartphone className="mr-2 h-4 w-4" />, keywords: 'ios android application phone' },
      { name: 'Hardware Repair', path: '/services/hardware-repair', icon: <Wrench className="mr-2 h-4 w-4" />, keywords: 'laptop computer desktop pc printer scanner fixed' },
      { name: 'Networking Solutions', path: '/services/networking-solutions', icon: <Network className="mr-2 h-4 w-4" />, keywords: 'wifi lan router cabling internet' },
      { name: 'IT Support & AMC', path: '/services/it-support', icon: <Shield className="mr-2 h-4 w-4" />, keywords: 'maintenance yearly plan annual' },
    ]
  },
  {
    group: 'Industries', items: [
      { name: 'Educational Institutions', path: '/industries/educational-institutions', icon: <School className="mr-2 h-4 w-4" />, keywords: 'school college university student' },
      { name: 'Corporate Offices', path: '/industries/corporate-offices', icon: <Building2 className="mr-2 h-4 w-4" />, keywords: 'business company office desk' },
      { name: 'Retail & Shops', path: '/industries/retail-shops', icon: <Store className="mr-2 h-4 w-4" />, keywords: 'store shop market billing' },
    ]
  },
  {
    group: 'Resources', items: [
      { name: 'Tech Blog', path: '/blog', icon: <BookOpen className="mr-2 h-4 w-4" />, keywords: 'news articles guides tips' },
      { name: 'Demo Showcase', path: '/demo', icon: <Laptop className="mr-2 h-4 w-4" />, keywords: 'preview sample work portfolio' },
      { name: 'AMC Plans', path: '/amc-plans', icon: <FileText className="mr-2 h-4 w-4" />, keywords: 'packages pricing maintenance' },
    ]
  },
  {
    group: 'Portals', items: [
      { name: 'Customer Dashboard', path: '/dashboard', icon: <LayoutDashboard className="mr-2 h-4 w-4" />, keywords: 'login account user panel' },
      { name: 'Employee Login', path: '/employee/login', icon: <Shield className="mr-2 h-4 w-4" />, keywords: 'staff engineer portal' },
      { name: 'Admin Login', path: '/admin/login', icon: <Shield className="mr-2 h-4 w-4" />, keywords: 'super manager access' },
    ]
  }
];

interface SearchCommandProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface SearchCommandTriggerProps {
  onClick: () => void;
}

export const SearchCommandTrigger: React.FC<SearchCommandTriggerProps> = ({ onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="relative inline-flex h-9 w-9 items-center justify-center rounded-md border border-input bg-background text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 md:h-10 md:w-40 md:justify-start md:px-3 lg:w-64"
  >
    <Search className="h-4 w-4 md:mr-2" />
    <span className="hidden md:inline-flex">Search website...</span>
    <kbd className="pointer-events-none absolute right-1.5 top-1/2 hidden h-5 -translate-y-1/2 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 md:flex">
      <span className="text-xs">⌘</span>K
    </kbd>
  </button>
);

export const SearchCommand: React.FC<SearchCommandProps> = ({ open, onOpenChange }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [onOpenChange, open]);

  const runCommand = useCallback((item: any) => {
    onOpenChange(false);
    if (item.isExternal) {
      window.open(item.path, '_blank');
    } else {
      navigate(item.path);
    }
  }, [navigate, onOpenChange]);

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Type a command or search (e.g., 'quote', 'support')..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        {searchData.map((group) => (
          <React.Fragment key={group.group}>
            <CommandGroup heading={group.group}>
              {group.items.map((item) => (
                <CommandItem
                  key={item.path}
                  value={`${item.name} ${item.keywords || ''}`}
                  onSelect={() => runCommand(item)}
                >
                  {item.icon}
                  <span>{item.name}</span>
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
          </React.Fragment>
        ))}
      </CommandList>
    </CommandDialog>
  );
};
