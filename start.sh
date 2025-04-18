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

# Log file for errors
LOG_FILE="couchgarage_errors.log"

# Detect whether to use "docker compose" or "docker-compose"
if docker compose version &>/dev/null; then
  DOCKER_COMPOSE_CMD="docker compose"
else
  DOCKER_COMPOSE_CMD="docker-compose"
fi

TIMEOUT=300

# Function: log_error
# Description: Log errors to the log file with a timestamp.
log_error() {
  echo -e "${RED}Error: $1${NC}" >&2
  echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" >> "$LOG_FILE"
}

# Function: check_env_file
# Description: Warn the user if the .env file does not exist.
check_env_file() {
  if [ ! -f .env ]; then
    local message="WARNING: It seems that the .env file is missing. Environment variables may not be set correctly."
    echo -e "${YELLOW}${message}${NC}"
    log_error "${message}"
  fi
}

# Function: wait_for_log
# Description: Wait until a specific log message is found in a container's logs.
# Function: wait_for_log
# Description: Wait until a specific log message is found in a container's logs.
wait_for_log() {
  local container=$1
  local search_text="$2"
  local elapsed=0

  echo -e "${CYAN}Waiting in container ${YELLOW}${container}${CYAN} for signal: '${YELLOW}${search_text}${CYAN}'${NC}"
  echo -e "${CYAN}Displaying logs from container ${YELLOW}${container}${CYAN} in real-time...${NC}"

  # Start a background process to show logs in real time
  docker logs -f "$container" 2>&1 | while read -r line; do
    echo -e "${BLUE}[${container}]${NC} $line"
    if echo "$line" | grep -q "$search_text"; then
      echo -e "${GREEN}Signal '${search_text}' received in container ${YELLOW}${container}${GREEN}.${NC}"
      kill $! # Kill the background log process
      break
    fi
  done &
  local log_pid=$!

  # Timeout mechanism
  while kill -0 "$log_pid" 2>/dev/null; do
    sleep 2
    elapsed=$((elapsed + 2))
    if [ "$elapsed" -ge "$TIMEOUT" ]; then
      echo -e "${RED}\nTimeout reached waiting for signal '${search_text}' in container ${container}.${NC}"
      kill "$log_pid" 2>/dev/null
      break
    fi
  done
}

# Function: start_containers
# Description: Start the application containers in production or development mode.
start_containers() {
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

  if ! $DOCKER_COMPOSE_CMD $COMPOSE_FILES up --build -d 2>>"$LOG_FILE"; then
    log_error "Failed to start containers in mode ${mode}."
    return 1
  fi
  
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
        local message="Timeout reached for container ${FRONTEND_CONTAINER}."
        printf "\n${RED}${message}${NC}\n"
        log_error "${message}"
        break
      fi
    done
    echo ""
  fi

  echo -e "${BLUE}---------------------------------------${NC}"
  echo -e "${GREEN}Application started (or timeout reached).${NC}"
  echo -e "${BLUE}Access URLs:${NC}"
  echo -e "${YELLOW}CouchDB:${NC} http://localhost:5984/_utils"
  if [ "$mode" -eq 2 ]; then
    echo -e "${YELLOW}Frontend (Development):${NC} http://localhost:3001"
    echo -e "${YELLOW}Backend (Development):${NC} http://localhost:3000"
  else
    echo -e "${YELLOW}Frontend (Production):${NC} http://localhost"
    echo -e "${YELLOW}Backend (Production):${NC} http://localhost:3000"
  fi
  echo -e "${BLUE}---------------------------------------${NC}"

  check_env_file
}

# Function: stop_containers
# Description: Stop all running containers.
stop_containers() {
  echo -e "${RED}\nStopping containers...${NC}"
  if ! $DOCKER_COMPOSE_CMD down 2>>"$LOG_FILE"; then
    log_error "Failed to stop containers."
  else
    echo -e "${RED}Containers stopped.${NC}"
  fi
}

# Function: check_installation
# Description: Check if Docker and Docker Compose (or docker-compose) are installed.
check_installation() {
  echo -e "${CYAN}\nChecking installation of Docker and Docker Compose...${NC}"
  
  if command -v docker &>/dev/null; then
    echo -e "${GREEN}Docker is installed.${NC}"
    docker --version
  else
    local message="Docker is NOT installed."
    echo -e "${RED}${message}${NC}"
    log_error "${message}"
  fi

  if docker compose version &>/dev/null; then
    echo -e "${GREEN}docker compose is available.${NC}"
    docker compose version
  elif command -v docker-compose &>/dev/null; then
    echo -e "${GREEN}docker-compose is available.${NC}"
    docker-compose version
  else
    local message="Neither docker compose nor docker-compose are installed."
    echo -e "${RED}${message}${NC}"
    log_error "${message}"
  fi

  echo -e "${CYAN}\nDocker Status:${NC}"
  if ! docker info --format '{{.ServerVersion}}' 2>>"$LOG_FILE"; then
    log_error "Failed to obtain Docker status."
  fi
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
    local message="Invalid option. Please use 1, 2, 3, 4 or 5."
    echo -e "${RED}${message}${NC}"
    log_error "${message}"
    exit 1
    ;;
esac

echo ""
read -n1 -r -p "Press any key to stop containers and exit..."
echo ""
stop_containers