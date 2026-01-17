import { Zap, Twitter, Linkedin, Youtube, Instagram } from "lucide-react";
import { useTranslation } from 'react-i18next';

const Footer = () => {
  const { t } = useTranslation();

  const links = {
    produit: [t('nav.trading'), t('nav.news'), t('nav.community'), t('nav.masterclass')],
    ressources: ["Documentation", "API", "Blog", "Webinaires", "Tutoriels"],
    entreprise: [t('footer.about'), "Carrières", "Presse", "Partenaires", "Contact"],
    legal: [t('footer.terms'), t('footer.privacy'), "Cookies", "Risques"],
  };

  return (
    <footer className="border-t border-border bg-card/50">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2">
            <a href="#" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
                <Zap className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">
                Trade<span className="text-gradient">Sense</span> AI
              </span>
            </a>
            <p className="text-muted-foreground text-sm mb-6 max-w-xs">
              {t('footer.description')}
            </p>
            <div className="flex gap-4">
              {[Twitter, Linkedin, Youtube, Instagram].map((Icon, index) => (
                <a
                  key={index}
                  href="#"
                  className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                >
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold mb-4">Produit</h4>
            <ul className="space-y-2">
              {links.produit.map((link, index) => (
                <li key={index}>
                  <a href="#" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">{t('footer.navigation')}</h4>
            <ul className="space-y-2">
              {links.ressources.map((link, index) => (
                <li key={index}>
                  <a href="#" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">{t('footer.company')}</h4>
            <ul className="space-y-2">
              {links.entreprise.map((link, index) => (
                <li key={index}>
                  <a href="#" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">{t('footer.legal')}</h4>
            <ul className="space-y-2">
              {links.legal.map((link, index) => (
                <li key={index}>
                  <a href="#" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            {t('footer.copyright')}
          </p>
          <p className="text-xs text-muted-foreground max-w-md text-center md:text-right">
            Le trading comporte des risques. Les performances passées ne garantissent pas les résultats futurs.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
