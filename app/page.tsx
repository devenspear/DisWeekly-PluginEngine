export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="max-w-2xl text-center">
        <h1 className="text-4xl font-bold mb-4">
          Disruption Weekly - Processing Engine
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Next.js backend for the Disruption Weekly URL Writer workflow
        </p>
        <div className="bg-gray-100 rounded-lg p-6 text-left mb-6">
          <h2 className="font-semibold mb-2">API Endpoints:</h2>
          <ul className="space-y-2 text-sm font-mono">
            <li>
              <span className="text-blue-600">GET</span> /api/url-writer/ping
            </li>
            <li>
              <span className="text-green-600">POST</span> /api/url-writer/process
            </li>
          </ul>
        </div>
        <a
          href="/admin"
          className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors mb-4"
        >
          🔧 Admin Dashboard
        </a>
        <p className="text-sm text-gray-500 mt-4">
          See README.md for complete documentation
        </p>
      </div>
    </main>
  );
}
