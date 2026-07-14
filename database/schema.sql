-- Money Journal - Database Schema
-- Sesuai ERD: User, Transaction, Review, Goal, Tag, Transaction_Tag

CREATE DATABASE IF NOT EXISTS money_journal;
USE money_journal;

CREATE TABLE users (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  nama VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE transactions (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id CHAR(36) NOT NULL,
  judul VARCHAR(150) NOT NULL,
  nominal DECIMAL(14,2) NOT NULL,
  kategori VARCHAR(50) NOT NULL,
  jenis ENUM('kebutuhan', 'keinginan', 'investasi') NOT NULL,
  mood ENUM('senang', 'biasa', 'netral', 'sedih') DEFAULT NULL,
  catatan TEXT,
  attachment_url VARCHAR(500) DEFAULT NULL,
  tanggal DATE NOT NULL,
  reminder_date DATE DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE reviews (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  transaction_id CHAR(36) NOT NULL UNIQUE,
  rating TINYINT CHECK (rating BETWEEN 1 AND 5),
  pelajaran TEXT,
  reviewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE
);

CREATE TABLE goals (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id CHAR(36) NOT NULL,
  nama VARCHAR(100) NOT NULL,
  target DECIMAL(14,2) NOT NULL,
  current DECIMAL(14,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE tags (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  nama VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE transaction_tags (
  transaction_id CHAR(36) NOT NULL,
  tag_id CHAR(36) NOT NULL,
  PRIMARY KEY (transaction_id, tag_id),
  FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

CREATE INDEX idx_transactions_user_tanggal ON transactions(user_id, tanggal);
CREATE INDEX idx_transactions_reminder ON transactions(reminder_date);
