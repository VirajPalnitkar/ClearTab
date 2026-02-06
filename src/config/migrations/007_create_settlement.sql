CREATE TABLE settlement_summaries (
  id INT AUTO_INCREMENT PRIMARY KEY,
  settlement_cycle_id INT NOT NULL,
  from_user_id INT NOT NULL,
  to_user_id INT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,

  FOREIGN KEY (settlement_cycle_id) 
    REFERENCES settlement_cycles(id)
);
