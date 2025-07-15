async function findUser(User, criteria, selectedFields = {}) {
  const defaultSelect = {
    roles: 1,
    status: 1,
    _id: 1,
    username: 1,
    auth: 1
  };

  const finalSelect = Object.assign({}, defaultSelect, selectedFields);
  const query = {};
  
  if (criteria.emailHash) query.emailHash = criteria.emailHash;
  if (criteria.phoneHash) query.phoneHash = criteria.phoneHash;
  if (criteria.id) query._id = criteria.id;
  if (criteria.username) query.username = criteria.username;
  
  const user = await User.findOne(query)
    .select(finalSelect)
    .lean();
  
  return user;
}

module.exports = findUser;