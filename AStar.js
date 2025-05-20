const rows = 25;
const cols = 25;
const grid = [];
let startNode = null;
let endNode = null;
let isMouseDown = false;

const gridElement = document.getElementById('grid');

// Crear el grid
for (let y = 0; y < rows; y++) {
  const row = [];
  for (let x = 0; x < cols; x++) {
    const cell = document.createElement('div');
    cell.classList.add('cell');
    cell.dataset.x = x;
    cell.dataset.y = y;
    
    // cell.addEventListener('click', () => toggleWall(cell));
    
    // Eventos para poder colocar muros arrastrando el ratón
    cell.addEventListener('mousedown', (e) => {
      isMouseDown = true;
      toggleWall(cell);
    });
    cell.addEventListener('mouseover', (e) => {
      if (isMouseDown) toggleWall(cell);
    });
    gridElement.appendChild(cell);
    row.push({
      x,
      y,
      f: Infinity,
      g: Infinity,
      h: 0,
      neighbors: [],
      previous: null,
      wall: false,
      element: cell
    });
  }
  grid.push(row);
}
document.addEventListener('mouseup', () => {
  isMouseDown = false;
});
// Cambiar de color las celdas
function toggleWall(cell) {
  const x = parseInt(cell.dataset.x);
  const y = parseInt(cell.dataset.y);
  const node = grid[y][x];

  if (!startNode) {
    startNode = node;
    cell.classList.add('start');
  } else if (!endNode && node !== startNode) {
    endNode = node;
    cell.classList.add('end');
  } else if (node !== startNode && node !== endNode) {
    node.wall = !node.wall;
    cell.classList.toggle('wall');
  }
  console.log(node);
}


// Añadir vecinos (vertical, horizontal y diagonal)
function addNeighbors() {
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const node = grid[y][x];
      const dirs = [
        [0, -1], [1, 0], [0, 1], [-1, 0], // arriba, derecha, abajo, izquierda
        [-1, -1], [1, -1], [1, 1], [-1, 1]  // noroeste, noreste, sureste, suroeste
      ];
      dirs.forEach(([dx, dy]) => {
        const nx = x + dx;
        const ny = y + dy;
        if (nx >= 0 && ny >= 0 && nx < cols && ny < rows) {
          node.neighbors.push(grid[ny][nx]);
        }
      });
    }
  }
}


// Heurística Octile
function heuristic(a, b) {
  let dx = Math.abs(a.x - b.x);
  let dy = Math.abs(a.y - b.y);
  return Math.max(dx, dy) + (Math.SQRT2 - 1) * Math.min(dx, dy);
}

function startAStar() {
  if (!startNode || !endNode) {
    alert("Selecciona un nodo de inicio y fin.");
    return;
  }

  addNeighbors();

  const openSet = [];
  const closedSet = new Set();

  startNode.g = 0;
  startNode.h = heuristic(startNode, endNode);
  startNode.f = startNode.h;

  openSet.push(startNode);

  const interval = setInterval(() => {
    if (openSet.length > 0) {
      // Encontrar el nodo con menor f
      let bestIdx = 0;
      for (let i = 1; i < openSet.length; i++) {
        if (openSet[i].f < openSet[bestIdx].f) {
          bestIdx = i;
        }
      }

      const current = openSet[bestIdx];

      if (current === endNode) {
        clearInterval(interval);
        reconstructPath(current);
        return;
      }

      openSet.splice(bestIdx, 1);
      closedSet.add(current);

      for (const neighbor of current.neighbors) {
        if (closedSet.has(neighbor) || neighbor.wall) continue;

        let tentativeG = current.g + heuristic(current, neighbor);

        if (tentativeG < neighbor.g) {
          neighbor.previous = current;
          neighbor.g = tentativeG;
          neighbor.h = heuristic(neighbor, endNode);
          neighbor.f = neighbor.g + neighbor.h;

          if (!openSet.includes(neighbor)) {
            openSet.push(neighbor);
            if (neighbor !== startNode && neighbor !== endNode)
              neighbor.element.classList.add('open');
          }
        }
      }

      if (current !== startNode && current !== endNode)
        current.element.classList.add('closed');

    } else {
      clearInterval(interval);
      alert("No hay camino posible.");
    }
  }, 20);
}

function reconstructPath(current) {
  const path = [];
  let temp = current;
  while (temp.previous) {
    path.push(temp);
    temp = temp.previous;
  }
  path.push(startNode);

  path.reverse();

  path.forEach(node => {
    if (node !== startNode && node !== endNode) {
      node.element.classList.remove('open', 'closed');
      node.element.classList.add('path-final');
    }
  });
}
