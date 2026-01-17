import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Zap } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import LanguageSelector from "./LanguageSelector";
import { replace, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const navLinks = [
    { name: t('nav.trading'), href: "#trading" },
    { name: t('nav.news'), href: "#news" },
    { name: t('nav.leaderboard'), href: "#leaderboard" },
    { name: t('nav.community & trif'), href: "#community" },
    { name: t('nav.masterclass'), href: "#masterclass" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
              <Zap className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">
              Trade<span className="text-gradient">Sense</span> AI
            </span>
          </a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-muted-foreground hover:text-foreground transition-colors duration-200"
              >
                {link.name}
              </a>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-4">
            <LanguageSelector />
            <ThemeToggle />
            <Button variant="ghost" className="w-full" onClick={() => {
              setIsOpen(false);
              navigate("/login", { replace: true });
              console.log("btn clicked");
            }}>
              {t('nav.login')}
            </Button>
            <Button variant="hero" onClick={() => navigate("/pricing")}>{t('nav.startFree')}</Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <LanguageSelector />
            <ThemeToggle />
            <button
              className="text-foreground"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-border animate-fade-in">
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-muted-foreground hover:text-foreground transition-colors py-2"
                  onClick={() => setIsOpen(false)}
                >
                  {link.name}
                </a>
              ))}
              <div className="flex flex-col gap-2 pt-4 border-t border-border">
                <Button variant="ghost" className="w-full" onClick={() => {
                  setIsOpen(false);
                  navigate("/login", { replace: true });
                  console.log("btn clicked");
                }}>
                  {t('nav.login')}
                </Button>
                <Button
                  variant="hero"
                  className="w-full"
                  onClick={() => {
                    setIsOpen(false);
                    navigate("/pricing");
                  }}
                >
                  {t('nav.startFree')}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
