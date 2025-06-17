-- Agregar constraint de foreign key faltante en reviews
-- IMPORTANTE: Ejecutar primero cleanup_orphaned_data.sql antes que este script

-- 1. Verificar que no hay datos huérfanos antes de agregar constraints
DO $$ 
BEGIN
    -- Verificar direcciones_envio
    IF EXISTS (
        SELECT 1 FROM direcciones_envio d
        WHERE d.usuario_id NOT IN (SELECT id FROM usuarios)
           OR d.usuario_id = '00000000-0000-0000-0000-000000000000'
           OR d.usuario_id IS NULL
    ) THEN
        RAISE EXCEPTION 'Hay datos huérfanos en direcciones_envio. Ejecuta cleanup_orphaned_data.sql primero.';
    END IF;
    
    -- Verificar reviews
    IF EXISTS (
        SELECT 1 FROM reviews r
        WHERE r.usuario_id NOT IN (SELECT id FROM usuarios)
           OR r.usuario_id = '00000000-0000-0000-0000-000000000000'
           OR r.usuario_id IS NULL
    ) THEN
        RAISE EXCEPTION 'Hay datos huérfanos en reviews. Ejecuta cleanup_orphaned_data.sql primero.';
    END IF;
    
    -- Verificar favoritos
    IF EXISTS (
        SELECT 1 FROM favoritos f
        WHERE f.usuario_id NOT IN (SELECT id FROM usuarios)
           OR f.usuario_id = '00000000-0000-0000-0000-000000000000'
           OR f.usuario_id IS NULL
    ) THEN
        RAISE EXCEPTION 'Hay datos huérfanos en favoritos. Ejecuta cleanup_orphaned_data.sql primero.';
    END IF;
END $$;

-- 2. Agregar foreign key constraint para usuario_id en reviews (si no existe)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'reviews_usuario_id_fkey'
    ) THEN
        ALTER TABLE public.reviews 
        ADD CONSTRAINT reviews_usuario_id_fkey 
        FOREIGN KEY (usuario_id) 
        REFERENCES public.usuarios(id) 
        ON DELETE CASCADE;
        RAISE NOTICE 'Foreign key reviews_usuario_id_fkey agregado correctamente.';
    ELSE
        RAISE NOTICE 'Foreign key reviews_usuario_id_fkey ya existe.';
    END IF;
END $$;

-- 3. Agregar foreign key constraint para usuario_id en direcciones_envio (si no existe)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'direcciones_envio_usuario_id_fkey'
    ) THEN
        ALTER TABLE public.direcciones_envio 
        ADD CONSTRAINT direcciones_envio_usuario_id_fkey 
        FOREIGN KEY (usuario_id) 
        REFERENCES public.usuarios(id) 
        ON DELETE CASCADE;
        RAISE NOTICE 'Foreign key direcciones_envio_usuario_id_fkey agregado correctamente.';
    ELSE
        RAISE NOTICE 'Foreign key direcciones_envio_usuario_id_fkey ya existe.';
    END IF;
END $$;

-- 4. Agregar foreign key constraint para usuario_id en favoritos (si no existe)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'favoritos_usuario_id_fkey'
    ) THEN
        ALTER TABLE public.favoritos 
        ADD CONSTRAINT favoritos_usuario_id_fkey 
        FOREIGN KEY (usuario_id) 
        REFERENCES public.usuarios(id) 
        ON DELETE CASCADE;
        RAISE NOTICE 'Foreign key favoritos_usuario_id_fkey agregado correctamente.';
    ELSE
        RAISE NOTICE 'Foreign key favoritos_usuario_id_fkey ya existe.';
    END IF;
END $$;

-- 5. Agregar índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_reviews_usuario_id ON public.reviews USING btree (usuario_id);
CREATE INDEX IF NOT EXISTS idx_reviews_producto_id ON public.reviews USING btree (producto_id);
CREATE INDEX IF NOT EXISTS idx_direcciones_envio_usuario_id ON public.direcciones_envio USING btree (usuario_id);

-- 6. Mensaje final
DO $$ 
BEGIN
    RAISE NOTICE 'Todos los foreign keys e índices han sido procesados correctamente.';
    RAISE NOTICE 'El sistema está listo para usar las relaciones entre tablas.';
END $$;
