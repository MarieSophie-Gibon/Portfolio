import { AdminProvider } from '@/context/AdminContext';
import { SketchbookStage } from '@/components/sketchbook/SketchbookStage';
import { DeskBackground } from '@/components/sketchbook/DeskBackground';
import { NotFoundPage } from '@/components/sketchbook/NotFoundPage';
import { AdminTopBar } from '@/components/admin/AdminTopBar';
import { AdminLoginModal } from '@/components/admin/AdminLoginModal';
import { ArticleManagerDrawer } from '@/components/admin/ArticleManagerDrawer';
import { ErrorBoundary } from '@/components/ErrorBoundary';

/** Le site tient sur une seule adresse : toute autre route affiche la page 404. */
const isHome = ['/', '/index.html'].includes(window.location.pathname.replace(/\/+$/, '/') || '/');

export default function App() {
  return (
    <ErrorBoundary>
      <AdminProvider>
        <DeskBackground />
        {isHome ? (
          <>
            <SketchbookStage />
            <AdminTopBar />
            <ArticleManagerDrawer />
            <AdminLoginModal />
          </>
        ) : (
          <NotFoundPage />
        )}
      </AdminProvider>
    </ErrorBoundary>
  );
}
