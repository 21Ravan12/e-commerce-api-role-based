async function assignRoles(User, id, roles) {
  const updatedUser = await User.findByIdAndUpdate(
    id,
    { roles },
    { new: true }
  );
  
  return updatedUser;
}

module.exports = assignRoles;