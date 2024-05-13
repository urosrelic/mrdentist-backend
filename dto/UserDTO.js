class UserDTO {
    constructor(id, firstName, lastName, username, role) {
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.username = username;
        this.role = role;
    }
}

module.exports = UserDTO;