-- Tabla usuarios para reemplazar la tabla users existente
-- Estructura completa con campos en español y funciones de seguridad avanzadas

-- Tabla usuarios (reemplaza users)
CREATE TABLE IF NOT EXISTS usuarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    correo_electronico VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100),
    telefono VARCHAR(20),
    rol VARCHAR(20) DEFAULT 'cliente' CHECK (rol IN ('cliente', 'admin')),
    
    -- Campos de verificación y seguridad
    verificado BOOLEAN DEFAULT false,
    autenticacion_social BOOLEAN DEFAULT false,
    token_verificacion_email VARCHAR(255),
    fecha_expiracion_token TIMESTAMP WITH TIME ZONE,
    
    -- Campos de seguridad para intentos de login
    intentos_login_fallidos INTEGER DEFAULT 0,
    cuenta_bloqueada BOOLEAN DEFAULT false,
    fecha_bloqueo TIMESTAMP WITH TIME ZONE,
    ip_ultimo_acceso INET,
    fecha_ultimo_acceso TIMESTAMP WITH TIME ZONE,
    
    -- Campos de Stripe
    stripe_customer_id VARCHAR(255),
    
    -- Campos de estado
    activo BOOLEAN DEFAULT true,
    fecha_eliminacion TIMESTAMP WITH TIME ZONE,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para optimización
CREATE INDEX IF NOT EXISTS idx_usuarios_correo ON usuarios(correo_electronico);
CREATE INDEX IF NOT EXISTS idx_usuarios_rol ON usuarios(rol);
CREATE INDEX IF NOT EXISTS idx_usuarios_verificado ON usuarios(verificado);
CREATE INDEX IF NOT EXISTS idx_usuarios_activo ON usuarios(activo);
CREATE INDEX IF NOT EXISTS idx_usuarios_cuenta_bloqueada ON usuarios(cuenta_bloqueada);

-- Función para actualizar fecha_actualizacion
CREATE OR REPLACE FUNCTION update_usuarios_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.fecha_actualizacion = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para actualizar fecha_actualizacion automáticamente
CREATE TRIGGER update_usuarios_updated_at 
    BEFORE UPDATE ON usuarios 
    FOR EACH ROW 
    EXECUTE FUNCTION update_usuarios_updated_at();

-- Función para resetear intentos de login fallidos después de login exitoso
CREATE OR REPLACE FUNCTION reset_failed_login_attempts()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.fecha_ultimo_acceso IS DISTINCT FROM OLD.fecha_ultimo_acceso AND 
       NEW.fecha_ultimo_acceso IS NOT NULL THEN
        NEW.intentos_login_fallidos = 0;
        NEW.cuenta_bloqueada = false;
        NEW.fecha_bloqueo = NULL;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para resetear intentos fallidos en login exitoso
CREATE TRIGGER reset_failed_login_attempts_trigger
    BEFORE UPDATE ON usuarios
    FOR EACH ROW
    EXECUTE FUNCTION reset_failed_login_attempts();

-- Actualizar tablas existentes para usar usuarios en lugar de users
-- Nota: Esto debe hacerse después de migrar los datos existentes

-- Comentar estas líneas si necesitas mantener la tabla users temporalmente
-- ALTER TABLE addresses DROP CONSTRAINT IF EXISTS addresses_user_id_fkey;
-- ALTER TABLE cart_items DROP CONSTRAINT IF EXISTS cart_items_user_id_fkey;
-- ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_user_id_fkey;
-- ALTER TABLE reviews DROP CONSTRAINT IF EXISTS reviews_user_id_fkey;

-- Agregar nuevas foreign keys (descomenta después de migrar datos)
-- ALTER TABLE addresses ADD CONSTRAINT addresses_usuario_id_fkey 
--     FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE;
-- ALTER TABLE cart_items ADD CONSTRAINT cart_items_usuario_id_fkey 
--     FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE;
-- ALTER TABLE orders ADD CONSTRAINT orders_usuario_id_fkey 
--     FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE;
-- ALTER TABLE reviews ADD CONSTRAINT reviews_usuario_id_fkey 
--     FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE;

-- RLS (Row Level Security) para usuarios
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad para usuarios
CREATE POLICY "Los usuarios pueden ver su propio perfil" ON usuarios 
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Los usuarios pueden actualizar su propio perfil" ON usuarios 
    FOR UPDATE USING (auth.uid() = id);

-- Los administradores pueden ver todos los usuarios
CREATE POLICY "Los administradores pueden ver todos los usuarios" ON usuarios 
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM usuarios 
            WHERE usuarios.id = auth.uid() 
            AND usuarios.rol = 'admin'
        )
    );

-- Los administradores pueden actualizar roles de usuarios
CREATE POLICY "Los administradores pueden actualizar usuarios" ON usuarios 
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM usuarios 
            WHERE usuarios.id = auth.uid() 
            AND usuarios.rol = 'admin'
        )
    );
