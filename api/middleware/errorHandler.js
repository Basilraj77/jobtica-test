
/**
 * Centralized error handler for the Express app.
 * This middleware should be the LAST one added with app.use().
 * It catches any errors passed via next(error) from other routes.
 */
export const errorHandler = (err, req, res, next) => {
    // Log the error for debugging purposes on the server.
    // In a production environment, you might use a more robust logging service.
    console.error(err);

    // Send a generic, non-revealing error message to the client.
    res.status(500).json({ message: 'Internal Server Error' });
};
