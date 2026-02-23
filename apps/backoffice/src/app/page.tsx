import { redirect } from 'next/navigation'

// La raíz redirige al dashboard principal
export default function RootPage() {
    redirect('/dashboard')
}
