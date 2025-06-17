-- Esquema de usuarios actualizado basado en la estructura real
-- Este esquema coincide exactamente con la tabla usuarios proporcionada

-- Función para actualizar fecha_actualizacion
CREATE OR REPLACE FUNCTION update_fecha_actualizacion()
RETURNS TRIGGER AS $$
BEGIN
    NEW.fecha_actualizacion = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Tabla de usuarios actualizada
CREATE TABLE IF NOT EXISTS public.usuarios (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  correo_electronico text NOT NULL,
  telefono text NULL,
  url_avatar text NULL,
  verificado boolean NULL DEFAULT false,
  autenticacion_social boolean NOT NULL DEFAULT false,
  fecha_creacion timestamp with time zone NULL DEFAULT now(),
  fecha_actualizacion timestamp with time zone NULL DEFAULT now(),
  nombre text NULL,
  intentos_login_fallidos integer NULL DEFAULT 0,
  fecha_ultimo_login timestamp with time zone NULL,
  cuenta_bloqueada boolean NULL DEFAULT false,
  fecha_bloqueo timestamp with time zone NULL,
  razon_bloqueo text NULL,
  token_verificacion_email text NULL,
  fecha_expiracion_token timestamp with time zone NULL,
  ip_ultimo_acceso inet NULL,
  fecha_cambio_contrasena timestamp with time zone NULL,
  requiere_cambio_contrasena boolean NULL DEFAULT false,
  dispositivos_confiables jsonb NULL DEFAULT '[]'::jsonb,
  
  CONSTRAINT usuarios_pkey PRIMARY KEY (id),
  CONSTRAINT usuarios_email_key UNIQUE (correo_electronico),
  CONSTRAINT usuarios_token_verificacion_unique UNIQUE (token_verificacion_email),
  CONSTRAINT usuarios_email_check CHECK (
    correo_electronico ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'::text
  ),
  CONSTRAINT usuarios_intentos_login_check CHECK (
    (intentos_login_fallidos >= 0) AND (intentos_login_fallidos <= 10)
  )
) TABLESPACE pg_default;

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_usuarios_correo_electronico 
  ON public.usuarios USING btree (correo_electronico) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_usuarios_verificado 
  ON public.usuarios USING btree (verificado) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_usuarios_cuenta_bloqueada 
  ON public.usuarios USING btree (cuenta_bloqueada) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_usuarios_token_verificacion 
  ON public.usuarios USING btree (token_verificacion_email) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_usuarios_fecha_ultimo_login 
  ON public.usuarios USING btree (fecha_ultimo_login) TABLESPACE pg_default;

-- Trigger para actualizar fecha_actualizacion
CREATE TRIGGER trigger_update_fecha_actualizacion 
  BEFORE UPDATE ON usuarios 
  FOR EACH ROW 
  EXECUTE FUNCTION update_fecha_actualizacion();

-- Tabla de direcciones de envío (actualizada)
CREATE TABLE IF NOT EXISTS direcciones_envio (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    direccion VARCHAR(500) NOT NULL,
    ciudad VARCHAR(100) NOT NULL,
    estado VARCHAR(100) NOT NULL,
    codigo_postal VARCHAR(20) NOT NULL,
    pais VARCHAR(100) NOT NULL,
    telefono VARCHAR(20),
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Resto de tablas con nombres en español
CREATE TABLE IF NOT EXISTS categorias (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    imagen_url VARCHAR(500),
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS productos (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    nombre VARCHAR(200) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10,2) NOT NULL,
    categoria_id BIGINT REFERENCES categorias(id),
    imagen_principal VARCHAR(500),
    stock INTEGER DEFAULT 0,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS carrito_productos (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    producto_id BIGINT NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
    cantidad INTEGER NOT NULL DEFAULT 1,
    fecha_agregado TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(usuario_id, producto_id)
);

CREATE TABLE IF NOT EXISTS pedidos (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    usuario_id UUID NOT NULL REFERENCES usuarios(id),
    direccion_envio_id BIGINT NOT NULL REFERENCES direcciones_envio(id),
    total DECIMAL(10,2) NOT NULL,
    estado VARCHAR(50) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'procesando', 'enviado', 'entregado', 'cancelado')),
    stripe_payment_intent_id VARCHAR(255),
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS detalles_pedido (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    pedido_id BIGINT NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
    producto_id BIGINT NOT NULL REFERENCES productos(id),
    cantidad INTEGER NOT NULL,
    precio DECIMAL(10,2) NOT NULL
);

CREATE TABLE IF NOT EXISTS reviews (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    producto_id BIGINT NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
    estrellas INTEGER NOT NULL CHECK (estrellas >= 1 AND estrellas <= 5),
    comentario TEXT,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(usuario_id, producto_id)
);

-- Índices adicionales
CREATE INDEX IF NOT EXISTS idx_productos_categoria ON productos(categoria_id);
CREATE INDEX IF NOT EXISTS idx_carrito_usuario ON carrito_productos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_usuario ON pedidos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_detalles_pedido ON detalles_pedido(pedido_id);
CREATE INDEX IF NOT EXISTS idx_reviews_producto ON reviews(producto_id);
CREATE INDEX IF NOT EXISTS idx_direcciones_usuario ON direcciones_envio(usuario_id);
