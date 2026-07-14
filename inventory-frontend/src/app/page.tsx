import { redirect } from 'next/navigation'

export default function Home() {
  // The app layout bounces you to /login if there is no token.
  redirect('/inventory')
}
