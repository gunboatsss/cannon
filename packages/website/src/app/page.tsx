import HomePage from '@/features/HomePage/HomePage';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cannon',
  description: '...',
};

export default function Home() {
  return <HomePage />;
}