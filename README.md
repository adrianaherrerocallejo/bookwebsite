# descifrAndo munDos

Web estatica reconstruida desde Neocities y preparada para publicarse en GitHub Pages.

## Probar en local

No abras `index.html` directamente con doble clic, porque el menu y el footer se cargan con `fetch()` y el navegador puede bloquearlo.

Desde esta carpeta, ejecuta:

```powershell
node server.js
```

Despues abre:

```text
http://localhost:8000
```

## Subir a GitHub Pages

1. Crea un repositorio en GitHub.
2. Sube todos los archivos de esta carpeta.
3. En GitHub, entra en `Settings` -> `Pages`.
4. En `Build and deployment`, elige `Deploy from a branch`.
5. Selecciona la rama `main` y la carpeta `/root`.
6. Guarda los cambios.

GitHub te dara una URL parecida a:

```text
https://tu-usuario.github.io/nombre-del-repo/
```

## Supabase

La web incluye `supabase.js` con una clave publicable de Supabase y usa Supabase para guardar las entradas.

Para preparar la base de datos:

1. Entra en Supabase.
2. Abre `SQL Editor`.
3. Copia y ejecuta el contenido de `supabase-schema.sql`.
4. Ve a `Authentication` -> `Users`.
5. Crea tu usuario admin con email y contrasena.
6. Ve a `Authentication` -> `URL Configuration`.
7. Anade la URL final de GitHub Pages como URL permitida.

Permisos configurados:

- Cualquier persona puede leer entradas publicas.
- Solo un usuario autenticado puede crear, editar o borrar datos.

Para publicar nuevas entradas:

1. Entra en `login.html`.
2. Inicia sesion con tu usuario de Supabase.
3. Vuelve a la seccion que quieras editar.
4. Los formularios apareceran para ti.

Las demas personas no veran los formularios, solo las entradas guardadas.
