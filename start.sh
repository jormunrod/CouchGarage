#!/bin/bash

# Detect whether to use "docker compose" or "docker-compose"
if docker compose version &>/dev/null; then
  DOCKER_COMPOSE_CMD="docker compose"
else
  DOCKER_COMPOSE_CMD="docker-compose"
fi

TIMEOUT=300

wait_for_log() {
  local container=$1
  local search_text="$2"
  local elapsed=0

  printf "Esperando que '%s' esté listo en el contenedor %s" "$search_text" "$container"
  while true; do
    if docker logs "$container" --tail=50 2>/dev/null | grep -q "$search_text"; then
      printf "\n"
      break
    else
      printf "."
      sleep 2
      elapsed=$((elapsed + 2))
      if [ "$elapsed" -ge "$TIMEOUT" ]; then
        printf "\nTiempo de espera excedido para '%s' en el contenedor %s.\n" "$search_text" "$container"
        break
      fi
    fi
  done
}

start_containers() {
  local mode=$1
  if [ "$mode" -eq 1 ]; then
    echo "Iniciando la aplicación en modo PRODUCCIÓN..."
    COMPOSE_FILES="-f docker-compose.yml"
    BACKEND_CONTAINER="backend"
    FRONTEND_CONTAINER="frontend"
  else
    echo "Iniciando la aplicación en modo DESARROLLO..."
    COMPOSE_FILES="-f docker-compose.yml -f docker-compose.dev.yml"
    BACKEND_CONTAINER="backend"
    FRONTEND_CONTAINER="frontend-dev"
  fi

  $DOCKER_COMPOSE_CMD $COMPOSE_FILES up --build -d
  
  wait_for_log "$BACKEND_CONTAINER" "Server running at"

  if [ "$mode" -eq 2 ]; then
    wait_for_log "$FRONTEND_CONTAINER" "Compiled successfully!"
  else
    echo "Verificando que el contenedor $FRONTEND_CONTAINER esté en ejecución..."
    local elapsed=0
    while ! docker ps | grep -q "$FRONTEND_CONTAINER"; do
      printf "."
      sleep 2
      elapsed=$((elapsed + 2))
      if [ "$elapsed" -ge "$TIMEOUT" ]; then
        printf "\nTiempo de espera excedido para el contenedor %s.\n" "$FRONTEND_CONTAINER"
        break
      fi
    done
    echo ""
  fi

  echo "---------------------------------------"
  echo "La aplicación ha arrancado (o se terminó el tiempo de espera)."
  echo "Accesos:"
  echo "CouchDB: http://localhost:5984/_utils"
  echo "Backend: http://localhost:3000"
  if [ "$mode" -eq 2 ]; then
    echo "Frontend (Desarrollo): http://localhost:3001"
  else
    echo "Frontend (Producción): http://localhost"
  fi
  echo "---------------------------------------"
}

stop_containers() {
  echo "Deteniendo los contenedores..."
  $DOCKER_COMPOSE_CMD down
  echo "Contenedores detenidos."
}

trap 'echo -e "\n\nInterrupción detectada, deteniendo contenedores..."; stop_containers; exit 0' SIGINT SIGTERM

echo "Seleccione una opción:"
echo "1) Iniciar aplicación en modo PRODUCCIÓN"
echo "2) Iniciar aplicación en modo DESARROLLO"
echo "3) Detener contenedores"
read -p "Ingrese el número de opción (1, 2 o 3): " opcion

case $opcion in
  1)
    start_containers 1
    ;;
  2)
    start_containers 2
    ;;
  3)
    stop_containers
    exit 0
    ;;
  *)
    echo "Opción inválida. Por favor, use 1, 2 o 3."
    exit 1
    ;;
esac

echo ""
read -p "Presione cualquier tecla para detener los contenedores y salir..." -n1 -s
echo ""
stop_containers