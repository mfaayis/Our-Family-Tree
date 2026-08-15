import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateStr: string | undefined): string {
  if (!dateStr) return 'Unknown';
  try {
    return format(new Date(dateStr), 'dd MMM yyyy');
  } catch {
    return dateStr;
  }
}

export function formatRelativeTime(dateStr: string | undefined): string {
  if (!dateStr) return '';
  try {
    return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
  } catch {
    return dateStr;
  }
}

export function getGenderIcon(gender: string): string {
  if (gender === 'male') return '♂';
  if (gender === 'female') return '♀';
  return '?';
}

export function getGenderColor(gender: string): string {
  if (gender === 'male') return 'text-blue-600';
  if (gender === 'female') return 'text-rose-500';
  return 'text-slate-400';
}

export function getGenderBg(gender: string): string {
  if (gender === 'male') return 'bg-blue-50 border-blue-200';
  if (gender === 'female') return 'bg-rose-50 border-rose-200';
  return 'bg-slate-50 border-slate-200';
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}
