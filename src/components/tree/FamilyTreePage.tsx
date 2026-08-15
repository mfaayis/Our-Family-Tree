'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { useFamilyTree } from '@/contexts/FamilyTreeContext';
import { useAuth } from '@/contexts/AuthContext';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PersonCard } from '@/components/people/PersonCard';
import { AddRelativeDialog } from '@/components/people/AddRelativeDialog';
import { EditPersonDialog } from '@/components/people/EditPersonDialog';
import type { Person, Relationship } from '@/lib/types';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Search,
  Loader2,
  AlertTriangle,
  Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const CARD_W = 160;
const CARD_H = 95;
const H_GAP = 60;
const V_GAP = 100;

interface TreeNodeData {
  id: string;
  person: Person;
  children: TreeNodeData[];
  spouses: Person[];
  generation: number;
  x: number;
  y: number;
}

interface Pos { x: number; y: number; }

function buildTree(
  rootId: string,
  people: Map<string, Person>,
  rels: Relationship[]
): TreeNodeData | null {
  const visited = new Set<string>();
  function build(id: string, gen: number): TreeNodeData | null {
    if (visited.has(id)) return null;
    visited.add(id);
    const person = people.get(id);
    if (!person || person.isDeleted) return null;
    const childIds = rels
      .filter(r => r.relationshipType === 'parent' && r.personA === id)
      .map(r => r.personB);
    const spouseIds = rels
      .filter(r => r.relationshipType === 'spouse' && (r.personA === id || r.personB === id))
      .map(r => r.personA === id ? r.personB : r.personA);
    const children = childIds.map(c => build(c, gen + 1)).filter((n): n is TreeNodeData => n !== null);
    const spouses = spouseIds.map(s => people.get(s)).filter((p): p is Person => !!p);
    return { id, person, children, spouses, generation: gen, x: 0, y: 0 };
  }
  return build(rootId, 0);
}

function getSubtreeW(node: TreeNodeData): number {
  if (node.children.length === 0) return CARD_W;
  const childrenW = node.children.reduce((sum, c) => sum + getSubtreeW(c) + H_GAP, -H_GAP);
  return Math.max(CARD_W, childrenW);
}

function assignPositions(node: TreeNodeData, x: number, y: number): void {
  node.y = y;
  if (node.children.length === 0) { node.x = x; return; }
  let cx = x - getSubtreeW(node) / 2;
  for (const child of node.children) {
    const cw = getSubtreeW(child);
    assignPositions(child, cx + cw / 2, y + CARD_H + V_GAP);
    cx += cw + H_GAP;
  }
  const first = node.children[0];
  const last = node.children[node.children.length - 1];
  node.x = (first.x + last.x) / 2;
}

function collectNodes(node: TreeNodeData, out: TreeNodeData[] = []): TreeNodeData[] {
  out.push(node);
  for (const c of node.children) collectNodes(c, out);
  return out;
}

function collectEdges(node: TreeNodeData, out: { x1: number; y1: number; x2: number; y2: number }[] = []) {
  for (const c of node.children) {
    out.push({ x1: node.x, y1: node.y + CARD_H, x2: c.x, y2: c.y });
    collectEdges(c, out);
  }
  return out;
}

export function FamilyTreePage() {
  const { people, relationships, rootPersonId, loading, error } = useFamilyTree();
  const { canEdit } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [scale, setScale] = useState(0.8);
  const [pan, setPan] = useState<Pos>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [lastMouse, setLastMouse] = useState<Pos>({ x: 0, y: 0 });
  const [branch, setBranch] = useState('all');
  const [search, setSearch] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  
  // Dialog States
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [addTarget, setAddTarget] = useState<Person | null>(null);
  const [addRelType, setAddRelType] = useState<'child' | 'parent' | 'sibling' | 'spouse'>('child');
  
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Person | null>(null);

  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const peopleMap = new Map(people.map(p => [p.id, p]));

  // Dynamically create branches based on the children of the root person
  const branches = [{ id: 'all', label: 'Entire Family' }];
  if (rootPersonId && peopleMap.has(rootPersonId)) {
      const rootChildren = relationships
          .filter(r => r.relationshipType === 'parent' && r.personA === rootPersonId)
          .map(r => peopleMap.get(r.personB))
          .filter((p): p is Person => !!p);
      
      rootChildren.forEach(child => {
          branches.push({ id: child.id, label: child.fullName.split(' ')[0] });
      });
  }

  // Determine root for current branch filter
  const effectiveRoot = useCallback(() => {
    if (branch === 'all' || !rootPersonId) return rootPersonId;
    return branch;
  }, [branch, rootPersonId]);

  const root = rootPersonId ? buildTree(effectiveRoot() || rootPersonId, peopleMap, relationships) : null;
  if (root) assignPositions(root, 0, 0);

  const nodes = root ? collectNodes(root) : [];
  const edges = root ? collectEdges(root) : [];

  // Bounds
  const minX = nodes.length ? Math.min(...nodes.map(n => n.x - CARD_W / 2)) : 0;
  const maxX = nodes.length ? Math.max(...nodes.map(n => n.x + CARD_W / 2)) : 800;
  const minY = nodes.length ? Math.min(...nodes.map(n => n.y)) : 0;
  const maxY = nodes.length ? Math.max(...nodes.map(n => n.y + CARD_H)) : 600;
  const svgW = maxX - minX + 120;
  const svgH = maxY - minY + 120;

  // Focus on person from URL
  const focusId = searchParams.get('focus');
  useEffect(() => {
    if (focusId) {
      const node = nodes.find(n => n.id === focusId);
      if (node && containerRef.current) {
        const cw = containerRef.current.clientWidth;
        const ch = containerRef.current.clientHeight;
        setPan({
          x: cw / 2 - (node.x - minX + 60) * scale,
          y: ch / 2 - (node.y - minY + 60) * scale,
        });
      }
    }
  }, [focusId, nodes.length, scale, minX, minY]);

  // Pan handlers
  function onMouseDown(e: React.MouseEvent) {
    setIsPanning(true);
    setLastMouse({ x: e.clientX, y: e.clientY });
  }
  function onMouseMove(e: React.MouseEvent) {
    if (!isPanning) return;
    setPan(p => ({ x: p.x + e.clientX - lastMouse.x, y: p.y + e.clientY - lastMouse.y }));
    setLastMouse({ x: e.clientX, y: e.clientY });
  }
  function onMouseUp() { setIsPanning(false); }

  // Touch pan
  const lastTouch = useRef<Pos | null>(null);
  function onTouchStart(e: React.TouchEvent) {
    lastTouch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }
  function onTouchMove(e: React.TouchEvent) {
    if (!lastTouch.current) return;
    const dx = e.touches[0].clientX - lastTouch.current.x;
    const dy = e.touches[0].clientY - lastTouch.current.y;
    setPan(p => ({ x: p.x + dx, y: p.y + dy }));
    lastTouch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }

  function resetView() {
    setScale(isMobile ? 0.5 : 0.8);
    setPan({ x: 0, y: 0 });
  }

  // Filtered nodes for search highlight
  const searchLower = search.toLowerCase();
  const matchIds = search.trim()
    ? new Set(nodes.filter(n => n.person.fullName.toLowerCase().includes(searchLower)).map(n => n.id))
    : new Set<string>();

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50">
        <Navbar />
        <div className="pt-20 flex items-center justify-center h-[calc(100vh-80px)]">
          <div className="text-center">
            <Loader2 className="w-10 h-10 text-amber-600 animate-spin mx-auto mb-3" />
            <p className="text-stone-500">Loading family tree...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-stone-50">
        <Navbar />
        <div className="pt-20 flex items-center justify-center h-[calc(100vh-80px)]">
          <div className="text-center">
            <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
            <p className="text-stone-700 font-medium">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  // Mobile: show list view instead of canvas
  if (isMobile) {
    return (
      <div className="min-h-screen bg-stone-50">
        <Navbar />
        <div className="pt-20 px-4 py-4 max-w-xl mx-auto">
          <h1 className="text-xl font-bold text-stone-800 mb-1">Family Tree</h1>
          <p className="text-stone-500 text-sm mb-4">Tap a person to view their profile and family.</p>

          {/* Branch filter */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
            {branches.map(b => (
              <button
                key={b.id}
                onClick={() => setBranch(b.id)}
                className={cn(
                  'shrink-0 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors',
                  branch === b.id ? 'bg-amber-700 text-white border-amber-700' : 'bg-white text-stone-600 border-stone-200'
                )}
              >
                {b.label}
              </button>
            ))}
          </div>

          {/* Person list (mobile) */}
          <div className="space-y-2">
            {nodes.map(node => (
              <button
                key={node.id}
                onClick={() => router.push(`/people/${node.id}`)}
                className="w-full flex items-center gap-3 p-3 bg-white/60 backdrop-blur-md rounded-xl border border-stone-200 hover:border-amber-200 transition-all text-left shadow-sm"
              >
                <div className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0',
                  node.person.gender === 'male' ? 'bg-blue-100 text-blue-700' :
                  node.person.gender === 'female' ? 'bg-rose-100 text-rose-600' :
                  'bg-stone-100 text-stone-600'
                )}>
                  {node.person.isPlaceholder ? '?' : node.person.fullName[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn('font-semibold text-stone-800 truncate text-sm', node.person.isPlaceholder && 'italic text-stone-400')}>
                    {node.person.isPlaceholder ? 'Name to be updated' : node.person.fullName}
                  </p>
                  <p className="text-xs text-stone-400">Generation {node.generation + 1}</p>
                </div>
                <Users className="w-4 h-4 text-stone-300" />
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Desktop: Canvas tree
  return (
    <div className="min-h-screen bg-[#f9faf5] flex flex-col">
      <Navbar />
      <div className="pt-16 flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="bg-white/80 backdrop-blur-md border-b border-stone-200 px-4 py-2 flex items-center gap-3 flex-wrap shadow-sm z-10 relative">
          <h1 className="font-bold text-stone-800 text-sm">Family Tree</h1>

          {/* Branch filter */}
          <div className="flex gap-1.5 flex-wrap">
            {branches.map(b => (
              <button
                key={b.id}
                onClick={() => setBranch(b.id)}
                className={cn(
                  'px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors',
                  branch === b.id ? 'bg-amber-700 text-white border-amber-700 shadow-sm' : 'bg-white/50 text-stone-600 border-stone-200 hover:bg-stone-100'
                )}
              >
                {b.label}
              </button>
            ))}
          </div>

          <div className="ml-auto flex items-center gap-2">
            {/* Search */}
            {showSearch ? (
              <motion.div initial={{ width: 0, opacity: 0 }} animate={{ width: 160, opacity: 1 }}>
                <Input
                  autoFocus
                  placeholder="Search person..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  onBlur={() => { if (!search) setShowSearch(false); }}
                  className="h-8 w-full text-xs"
                />
              </motion.div>
            ) : (
              <Button size="icon" variant="ghost" onClick={() => setShowSearch(true)} title="Search">
                <Search className="w-4 h-4" />
              </Button>
            )}

            {/* Zoom controls */}
            <Button size="icon" variant="ghost" onClick={() => setScale(s => Math.min(s + 0.1, 2))} title="Zoom in">
              <ZoomIn className="w-4 h-4" />
            </Button>
            <span className="text-xs font-medium text-stone-500 w-10 text-center">{Math.round(scale * 100)}%</span>
            <Button size="icon" variant="ghost" onClick={() => setScale(s => Math.max(s - 0.1, 0.2))} title="Zoom out">
              <ZoomOut className="w-4 h-4" />
            </Button>
            <Button size="icon" variant="ghost" onClick={resetView} title="Reset view">
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Canvas Area */}
        <div
          ref={containerRef}
          className={cn(
            "flex-1 overflow-hidden tree-canvas select-none relative",
            isPanning ? "cursor-grabbing" : "cursor-grab"
          )}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={() => { lastTouch.current = null; }}
        >
          {/* Aesthetic Background */}
          <div className="absolute inset-0 bg-[#f4ebd8]" />
          <div className="absolute inset-0 pointer-events-none opacity-80 mix-blend-multiply">
            <Image
              src="/images/tree-bg.jpg"
              alt="Tree Background"
              fill
              priority
              quality={60}
              className="object-cover object-center"
            />
          </div>

          <div
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
              transformOrigin: '0 0',
              position: 'absolute',
              top: 0,
              left: 0,
              willChange: 'transform',
            }}
          >
            {/* SVG edges */}
            <svg
              style={{ position: 'absolute', top: 0, left: 0, overflow: 'visible', pointerEvents: 'none' }}
              width={svgW} height={svgH}
            >
              <defs>
                <linearGradient id="line-gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4a332a" stopOpacity="0.85" />
                  <stop offset="100%" stopColor="#8b5a2b" stopOpacity="0.85" />
                </linearGradient>
              </defs>
              <AnimatePresence>
                {edges.map((e, i) => {
                  const x1 = e.x1 - minX + 60;
                  const y1 = e.y1 - minY + 60;
                  const x2 = e.x2 - minX + 60;
                  const y2 = e.y2 - minY + 60;
                  const midY = (y1 + y2) / 2;
                  
                  // Smooth Bezier Curve
                  const d = `M ${x1} ${y1} C ${x1} ${midY + 20}, ${x2} ${midY - 20}, ${x2} ${y2}`;
                  
                  return (
                    <motion.path
                      key={`${e.x1}-${e.y1}-${e.x2}-${e.y2}-${i}`}
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 1.2, ease: "easeOut" }}
                      d={d}
                      fill="none"
                      stroke="url(#line-gradient)"
                      strokeWidth="5"
                      strokeLinecap="round"
                    />
                  );
                })}
              </AnimatePresence>
            </svg>

            {/* Person cards */}
            <AnimatePresence>
              {nodes.map(node => (
                <motion.div
                  key={node.id}
                  // Removed 'layout' to fix panning jitter!
                  initial={{ opacity: 0, scale: 0.8, x: node.x - minX + 60 - CARD_W / 2, y: node.y - minY + 80 }}
                  animate={{ 
                    opacity: 1, 
                    scale: 1, 
                    x: node.x - minX + 60 - CARD_W / 2,
                    y: node.y - minY + 60,
                  }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 150, 
                    damping: 20, 
                    mass: 0.8 
                  }}
                  style={{
                    position: 'absolute',
                    width: CARD_W,
                  }}
                  className={cn(
                    search.trim() && !matchIds.has(node.id) && 'opacity-20 transition-opacity duration-300'
                  )}
                >
                  <PersonCard
                    person={node.person}
                    childCount={node.children.length}
                    showQuickActions={canEdit}
                    onAddChild={() => {
                      setAddTarget(node.person);
                      setAddRelType('child');
                      setAddDialogOpen(true);
                    }}
                    onAddSpouse={() => {
                      setAddTarget(node.person);
                      setAddRelType('spouse');
                      setAddDialogOpen(true);
                    }}
                    onAddSibling={() => {
                      setAddTarget(node.person);
                      setAddRelType('sibling');
                      setAddDialogOpen(true);
                    }}
                    onEdit={() => {
                      setEditTarget(node.person);
                      setEditDialogOpen(true);
                    }}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Member count badge */}
          <div className="absolute bottom-4 left-4 bg-white/80 backdrop-blur-md rounded-xl border border-stone-200/60 px-3 py-2 shadow-sm">
            <p className="text-xs font-medium text-stone-500">{nodes.length} members shown</p>
          </div>
        </div>
      </div>

      {addDialogOpen && addTarget && (
        <AddRelativeDialog
          open={addDialogOpen}
          onClose={() => { setAddDialogOpen(false); setAddTarget(null); }}
          relativeTo={addTarget}
          relationshipType={addRelType}
        />
      )}

      {editDialogOpen && editTarget && (
        <EditPersonDialog
          open={editDialogOpen}
          onClose={() => { setEditDialogOpen(false); setEditTarget(null); }}
          person={editTarget}
        />
      )}
    </div>
  );
}
