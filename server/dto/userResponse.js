export function mapResponse(users) {
  const usersDTO = users.map((user) => user.username);
  return usersDTO;
}

export function createUserResponse(user) {
  return {
    username: user.username,
    email: user.email,
    role: user.role,
    address: user.address,
  };
}
