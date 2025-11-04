import app from './app.js';

// For persistent server deployments (Local development, Render, etc.)
const port = process.env.PORT || 3001;

// Export for serverless platforms (Vercel, Netlify functions, etc.)
export default app;

// For local development and persistent server deployments
if (process.env.NODE_ENV !== 'production' || process.env.PERSISTENT_SERVER) {
  app.listen(port, () => {
    console.log(`API server listening on port ${port}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}
