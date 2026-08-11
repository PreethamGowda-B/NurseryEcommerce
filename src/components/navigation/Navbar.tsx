import React, { useState, useEffect } from 'react';
import { businessData } from '../../data/business';
import { Phone, MessageSquare, Menu, X, Leaf, ShoppingBag, User as UserIcon, LogOut } from 'lucide-react';
import { useCart } from '../../hooks/useCart';
import { useUser, useLogout } from '../../hooks/useAuth';
import { Link, useLocation, useNavigate } from 'react-router-dom';

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { itemCount } = useCart();
  const { data: user } = useUser();
  const logoutMutation = useLogout();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (id: string, path?: string) => {
    setIsMobileMenuOpen(false);

    if (path) {
      navigate(path);
      return;
    }

    if (location.pathname === '/') {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate(`/?section=${id}`);
    }
  };

  const handleBrandClick = () => {
    if (location.pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate('/');
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#faf9f6]/95 backdrop-blur-md py-3 shadow-natural border-b border-emerald-900/10'
          : 'py-5'
      }`}
      style={
        !isScrolled
          ? {
              background:
                'linear-gradient(to bottom, rgba(240,237,230,0.96) 0%, rgba(240,237,230,0.85) 70%, transparent 100%)',
            }
          : undefined
      }
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          
          {/* Left Brand Logo */}
          <div
            onClick={handleBrandClick}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-full bg-emerald-100/80 border border-emerald-300/60 flex items-center justify-center text-[#386641] shadow-xs group-hover:scale-105 transition-transform">
              <Leaf className="w-5 h-5 text-[#386641]" />
            </div>

            <div>
              <span className="font-cinzel font-bold text-lg sm:text-xl tracking-wider text-[#0f2d21] block leading-none">
                SHEENEEKA <span className="text-[#386641]">NURSERY</span>
              </span>
              <span className="text-[9px] uppercase tracking-[0.18em] text-[#386641] font-semibold block mt-0.5">
                BRINGING NATURE CLOSER TO YOU
              </span>
            </div>
          </div>

          {/* Center Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold uppercase tracking-wider text-[#0f2d21]">
            <button
              onClick={() => handleNavClick('plant-catalog')}
              className="hover:text-[#386641] transition-colors py-1 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-[#386641] hover:after:w-full after:transition-all"
            >
              Plants
            </button>
            <button
              onClick={() => handleNavClick('why-sheeneeka')}
              className="hover:text-[#386641] transition-colors py-1 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-[#386641] hover:after:w-full after:transition-all"
            >
              About
            </button>
            <button
              onClick={() => handleNavClick('nursery-gallery')}
              className="hover:text-[#386641] transition-colors py-1 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-[#386641] hover:after:w-full after:transition-all"
            >
              Gallery
            </button>
            <button
              onClick={() => handleNavClick('visit-us')}
              className="hover:text-[#386641] transition-colors py-1 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-[#386641] hover:after:w-full after:transition-all"
            >
              Visit Us
            </button>
            <button
              onClick={() => handleNavClick('', '/shop')}
              className="hover:text-[#386641] transition-colors py-1 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-[#386641] hover:after:w-full after:transition-all"
            >
              Shop
            </button>
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Cart Button with Count Badge */}
            <Link
              to="/cart"
              className="relative p-2.5 rounded-full bg-white/80 border border-emerald-900/10 text-[#386641] hover:bg-emerald-50 transition-all hover:scale-105"
              title="View Cart"
            >
              <ShoppingBag className="w-4 h-4" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#386641] text-white text-[10px] font-bold flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>

            {/* Account / Login */}
            {user ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/account"
                  className="text-xs font-semibold text-[#0f2d21] hover:text-[#386641] transition-colors"
                >
                  Hi, {user.name.split(' ')[0]}
                </Link>
                <button
                  onClick={() => logoutMutation.mutate()}
                  className="p-2 rounded-full bg-slate-100 text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="p-2.5 rounded-full bg-white/80 border border-emerald-900/10 text-[#386641] hover:bg-emerald-50 transition-all hover:scale-105"
                title="Sign In / Register"
              >
                <UserIcon className="w-4 h-4" />
              </Link>
            )}

            <a
              href={`tel:${businessData.phoneRaw}`}
              className="px-4 py-2 rounded-full border border-[#386641] text-[#0f2d21] hover:bg-emerald-50 text-xs font-semibold flex items-center gap-1.5 transition-all hover:scale-105"
            >
              <Phone className="w-3.5 h-3.5 text-[#386641]" />
              <span>Call Us</span>
            </a>

            <a
              href={`https://wa.me/${businessData.whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 rounded-full bg-[#386641] hover:bg-[#2d5234] text-white text-xs font-semibold flex items-center gap-2 shadow-sm transition-all hover:scale-105"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </a>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <Link
              to="/cart"
              className="relative p-2 rounded-full bg-white border border-emerald-900/10 text-[#386641]"
              title="Cart"
            >
              <ShoppingBag className="w-4 h-4" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#386641] text-white text-[9px] font-bold flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>

            <a
              href={`https://wa.me/${businessData.whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full bg-[#386641] text-white"
            >
              <MessageSquare className="w-4 h-4" />
            </a>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-[#0f2d21] hover:text-[#386641]"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-[#faf9f6] border-b border-emerald-900/10 px-6 py-6 space-y-4 shadow-lg animate-in slide-in-from-top duration-200">
          <nav className="flex flex-col gap-4 text-sm font-semibold uppercase tracking-wider text-[#0f2d21]">
            <button onClick={() => handleNavClick('plant-catalog')} className="text-left hover:text-[#386641]">
              Plants
            </button>
            <button onClick={() => handleNavClick('why-sheeneeka')} className="text-left hover:text-[#386641]">
              About
            </button>
            <button onClick={() => handleNavClick('nursery-gallery')} className="text-left hover:text-[#386641]">
              Gallery
            </button>
            <button onClick={() => handleNavClick('visit-us')} className="text-left hover:text-[#386641]">
              Visit Us
            </button>
            <button onClick={() => handleNavClick('', '/shop')} className="text-left hover:text-[#386641]">
              Shop
            </button>
          </nav>

          <div className="pt-4 border-t border-emerald-900/10 flex flex-col gap-3">
            <a
              href={`tel:${businessData.phoneRaw}`}
              className="w-full py-3 rounded-full border border-[#386641] text-[#0f2d21] text-xs font-semibold text-center flex items-center justify-center gap-2"
            >
              <Phone className="w-4 h-4 text-[#386641]" />
              <span>Call Us</span>
            </a>
            <a
              href={`https://wa.me/${businessData.whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 rounded-full bg-[#386641] text-white text-xs font-semibold text-center flex items-center justify-center gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              <span>WhatsApp Inquiry</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
