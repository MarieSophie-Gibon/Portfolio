import { AdminProvider } from '@/context/AdminContext';
import { SketchbookStage } from '@/components/sketchbook/SketchbookStage';
import { DeskBackground } from '@/components/sketchbook/DeskBackground';
import { AdminTopBar } from '@/components/admin/AdminTopBar';
import { AdminLoginModal } from '@/components/admin/AdminLoginModal';
import { ArticleManagerDrawer } from '@/components/admin/ArticleManagerDrawer';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export default function App() {
  return (
    <ErrorBoundary>
      <AdminProvider>
        <DeskBackground />
        <SketchbookStage />
        <AdminTopBar />
        <ArticleManagerDrawer />
        <AdminLoginModal />
      </AdminProvider>
    </ErrorBoundary>
  );
}
