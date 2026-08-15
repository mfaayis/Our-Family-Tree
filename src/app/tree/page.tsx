import { Navbar } from '@/components/layout/Navbar';
import { TreeCanvas } from '@/components/tree/FamilyTreePage';

export const metadata = {
  title: 'Family Tree — Kassim Pillai Family',
};

export default function TreePage() {
  return (
    <div className="h-screen w-full relative bg-heritage-parchment-light">
      <Navbar />
      <TreeCanvas />
    </div>
  );
}
