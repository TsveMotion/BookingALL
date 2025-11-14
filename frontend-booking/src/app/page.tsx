import { redirect } from 'next/navigation';

export default function Home() {
  redirect('/business/demo');
  return null;
}
