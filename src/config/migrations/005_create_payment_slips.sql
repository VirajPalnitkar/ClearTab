CREATE TABLE payment_slips (
  id INT AUTO_INCREMENT PRIMARY KEY,
  from_user_id INT NOT NULL,
  to_user_id INT NOT NULL,
  group_id INT NOT NULL,
  settlement_cycle_id INT NOT NULL,

  amount DECIMAL(10,2) NOT NULL,
  reason VARCHAR(255),

  status ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (from_user_id) REFERENCES users(id),
  FOREIGN KEY (to_user_id) REFERENCES users(id),
  FOREIGN KEY (group_id) REFERENCES groups(id),
  FOREIGN KEY (settlement_cycle_id) REFERENCES settlement_cycles(id)
);
