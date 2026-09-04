import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { MobileNav } from './MobileNav';
// import { useAuth } from '../../context/AuthContext';

export const AppLayout: React.FC = () => {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const location = useLocation();
  // const { role } = useAuth();

  const getPageMeta = () => {
    const path = location.pathname;
    if (path === '/manager') return { title: 'Tableau de bord', subtitle: 'Aperçu global de l’activité de la bibliothèque' };
    if (path === '/manager/books') return { title: 'Gestion des livres', subtitle: 'Catalogue, disponibilité et inventaire' };
    if (path.startsWith('/manager/books/')) return { title: 'Fiche détaillée du livre', subtitle: 'Informations, statut et historique des emprunts' };
    if (path === '/manager/borrowers') return { title: 'Gestion des emprunteurs', subtitle: 'Adhérents, contacts et état des prêts' };
    if (path === '/manager/borrowings') return { title: 'Registre des emprunts', subtitle: 'Emprunts actifs, retards et enregistrement des retours' };
    if (path === '/manager/history') return { title: 'Historique des emprunts', subtitle: 'Archives des prêts et retours terminés' };

    if (path === '/borrower') return { title: 'Espace Adhérent', subtitle: 'Vos emprunts en cours et échéances' };
    if (path === '/borrower/catalog') return { title: 'Catalogue de la bibliothèque', subtitle: 'Explorez et empruntez des ouvrages disponibles' };
    if (path.startsWith('/borrower/catalog/')) return { title: 'Détails de l’ouvrage', subtitle: 'Informations sur l’œuvre et disponibilité' };
    if (path === '/borrower/borrowings') return { title: 'Mes emprunts en cours', subtitle: 'Livres empruntés et dates de retour prévues' };
    if (path === '/borrower/history') return { title: 'Mon historique de lecture', subtitle: 'Vos lectures passées et livres retournés' };

    return { title: 'Library OS', subtitle: 'Système de gestion' };
  };

  const meta = getPageMeta();

  return (
    <div className="flex h-screen w-full bg-neutral-950 text-neutral-100 overflow-hidden font-sans">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block shrink-0 h-full">
        <Sidebar />
      </div>

      {/* Mobile Drawer */}
      <MobileNav isOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />

      {/* Main Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        <Header
          onOpenMobileNav={() => setMobileNavOpen(true)}
          title={meta.title}
          subtitle={meta.subtitle}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
