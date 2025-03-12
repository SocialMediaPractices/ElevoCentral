import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTime(time: string): string {
  const [hours, minutes] = time.split(':').map(Number);
  
  if (isNaN(hours) || isNaN(minutes)) {
    return time;
  }
  
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const formattedHours = hours % 12 || 12;
  const formattedMinutes = minutes.toString().padStart(2, '0');
  
  return `${formattedHours}:${formattedMinutes} ${ampm}`;
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  
  if (isNaN(date.getTime())) {
    return dateString;
  }
  
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  }).format(date);
}

export function formatDateTime(dateTimeString: string): string {
  if (!dateTimeString.includes(' ')) {
    return dateTimeString;
  }
  
  const [dateStr, timeStr] = dateTimeString.split(' ');
  
  try {
    const date = new Date(dateStr);
    const [hours, minutes] = timeStr.split(':').map(Number);
    
    date.setHours(hours, minutes);
    
    if (isNaN(date.getTime())) {
      return dateTimeString;
    }
    
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).format(date);
  } catch (e) {
    return dateTimeString;
  }
}

export function getActivityTypeColor(type: string): { bg: string; text: string } {
  switch (type) {
    case 'check-in':
      return { bg: 'bg-blue-100', text: 'text-primary' };
    case 'breakfast':
      return { bg: 'bg-green-100', text: 'text-secondary' };
    case 'vendor':
      return { bg: 'bg-purple-100', text: 'text-purple-600' };
    case 'academic':
      return { bg: 'bg-yellow-100', text: 'text-yellow-600' };
    case 'stem':
      return { bg: 'bg-orange-100', text: 'text-orange-600' };
    case 'arts':
      return { bg: 'bg-pink-100', text: 'text-pink-600' };
    case 'recreation':
      return { bg: 'bg-blue-100', text: 'text-primary' };
    default:
      return { bg: 'bg-gray-100', text: 'text-gray-600' };
  }
}

export function getProgramPeriodColor(period: string): { color: string; textColor: string } {
  switch (period) {
    case 'before-school':
      return { color: '#4B7BEC', textColor: 'text-primary' };
    case 'after-school':
      return { color: '#26DE81', textColor: 'text-secondary' };
    default:
      return { color: '#FF6B6B', textColor: 'text-accent' };
  }
}

export function getAudienceTagColors(audience: string): { bg: string; text: string } {
  switch (audience) {
    case 'Parents':
      return { bg: 'bg-blue-100', text: 'text-primary' };
    case 'Staff':
    case 'Staff Only':
      return { bg: 'bg-purple-100', text: 'text-purple-600' };
    case 'Event':
      return { bg: 'bg-pink-100', text: 'text-pink-600' };
    default:
      return { bg: 'bg-gray-100', text: 'text-gray-600' };
  }
}

export function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

export function getAvatarLetters(name: string): string {
  if (!name) return '';
  
  const parts = name.split(' ').filter(part => part.length > 0);
  
  if (parts.length === 0) return '';
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}
