-- Script para limpiar datos huérfanos antes de agregar foreign keys
-- Ejecutar este script ANTES que fix_foreign_keys.sql

-- 1. Verificar datos huérfanos en direcciones_envio
SELECT 'direcciones_envio huérfanas:' as tabla, COUNT(*) as cantidad
FROM direcciones_envio d
WHERE d.usuario_id NOT IN (SELECT id FROM usuarios)
   OR d.usuario_id = '00000000-0000-0000-0000-000000000000'
   OR d.usuario_id IS NULL;

-- 2. Verificar datos huérfanos en reviews
SELECT 'reviews huérfanas:' as tabla, COUNT(*) as cantidad
FROM reviews r
WHERE r.usuario_id NOT IN (SELECT id FROM usuarios)
   OR r.usuario_id = '00000000-0000-0000-0000-000000000000'
   OR r.usuario_id IS NULL;

-- 3. Verificar datos huérfanos en favoritos
SELECT 'favoritos huérfanos:' as tabla, COUNT(*) as cantidad
FROM favoritos f
WHERE f.usuario_id NOT IN (SELECT id FROM usuarios)
   OR f.usuario_id = '00000000-0000-0000-0000-000000000000'
   OR f.usuario_id IS NULL;

-- 4. LIMPIAR datos huérfanos en direcciones_envio
DELETE FROM direcciones_envio 
WHERE usuario_id NOT IN (SELECT id FROM usuarios)
   OR usuario_id = '00000000-0000-0000-0000-000000000000'
   OR usuario_id IS NULL;

-- 5. LIMPIAR datos huérfanos en reviews
DELETE FROM reviews 
WHERE usuario_id NOT IN (SELECT id FROM usuarios)
   OR usuario_id = '00000000-0000-0000-0000-000000000000'
   OR usuario_id IS NULL;

-- 6. LIMPIAR datos huérfanos en favoritos
DELETE FROM favoritos 
WHERE usuario_id NOT IN (SELECT id FROM usuarios)
   OR usuario_id = '00000000-0000-0000-0000-000000000000'
   OR usuario_id IS NULL;

-- 7. Verificar que ya no hay datos huérfanos
SELECT 'direcciones_envio después de limpieza:' as tabla, COUNT(*) as cantidad
FROM direcciones_envio d
WHERE d.usuario_id NOT IN (SELECT id FROM usuarios)
   OR d.usuario_id = '00000000-0000-0000-0000-000000000000'
   OR d.usuario_id IS NULL;

SELECT 'reviews después de limpieza:' as tabla, COUNT(*) as cantidad
FROM reviews r
WHERE r.usuario_id NOT IN (SELECT id FROM usuarios)
   OR r.usuario_id = '00000000-0000-0000-0000-000000000000'
   OR r.usuario_id IS NULL;

SELECT 'favoritos después de limpieza:' as tabla, COUNT(*) as cantidad
FROM favoritos f
WHERE f.usuario_id NOT IN (SELECT id FROM usuarios)
   OR f.usuario_id = '00000000-0000-0000-0000-000000000000'
   OR f.usuario_id IS NULL;
