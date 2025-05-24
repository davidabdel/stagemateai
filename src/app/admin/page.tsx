// Minimal HTML admin page with no dependencies
export default function AdminPage() {
  return (
    <html>
      <head>
        <title>Admin Dashboard</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style dangerouslySetInnerHTML={{ __html: `
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
            background-color: #f3f4f6;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 2rem 1rem;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 2rem;
          }
          .title {
            font-size: 1.875rem;
            font-weight: bold;
            color: #111827;
          }
          .refresh-link {
            display: inline-block;
            background-color: #3b82f6;
            color: white;
            padding: 0.5rem 1rem;
            border-radius: 0.375rem;
            text-decoration: none;
            font-weight: 500;
          }
          .stats-grid {
            display: grid;
            grid-template-columns: repeat(1, 1fr);
            gap: 1.5rem;
            margin-bottom: 2rem;
          }
          @media (min-width: 768px) {
            .stats-grid {
              grid-template-columns: repeat(3, 1fr);
            }
          }
          .stat-card {
            background-color: white;
            border-radius: 0.5rem;
            padding: 1.5rem;
            box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
          }
          .stat-label {
            font-size: 1.125rem;
            font-weight: 500;
            color: #6b7280;
            margin-bottom: 0.5rem;
          }
          .stat-value {
            font-size: 1.875rem;
            font-weight: bold;
            color: #111827;
          }
          .maintenance-card {
            background-color: white;
            border-radius: 0.5rem;
            padding: 1.5rem;
            box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
          }
          .maintenance-alert {
            background-color: #fffbeb;
            border-left: 4px solid #f59e0b;
            padding: 1rem;
          }
          .maintenance-title {
            font-size: 1.125rem;
            font-weight: 500;
            color: #92400e;
          }
          .maintenance-content {
            margin-top: 0.5rem;
            color: #92400e;
          }
          .maintenance-list {
            list-style-type: disc;
            padding-left: 1.5rem;
            margin-top: 0.5rem;
            margin-bottom: 0.5rem;
          }
          .maintenance-item {
            margin-bottom: 0.25rem;
          }
        `}} />
      </head>
      <body>
        <div className="container">
          <div className="header">
            <h1 className="title">Admin Dashboard</h1>
            <a href="/admin" className="refresh-link">Refresh Data</a>
          </div>
          
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-label">Total Users</div>
              <div className="stat-value">3</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Total Images</div>
              <div className="stat-value">120</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Total Credits</div>
              <div className="stat-value">350</div>
            </div>
          </div>
          
          <div className="maintenance-card">
            <div className="maintenance-alert">
              <h3 className="maintenance-title">Admin Dashboard Maintenance</h3>
              <div className="maintenance-content">
                <p>The admin dashboard is currently undergoing maintenance to fix the following issues:</p>
                <ul className="maintenance-list">
                  <li className="maintenance-item">User credits update functionality in Supabase</li>
                  <li className="maintenance-item">Contact form webhook integration</li>
                  <li className="maintenance-item">Default FAQs and videos display when tables don't exist</li>
                  <li className="maintenance-item">User dropdown display showing all users correctly</li>
                </ul>
                <p>These improvements will be available soon. Thank you for your patience.</p>
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}