CREATE TABLE IF NOT EXISTS group_invitations(
    id INT AUTO_INCREMENT PRIMARY KEY,
    group_id INT NOT NULL,
    invited_user_id INT NOT NULL,
    invited_by_user_id INT NOT NULL,
    status ENUM("accepted","pending","rejected") DEFAULT "pending",
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE KEY unique_invite (group_id, invited_user_id),
    FOREIGN KEY(group_id) REFERENCES USER_GROUPS(id),
    FOREIGN KEY(invited_by_user_id) REFERENCES USERS(id),
    FOREIGN KEY(invited_user_id)  REFERENCES USERS(id)
);