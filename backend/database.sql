CREATE DATABASE IF NOT EXISTS healora_store CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE healora_store;

DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS products;

CREATE TABLE products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(160) NOT NULL,
  category VARCHAR(80) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  image_url VARCHAR(500),
  prescription_required TINYINT(1) NOT NULL DEFAULT 0,
  stock INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  customer_name VARCHAR(140) NOT NULL,
  email VARCHAR(190) NOT NULL,
  phone VARCHAR(30) NOT NULL,
  address TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  pincode VARCHAR(12) NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  status ENUM('Pending','Confirmed','Packed','Delivered','Cancelled') DEFAULT 'Pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  product_name VARCHAR(160) NOT NULL,
  quantity INT NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id)
);

INSERT INTO products (name, category, description, price, image_url, prescription_required, stock) VALUES
('Daily Wellness Multivitamin', 'Wellness', 'A demo listing for everyday wellness products. Read the label and consult a professional when needed.', 299.00, 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=800&q=80', 0, 80),
('Vitamin C Tablets', 'Vitamins', 'Sample vitamin product listing. Follow the product label and professional advice.', 189.00, 'https://images.unsplash.com/photo-1616671276441-2f2c277b8bf4?auto=format&fit=crop&w=800&q=80', 0, 65),
('Digital Thermometer', 'Devices', 'Digital thermometer for home temperature checks.', 249.00, 'https://images.unsplash.com/photo-1584634731339-252c581abfc5?auto=format&fit=crop&w=800&q=80', 0, 30),
('First Aid Kit', 'First Aid', 'A compact first-aid kit for basic household preparedness.', 399.00, 'https://images.unsplash.com/photo-1603398938378-e54eab446dde?auto=format&fit=crop&w=800&q=80', 0, 25),
('Hand Sanitizer', 'Personal Care', 'Hand hygiene product demo listing.', 99.00, 'https://images.unsplash.com/photo-1584744982491-665216d95f8b?auto=format&fit=crop&w=800&q=80', 0, 100),
('Prescription Medicine (Demo Only)', 'Prescription', 'Placeholder only. A valid prescription and pharmacist review are required before dispensing where applicable.', 120.00, 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80', 1, 10);
