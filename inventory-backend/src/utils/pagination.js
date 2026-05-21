function paginate(data, page = 1, limit = 20) {
  const total = data.length
  const start = (page - 1) * limit
  const end = start + limit
  return {
    data: data.slice(start, end),
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
    },
  }
}

module.exports = { paginate }
