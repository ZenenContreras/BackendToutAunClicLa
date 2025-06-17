# Tabla faltante para detalles de pedido

Basándome en la lógica del orderController, necesitas esta tabla para completar el sistema de pedidos:

```sql
create table public.detalles_pedido (
  id uuid not null default gen_random_uuid (),
  pedido_id bigint not null,
  producto_id bigint not null,
  cantidad integer not null,
  precio_unitario numeric(10, 2) not null,
  constraint detalles_pedido_pkey primary key (id),
  constraint detalles_pedido_pedido_id_fkey foreign key (pedido_id) references pedidos (id) on delete CASCADE,
  constraint detalles_pedido_producto_id_fkey foreign key (producto_id) references productos (id) on delete CASCADE,
  constraint detalles_pedido_cantidad_check check ((cantidad > 0)),
  constraint detalles_pedido_precio_check check ((precio_unitario > 0))
) TABLESPACE pg_default;

create index IF not exists idx_detalles_pedido_pedido_id on public.detalles_pedido using btree (pedido_id) TABLESPACE pg_default;
create index IF not exists idx_detalles_pedido_producto_id on public.detalles_pedido using btree (producto_id) TABLESPACE pg_default;
```

Esta tabla es necesaria para:
1. Almacenar los productos específicos de cada pedido
2. Mantener el precio al momento de la compra
3. Registrar las cantidades compradas
4. Relacionar pedidos con productos
