async function findUser(User, id) {
      const defaultSelect = {
        roles: 1,
        status: 1,
        _id: 1,
        username: 1,
        auth: 1
      };

      const finalSelect = Object.assign({}, defaultSelect);

    const user = await User.findById(id)
        .select(finalSelect)
        .lean();

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
  
  return user;
}

module.exports = findUser;