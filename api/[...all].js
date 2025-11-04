import serverApp from '../server/app.js';

// Vercel serverless function adapter for the Express app
export default async function handler(req, res) {
  // serverApp is an Express application which is a callable function (req, res)
  // Call it directly so all routes mounted on the server app are handled.
  return serverApp(req, res);
}
