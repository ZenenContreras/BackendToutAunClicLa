-- Datos de ejemplo para testing y desarrollo
-- Ejecutar después del schema principal

-- Insertar productos de ejemplo
INSERT INTO products (id, name, description, price, category_id, images, stock, is_active) VALUES
(
  uuid_generate_v4(),
  'iPhone 14 Pro Max',
  'El iPhone más avanzado con chip A16 Bionic, sistema de cámaras Pro de 48MP y pantalla Super Retina XDR de 6.7 pulgadas.',
  1199.99,
  (SELECT id FROM categories WHERE name = 'Electronics' LIMIT 1),
  '["https://example.com/iphone14-1.jpg", "https://example.com/iphone14-2.jpg"]',
  50,
  true
),
(
  uuid_generate_v4(),
  'MacBook Air M2',
  'Laptop ultradelgada con chip M2, pantalla Liquid Retina de 13.6 pulgadas y hasta 18 horas de duración de batería.',
  1399.99,
  (SELECT id FROM categories WHERE name = 'Electronics' LIMIT 1),
  '["https://example.com/macbook-1.jpg", "https://example.com/macbook-2.jpg"]',
  25,
  true
),
(
  uuid_generate_v4(),
  'Nike Air Max 270',
  'Zapatillas deportivas con amortiguación Air Max para máximo comfort y estilo urbano.',
  149.99,
  (SELECT id FROM categories WHERE name = 'Sports' LIMIT 1),
  '["https://example.com/nike-1.jpg", "https://example.com/nike-2.jpg"]',
  100,
  true
),
(
  uuid_generate_v4(),
  'Camiseta Polo Ralph Lauren',
  'Camiseta polo clásica de algodón 100% con logo bordado, disponible en varios colores.',
  89.99,
  (SELECT id FROM categories WHERE name = 'Clothing' LIMIT 1),
  '["https://example.com/polo-1.jpg", "https://example.com/polo-2.jpg"]',
  75,
  true
),
(
  uuid_generate_v4(),
  'Mesa de Centro Modern',
  'Mesa de centro de madera maciza con diseño minimalista, perfecta para salas modernas.',
  299.99,
  (SELECT id FROM categories WHERE name = 'Home & Garden' LIMIT 1),
  '["https://example.com/mesa-1.jpg", "https://example.com/mesa-2.jpg"]',
  15,
  true
),
(
  uuid_generate_v4(),
  'El Arte de la Guerra - Sun Tzu',
  'Clásico tratado de estrategia militar y filosofía aplicable a los negocios y la vida.',
  19.99,
  (SELECT id FROM categories WHERE name = 'Books' LIMIT 1),
  '["https://example.com/book-1.jpg"]',
  200,
  true
),
(
  uuid_generate_v4(),
  'Auriculares Sony WH-1000XM5',
  'Auriculares inalámbricos con cancelación de ruido líder en la industria y hasta 30 horas de batería.',
  399.99,
  (SELECT id FROM categories WHERE name = 'Electronics' LIMIT 1),
  '["https://example.com/sony-1.jpg", "https://example.com/sony-2.jpg"]',
  40,
  true
),
(
  uuid_generate_v4(),
  'Bicicleta de Montaña Trek',
  'Bicicleta de montaña con marco de aluminio, 21 velocidades y suspensión delantera.',
  899.99,
  (SELECT id FROM categories WHERE name = 'Sports' LIMIT 1),
  '["https://example.com/bike-1.jpg", "https://example.com/bike-2.jpg"]',
  12,
  true
),
(
  uuid_generate_v4(),
  'Jeans Levi\'s 501 Original',
  'Jeans clásicos de corte recto, fabricados con denim de alta calidad.',
  79.99,
  (SELECT id FROM categories WHERE name = 'Clothing' LIMIT 1),
  '["https://example.com/jeans-1.jpg", "https://example.com/jeans-2.jpg"]',
  120,
  true
),
(
  uuid_generate_v4(),
  'Set de Jardinería Premium',
  'Kit completo de herramientas de jardinería con mango ergonómico y bolsa de transporte.',
  149.99,
  (SELECT id FROM categories WHERE name = 'Home & Garden' LIMIT 1),
  '["https://example.com/garden-1.jpg", "https://example.com/garden-2.jpg"]',
  30,
  true
);

-- Insertar usuario de ejemplo para admin
INSERT INTO users (id, email, password, first_name, last_name, phone, role, is_active) VALUES
(
  uuid_generate_v4(),
  'admin@toutaunclicla.com',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewH5ajVb07n8Z8zK', -- password: admin123
  'Admin',
  'User',
  '+1234567890',
  'admin',
  true
),
(
  uuid_generate_v4(),
  'customer@example.com',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewH5ajVb07n8Z8zK', -- password: admin123
  'Juan',
  'Pérez',
  '+0987654321',
  'customer',
  true
);

-- Insertar direcciones de ejemplo para el customer
INSERT INTO addresses (user_id, street, city, state, zip_code, country, is_default) VALUES
(
  (SELECT id FROM users WHERE email = 'customer@example.com' LIMIT 1),
  'Calle Principal 123',
  'Madrid',
  'Madrid',
  '28001',
  'España',
  true
),
(
  (SELECT id FROM users WHERE email = 'customer@example.com' LIMIT 1),
  'Avenida Secundaria 456',
  'Barcelona',
  'Cataluña',
  '08001',
  'España',
  false
);

-- Insertar algunas reseñas de ejemplo
INSERT INTO reviews (user_id, product_id, rating, comment) VALUES
(
  (SELECT id FROM users WHERE email = 'customer@example.com' LIMIT 1),
  (SELECT id FROM products WHERE name = 'iPhone 14 Pro Max' LIMIT 1),
  5,
  'Excelente teléfono, la cámara es increíble y la batería dura todo el día.'
),
(
  (SELECT id FROM users WHERE email = 'customer@example.com' LIMIT 1),
  (SELECT id FROM products WHERE name = 'Nike Air Max 270' LIMIT 1),
  4,
  'Muy cómodas para correr, aunque el precio es un poco alto.'
),
(
  (SELECT id FROM users WHERE email = 'customer@example.com' LIMIT 1),
  (SELECT id FROM products WHERE name = 'MacBook Air M2' LIMIT 1),
  5,
  'Perfecta para trabajo y estudios. La velocidad del M2 es impresionante.'
);
