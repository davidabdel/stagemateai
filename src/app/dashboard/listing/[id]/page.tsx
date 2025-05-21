import ClientPage from './ClientPage';

export default function Page({ params }: { params: { id: string } }) {
  // In Next.js 15, we need to pass the ID as a search parameter
  // to avoid issues with the dynamic route parameter
  return (
    <div>
      <ClientPage />
      <script
        dangerouslySetInnerHTML={{
          __html: `
            window.__LISTING_ID__ = "${params.id}";
          `,
        }}
      />
    </div>
  );
}