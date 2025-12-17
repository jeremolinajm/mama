#!/bin/bash
set -u # No usaremos -e para que un error de permiso de lectura no detenga todo el script

ROOT="$(pwd)"
BACK_OUT="$ROOT/backend_bundle.txt"
FRONT_OUT="$ROOT/frontend_bundle.txt"
INFRA_OUT="$ROOT/infra_bundle.txt"

# Verificaciones
[[ -d "$ROOT/backend" ]] || { echo "❌ No existe $ROOT/backend"; exit 1; }
[[ -d "$ROOT/frontend" ]] || { echo "❌ No existe $ROOT/frontend"; exit 1; }

# Función robusta para procesar archivos
process_files() {
    local out_file="$1"
    # Leemos la lista de archivos línea por línea
    sort -z | while IFS= read -r -d '' file; do
        # FILTRO DE SEGURIDAD:
        # grep -I detecta si el archivo es binario. Si grep cree que es binario, lo saltamos.
        if grep -qI -m 1 "" "$file"; then
            {
                printf '========== FILE: %s ==========\n' "$file"
                cat "$file"
                printf '\n\n'
            } >> "$out_file"
        else
            echo "⚠️  Saltando archivo binario: $file"
        fi
    done
}

echo "🧹 Limpiando archivos previos..."
rm -f "$BACK_OUT" "$FRONT_OUT" "$INFRA_OUT"

echo "📦 Generando backend_bundle.txt ..."
(
  cd "$ROOT/backend/"
  find . -type f \
    ! -path "*/target/*" \
    ! -path "*/.idea/*" \
    ! -path "*/.mvn/*" \
    ! -path "*/.git/*" \
    ! -name "*.jar" \
    ! -name "*.class" \
    ! -name "mvnw" \
    ! -name "mvnw.cmd" \
    -print0 | process_files "$BACK_OUT"
)

echo "📦 Generando frontend_bundle.txt ..."
(
  cd "$ROOT/frontend/src"
  find . -type f \
    ! -path "*/node_modules/*" \
    ! -path "*/.git/*" \
    ! -path "*/dist/*" \
    ! -path "*/build/*" \
    ! -path "*/coverage/*" \
    ! -name "*.jpg" ! -name "*.jpeg" ! -name "*.png" ! -name "*.gif" \
    ! -name "*.ico" ! -name "*.svg" ! -name "*.webp" \
    ! -name "*.woff" ! -name "*.woff2" ! -name "*.ttf" ! -name "*.eot" \
    ! -name "package-lock.json" \
    ! -name "yarn.lock" \
    ! -name "*.map" \
    -print0 | process_files "$FRONT_OUT"
)

# Infra es opcional
if [ -d "$ROOT/infra" ]; then
    echo "📦 Generando infra_bundle.txt ..."
    (
        cd "$ROOT/infra"
        find . -type f ! -path "*/node_modules/*" ! -path "*/.terraform/*" -print0 | process_files "$INFRA_OUT"
    )
fi

echo "✅ Listo. Archivos generados:"
ls -lh "$BACK_OUT" "$FRONT_OUT" 2>/dev/null
