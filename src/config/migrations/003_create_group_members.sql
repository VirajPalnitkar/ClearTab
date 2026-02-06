CREATE TABLE IF NOT EXISTS GROUP_MEMBERS(
    id INT AUTO_INCREMENT PRIMARY KEY,
    group_id INT NOT NULL,
    user_id INT NOT NULL,
    UNIQUE KEY unique_membership(group_id,user_id),
    FOREIGN KEY(group_id) REFERENCES GROUPS(id),
    FOREIGN KEY(user_id)   REFERENCES USERS(id)
)