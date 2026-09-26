export const notFound = (req, res) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
};

export const errorHandler = (error, req, res, next) => {
  const statusCode = error.statusCode || (error.name === 'CastError' || error.name === 'ValidationError' ? 400 : 500);
  const message = statusCode === 500 && process.env.NODE_ENV === 'production'
    ? 'An unexpected server error occurred.'
    : error.message || 'An unexpected server error occurred.';

  if (process.env.NODE_ENV !== 'test') console.error(error);
  res.status(statusCode).json({ message });
};
