import { AdminProvider } from '@/context/AdminContext';
import { SketchbookStage } from '@/components/sketchbook/SketchbookStage';
import { DeskBackground } from '@/components/sketchbook/DeskBackground';
import { AdminTopBar } from '@/components/admin/AdminTopBar';
import { AdminLoginModal } from '@/components/admin/AdminLoginModal';
import { ArticleManagerDrawer } from '@/components/admin/ArticleManagerDrawer';

export default function App() {
  return (
    <AdminProvider>
      <DeskBackground />
      <SketchbookStage />
      <AdminTopBar />
      <ArticleManagerDrawer />
      <AdminLoginModal />
    </AdminProvider>
  );
}
