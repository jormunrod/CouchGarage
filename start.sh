#!/bin/bash
# =============================================================================
# Project: CouchGarage
# Description: This script manages the lifecycle of the CouchGarage environment.
# It can start the application in production or development mode, stop the containers,
# check the installation of Docker and Docker Compose, and provide project information.
# =============================================================================

# Clear the terminal
clear

# Display the banner
cat <<'EOF'
    ____                 _          
  / ___|___  _   _  ___| |__       
 | |   / _ \| | | |/ __| '_ \      
 | |__| (_) | |_| | (__| | | |     
  \____\___/ \__,_|\___|_| |_|     
  / ___| __ _ _ __ __ _  __ _  ___ 
 | |  _ / _` | '__/ _` |/ _` |/ _ \
 | |_| | (_| | | | (_| | (_| |  __/
  \____|\__,_|_|  \__,_|\__, |\___|
                        |___/       
Made with ♥ by:
  @alepez12
  @jormunrod
EOF

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Detect whether to use "docker compose" or "docker-compose"
if docker compose version &>/dev/null; then
  DOCKER_COMPOSE_CMD="docker compose"
else
  DOCKER_COMPOSE_CMD="docker-compose"
fi

TIMEOUT=300

# Function: check_env_file
# Description: Warn the user if the .env file does not exist.
check_env_file() {
  if [ ! -f .env ]; then
    echo -e "${YELLOW}WARNING: It seems that the .env file is missing. Environment variables may not be set correctly.${NC}"
  fi
}

# Function: wait_for_log
# Description: Wait until a specific log message is found in a container's logs.
wait_for_log() {
  local container=$1
  local search_text="$2"
  local elapsed=0
  printf "${CYAN}Waiting in container ${YELLOW}%s${CYAN} for signal: '${YELLOW}%s${CYAN}'${NC}" "$container" "$search_text"
  while true; do
    if docker logs "$container" --tail=50 2>/dev/null | grep -q "$search_text"; then
      printf "\n${GREEN}Signal received in ${YELLOW}%s${GREEN}!${NC}\n" "$container"
      break
    else
      printf "."
      sleep 2
      elapsed=$((elapsed + 2))
      if [ "$elapsed" -ge "$TIMEOUT" ]; then
        printf "\n${RED}Timeout reached waiting for signal '%s' in container %s.${NC}\n" "$search_text" "$container"
        break
      fi
    fi
  done
}

# Function: start_containers
# Description: Start the application containers in production or development mode.
start_containers() {
  # Check for .env file and warn if missing
  check_env_file
  
  local mode=$1
  if [ "$mode" -eq 1 ]; then
    echo -e "${GREEN}\nStarting application in ${YELLOW}PRODUCTION${NC} mode..."
    COMPOSE_FILES="-f docker-compose.yml"
    BACKEND_CONTAINER="backend"
    FRONTEND_CONTAINER="frontend"
  else
    echo -e "${GREEN}\nStarting application in ${YELLOW}DEVELOPMENT${NC} mode..."
    COMPOSE_FILES="-f docker-compose.yml -f docker-compose.dev.yml"
    BACKEND_CONTAINER="backend"
    FRONTEND_CONTAINER="frontend-dev"
  fi

  $DOCKER_COMPOSE_CMD $COMPOSE_FILES up --build -d
  
  wait_for_log "$BACKEND_CONTAINER" "Server running at"

  if [ "$mode" -eq 2 ]; then
    wait_for_log "$FRONTEND_CONTAINER" "Compiled successfully!"
  else
    echo -e "${CYAN}Verifying status of container ${YELLOW}$FRONTEND_CONTAINER${CYAN}...${NC}"
    local elapsed=0
    while ! docker ps | grep -q "$FRONTEND_CONTAINER"; do
      printf "."
      sleep 2
      elapsed=$((elapsed + 2))
      if [ "$elapsed" -ge "$TIMEOUT" ]; then
        printf "\n${RED}Timeout reached for container %s.${NC}\n" "$FRONTEND_CONTAINER"
        break
      fi
    done
    echo ""
  fi

  echo -e "${BLUE}---------------------------------------${NC}"
  echo -e "${GREEN}Application started (or timeout reached).${NC}"
  echo -e "${BLUE}Access URLs:${NC}"
  echo -e "${YELLOW}CouchDB:${NC} http://localhost:5984/_utils"
  echo -e "${YELLOW}Backend:${NC} http://localhost:3000"
  if [ "$mode" -eq 2 ]; then
    echo -e "${YELLOW}Frontend (Development):${NC} http://localhost:3001"
  else
    echo -e "${YELLOW}Frontend (Production):${NC} http://localhost"
  fi
  echo -e "${BLUE}---------------------------------------${NC}"

  # Warn if .env is missing after displaying access URLs.
  check_env_file
}

# Function: stop_containers
# Description: Stop all running containers.
stop_containers() {
  echo -e "${RED}\nStopping containers...${NC}"
  $DOCKER_COMPOSE_CMD down
  echo -e "${RED}Containers stopped.${NC}"
}

# Function: check_installation
# Description: Check if Docker and Docker Compose (or docker-compose) are installed.
check_installation() {
  echo -e "${CYAN}\nChecking installation of Docker and Docker Compose...${NC}"
  
  if command -v docker &>/dev/null; then
    echo -e "${GREEN}Docker is installed.${NC}"
    docker --version
  else
    echo -e "${RED}Docker is NOT installed.${NC}"
  fi

  # Check for Docker Compose availability
  if docker compose version &>/dev/null; then
    echo -e "${GREEN}docker compose is available.${NC}"
    docker compose version
  elif command -v docker-compose &>/dev/null; then
    echo -e "${GREEN}docker-compose is available.${NC}"
    docker-compose version
  else
    echo -e "${RED}Neither docker compose nor docker-compose are installed.${NC}"
  fi

  # Display Docker state
  echo -e "${CYAN}\nDocker Status:${NC}"
  docker info --format '{{.ServerVersion}}' 2>/dev/null || echo -e "${RED}Failed to obtain Docker status.${NC}"
}

# Function: display_information
# Description: Display project information and script functionality.
display_information() {
  echo -e "${CYAN}\nProject Information:${NC}"
  echo -e "${GREEN}Project Name: CouchGarage${NC}"
  echo -e "${GREEN}Script Functionality:${NC}"
  echo -e "  - Start the application in production or development mode."
  echo -e "  - Stop the application containers."
  echo -e "  - Check if Docker and Docker Compose are installed."
  echo -e "  - Display project information and usage details."
}

# Trap: Handle Ctrl+C and SIGTERM to stop containers properly.
trap 'echo -e "\n\n${RED}Interrupt detected, stopping containers...${NC}"; stop_containers; exit 0' SIGINT SIGTERM

# Menu Options
echo -e "${CYAN}\nSelect an option:${NC}"
echo -e "${YELLOW}1)${NC} Start application in ${GREEN}PRODUCTION${NC} mode"
echo -e "${YELLOW}2)${NC} Start application in ${GREEN}DEVELOPMENT${NC} mode"
echo -e "${YELLOW}3)${NC} Stop containers"
echo -e "${YELLOW}4)${NC} Check installation of Docker and Docker Compose"
echo -e "${YELLOW}5)${NC} Display project information"
read -p "Enter the option number (1, 2, 3, 4 or 5): " option

case $option in
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
  4)
    check_installation
    ;;
  5)
    display_information
    ;;
  *)
    echo -e "${RED}Invalid option. Please use 1, 2, 3, 4 or 5.${NC}"
    exit 1
    ;;
esac

echo ""
read -n1 -r -p "Press any key to stop containers and exit..."
echo ""
stop_containers