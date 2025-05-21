import ClientPage from './ClientPage';

// In Next.js 15, we need to use a simpler approach without params typing
export default function Page(props: any) {
  // Extract the ID from the URL path segment
  const id = props?.params?.id || '';
  
  return (
    <div>
      <ClientPage />
      <script
        dangerouslySetInnerHTML={{
          __html: `
            window.__LISTING_ID__ = "${id}";
          `,
        }}
      />
    </div>
  );
}