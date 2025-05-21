import ClientPage from './ClientPage';

// In Next.js 15, we're going to let the ClientPage component get the ID from the URL
// This avoids issues with the params type in the server component
export default function Page() {
  return <ClientPage />;
}