'use client';

import { useCallback, useEffect, useState, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import ReactFlow, { 
  Background, 
  MiniMap, 
  Panel,
  ReactFlowProvider,
  useReactFlow,
  Node,
  Edge
} from 'reactflow';
import 'reactflow/dist/style.css';

import { useFamilyTree } from '@/contexts/FamilyTreeContext';
import { useAuth } from '@/contexts/AuthContext';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AddRelativeDialog } from '@/components/people/AddRelativeDialog';
import { EditPersonDialog } from '@/components/people/EditPersonDialog';
import { ProfileSidePanel } from '@/components/tree/ProfileSidePanel';

import PersonNode from '@/components/people/PersonNode';
import { CustomChildEdge, CustomSpouseEdge } from '@/components/tree/CustomEdges';
import { generateReactFlowGraph, findHighestAncestor } from '@/lib/reactflow-utils';
import { buildTreeFromRoot, assignTreePositions } from '@/lib/tree-utils';
import type { Person } from '@/lib/types';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Search,
  Loader2,
  AlertTriangle,
  Maximize
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const nodeTypes = { personNode: PersonNode };
const edgeTypes = { customChildEdge: CustomChildEdge, customSpouseEdge: CustomSpouseEdge };

function FlowCanvas() {
  const { people, relationships, rootPersonId, loading, error } = useFamilyTree();
  const { canEdit } = useAuth();
  const searchParams = useSearchParams();
  const { setCenter, fitView, zoomIn, zoomOut } = useReactFlow();

  const [search, setSearch] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  
  // Dialog States
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [addTarget, setAddTarget] = useState<Person | null>(null);
  const [addRelType, setAddRelType] = useState<'child' | 'parent' | 'sibling' | 'spouse'>('child');
  
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Person | null>(null);

  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [focusBranchId, setFocusBranchId] = useState<string | null>(null);

  const peopleMap = useMemo(() => new Map(people.map(p => [p.id, p])), [people]);

  // Initial root
  useEffect(() => {
    if (rootPersonId && expandedNodes.size === 0 && people.length > 0) {
      // Expand ALL nodes by default initially so the whole tree is visible
      const allIds = people.map(p => p.id);
      setExpandedNodes(new Set(allIds));
    }
  }, [rootPersonId, people]); // eslint-disable-line

  // Handle URL focus
  useEffect(() => {
    const focusId = searchParams.get('focus');
    if (focusId && peopleMap.has(focusId)) {
      setFocusBranchId(focusId);
      setExpandedNodes(prev => new Set(prev).add(focusId));
    }
  }, [searchParams, peopleMap]);

  const handleToggleExpand = useCallback((id: string) => {
    setExpandedNodes(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleSelectPerson = useCallback((person: Person) => {
    setSelectedPerson(person);
  }, []);

  const handleViewBranch = useCallback((id: string) => {
    setFocusBranchId(id);
    setExpandedNodes(prev => new Set(prev).add(id));
  }, []);

  const handleViewAncestors = useCallback((id: string) => {
    const highest = findHighestAncestor(id, relationships);
    setFocusBranchId(highest);
    setExpandedNodes(prev => new Set(prev).add(highest).add(id));
  }, [relationships]);

  const handleViewDescendants = useCallback((id: string) => {
    setFocusBranchId(id);
    setExpandedNodes(prev => new Set(prev).add(id));
  }, []);

  const openAddDialog = useCallback((type: 'child' | 'parent' | 'sibling' | 'spouse', person: Person) => {
    setAddTarget(person);
    setAddRelType(type);
    setAddDialogOpen(true);
  }, []);

  const openEditDialog = useCallback((person: Person) => {
    setEditTarget(person);
    setEditDialogOpen(true);
  }, []);

  // Generate Graph Data
  const { nodes, edges } = useMemo(() => {
    if (!rootPersonId) return { nodes: [], edges: [] };
    
    // Find the highest ancestor if we don't have a specific branch focus
    const actualRoot = focusBranchId || findHighestAncestor(rootPersonId, relationships);
    
    const tree = buildTreeFromRoot(actualRoot, peopleMap, relationships, 20);
    if (tree) {
      assignTreePositions(tree, 180, 110, 60, 100);
      const graph = generateReactFlowGraph(tree, expandedNodes);
      
      // Inject callbacks into nodes
      const interactiveNodes = graph.nodes.map(n => ({
        ...n,
        data: {
          ...n.data,
          onToggleExpand: handleToggleExpand,
          onSelectPerson: handleSelectPerson,
          onAddChild: (p: Person) => openAddDialog('child', p),
          onAddSpouse: (p: Person) => openAddDialog('spouse', p),
          onAddSibling: (p: Person) => openAddDialog('sibling', p),
          onAddParent: (p: Person) => openAddDialog('parent', p),
          onEdit: openEditDialog,
        }
      }));
      
      return { nodes: interactiveNodes, edges: graph.edges };
    }
    return { nodes: [], edges: [] };
  }, [rootPersonId, focusBranchId, peopleMap, relationships, expandedNodes, handleToggleExpand, handleSelectPerson, openAddDialog, openEditDialog]);

  // Center on focus Branch
  useEffect(() => {
    if (focusBranchId && nodes.length > 0) {
      const targetNode = nodes.find(n => n.id === focusBranchId);
      if (targetNode) {
        setTimeout(() => setCenter(targetNode.position.x, targetNode.position.y, { zoom: 1, duration: 800 }), 100);
      }
    }
  }, [focusBranchId, nodes]); // eslint-disable-line

  // Handle Search
  useEffect(() => {
    if (search.trim().length > 2) {
      const searchLower = search.toLowerCase();
      const match = nodes.find(n => n.data.person.fullName.toLowerCase().includes(searchLower));
      if (match) {
        setCenter(match.position.x, match.position.y, { zoom: 1, duration: 800 });
      }
    }
  }, [search, nodes, setCenter]);

  if (loading) {
    return (
      <div className="pt-20 flex items-center justify-center h-[calc(100vh-80px)]">
        <Loader2 className="w-10 h-10 text-amber-600 animate-spin mx-auto mb-3" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="pt-20 flex items-center justify-center h-[calc(100vh-80px)]">
        <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
        <p className="text-stone-700">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full h-[calc(100vh-64px)] relative overflow-hidden bg-[#f4ebd8]">
      {/* Background Painted Tree behind React Flow - REMOVED AS REQUESTED */}
      <div className="absolute inset-0 pointer-events-none z-0" />

      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        minZoom={0.1}
        maxZoom={2}
        defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
        className="z-10"
        fitView
        proOptions={{ hideAttribution: true }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
      >
        <MiniMap 
          nodeColor="#8b5a2b" 
          maskColor="rgba(244, 235, 216, 0.7)"
          style={{ backgroundColor: '#fffdf5', border: '1px solid rgba(139, 90, 43, 0.2)', borderRadius: 12 }} 
          className="shadow-xl mb-4 mr-4"
        />

        <Panel position="top-left" className="m-4">
          <div className="bg-[#fffdf5]/90 backdrop-blur-md p-2 rounded-xl border border-[#8b5a2b]/20 shadow-lg flex items-center gap-2">
            <h1 className="font-serif font-bold text-[#4a332a] text-sm px-2">Our Family Tree</h1>
            <div className="w-px h-4 bg-[#8b5a2b]/20 mx-1" />
            <Button size="sm" variant="ghost" className="text-[#8b5a2b] h-7 text-xs" onClick={() => setFocusBranchId(null)}>
              Entire Family
            </Button>
          </div>
        </Panel>

        <Panel position="top-right" className="m-4">
          <div className="flex gap-2 items-center bg-[#fffdf5]/90 backdrop-blur-md p-1.5 rounded-xl border border-[#8b5a2b]/20 shadow-lg">
            {showSearch ? (
              <motion.div initial={{ width: 0, opacity: 0 }} animate={{ width: 160, opacity: 1 }}>
                <Input
                  autoFocus
                  placeholder="Search person..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  onBlur={() => { if (!search) setShowSearch(false); }}
                  className="h-8 w-full text-xs bg-transparent border-[#8b5a2b]/20 focus-visible:ring-[#8b5a2b]"
                />
              </motion.div>
            ) : (
              <Button size="icon" variant="ghost" className="h-8 w-8 text-[#8b5a2b]" onClick={() => setShowSearch(true)}>
                <Search className="w-4 h-4" />
              </Button>
            )}
            <div className="w-px h-4 bg-[#8b5a2b]/20" />
            <Button size="icon" variant="ghost" className="h-8 w-8 text-[#8b5a2b]" onClick={() => zoomIn()}>
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button size="icon" variant="ghost" className="h-8 w-8 text-[#8b5a2b]" onClick={() => zoomOut()}>
              <ZoomOut className="w-4 h-4" />
            </Button>
            <Button size="icon" variant="ghost" className="h-8 w-8 text-[#8b5a2b]" onClick={() => fitView({ duration: 800 })}>
              <Maximize className="w-4 h-4" />
            </Button>
            <Button size="icon" variant="ghost" className="h-8 w-8 text-[#8b5a2b]" onClick={() => { setFocusBranchId(null); fitView({ duration: 800 }); }}>
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </Panel>
      </ReactFlow>

      {/* Profile Side Panel Overlay */}
      <ProfileSidePanel
        person={selectedPerson}
        onClose={() => setSelectedPerson(null)}
        onViewBranch={handleViewBranch}
        onViewAncestors={handleViewAncestors}
        onViewDescendants={handleViewDescendants}
        onAddRelative={(type, target) => openAddDialog(type, target)}
        onOpenProfile={(id) => window.open(`/people/${id}`, '_blank')}
      />

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

import { Suspense } from 'react';

export function TreeCanvas() {
  return (
    <div className="w-full h-full flex flex-col relative" data-cursor="explore">
      <ReactFlowProvider>
        <Suspense fallback={
          <div className="pt-20 flex items-center justify-center h-[calc(100vh-80px)]">
            <Loader2 className="w-10 h-10 text-amber-600 animate-spin mx-auto mb-3" />
          </div>
        }>
          <FlowCanvas />
        </Suspense>
      </ReactFlowProvider>
    </div>
  );
}
