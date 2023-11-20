export const users = [
    {
        username: "user",
        email: "user@mail.dk",
        password: "$2b$10$workvbT4qySIHnav4xEsYeFKKkUr7F3wghsfv8si2yIHS1o8DRlwC",
        role: "user"
    },
    {
        username: "admin",
        email: "admin@mail.dk",
        password: "$2b$10$y1DuVu3DhYTXLSXjK2k2Mukv/AMdTd.W2lhWC38xMPd3A8ScoPyDy",
        role: "admin"
    }
];

export function createUser(username, email, password){
    const newUser = {
        username,
        email,
        password,
        role: "user"
    };
    users.push(newUser);
}

export function findUserByUsername(username){
    return users.find(user => user.username === username);
}