import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { GalleryPage } from '@/components/gallery/GalleryPage';

export const metadata = {
  title: 'Gallery — Kassim Pillai Family',
};

export default function Gallery() {
  return (
    <ProtectedRoute>
      <GalleryPage />
    </ProtectedRoute>
  );
}
