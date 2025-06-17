# 🔧 Solución para Error de Foreign Keys

## Problema
```
ERROR: 23503: insert or update on table "direcciones_envio" violates foreign key constraint "direcciones_envio_usuario_id_fkey"
DETAIL: Key (usuario_id)=(00000000-0000-0000-0000-000000000000) is not present in table "usuarios".
```

## Causa
Hay datos huérfanos en las tablas `direcciones_envio`, `reviews` y `favoritos` que referencian usuarios que no existen en la tabla `usuarios`.

## Solución en 3 Pasos

### Paso 1: Verificar datos huérfanos
```bash
npm run prepare-db
```

### Paso 2: Limpiar datos huérfanos en Supabase
Ejecuta este SQL en tu dashboard de Supabase:

```sql
-- Copiar y pegar el contenido de: database/cleanup_orphaned_data.sql
```

### Paso 3: Agregar foreign keys en Supabase
Ejecuta este SQL en tu dashboard de Supabase:

```sql
-- Copiar y pegar el contenido de: database/fix_foreign_keys.sql
```

### Paso 4: Verificar que todo funciona
```bash
npm run test:complete
npm run test:reviews
npm run test:addresses
```

## Scripts Disponibles

- `database/cleanup_orphaned_data.sql` - Limpia datos huérfanos
- `database/fix_foreign_keys.sql` - Agrega foreign keys de forma segura
- `scripts/prepare-database.js` - Verificación automatizada

## ¿Por qué pasa esto?

1. **UUID nulos**: Algunos registros tienen `usuario_id = '00000000-0000-0000-0000-000000000000'`
2. **Referencias rotas**: Hay datos que apuntan a usuarios eliminados
3. **Foreign keys faltantes**: No había restricciones que previnieran esto

## Después de la corrección

- ✅ Los foreign keys impedirán datos huérfanos futuros
- ✅ Las relaciones entre tablas funcionarán correctamente  
- ✅ Los tests de reviews, direcciones y favoritos pasarán al 100%
- ✅ Supabase podrá hacer JOINs entre `reviews` ↔ `usuarios`

## Estado Final Esperado

```
✅ reviews_usuario_id_fkey agregado correctamente
✅ direcciones_envio_usuario_id_fkey agregado correctamente  
✅ favoritos_usuario_id_fkey agregado correctamente
✅ Índices de performance creados
✅ Sistema listo para producción
```
