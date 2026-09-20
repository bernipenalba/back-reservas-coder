export const validateBody = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      status: 'error',
      message: result.error.issues.map((issue) => issue.message).join(', '),
    });
  }

  req.body = result.data;
  next();
};

export const validateParams = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.params);

  if (!result.success) {
    return res.status(400).json({
      status: 'error',
      message: result.error.issues.map((issue) => issue.message).join(', '),
    });
  }

  req.params = result.data;
  next();
};
