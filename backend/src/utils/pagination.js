const paginate = (query, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  return { skip, limit: parseInt(limit) };
};

const paginateResponse = (data, total, page, limit) => ({
  data,
  pagination: {
    total,
    page: parseInt(page),
    limit: parseInt(limit),
    totalPages: Math.ceil(total / limit),
    hasNext: parseInt(page) < Math.ceil(total / limit),
    hasPrev: parseInt(page) > 1,
  },
});

module.exports = { paginate, paginateResponse };
