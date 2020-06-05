const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');

context.scale(20, 20);
context.fillStyle = '#000'
context.fillRect(0, 0, canvas.width, canvas.height);


function createPiece(type) {
    if (type === 'T') {
        return [
            [0, 0, 0],
            [1, 1, 1],
            [0, 1, 0],
        ];
    } else if (type === 'O') {
        return [
            [2, 2],
            [2, 2],
        ];
    } else if (type === 'L') {
        return [
            [0, 3, 0],
            [0, 3, 0],
            [0, 3, 3],
        ];
    } else if (type === 'J') {
        return [
            [0, 4, 0],
            [0, 4, 0],
            [4, 4, 0],
        ];
    } else if (type === 'I') {
        return [
            [0, 5, 0, 0],
            [0, 5, 0, 0],
            [0, 5, 0, 0],
            [0, 5, 0, 0],
        ];
    } else if (type === 'S') {
        return [
            [0, 6, 6],
            [6, 6, 0],
            [0, 0, 0],
        ];
    } else if (type === 'Z') {
        return [
            [7, 7, 0],
            [0, 7, 7],
            [0, 0, 0],
        ];
    }
}

function updateScore() {
    document.getElementById('score').innerText = player.score //Attach to player
}

function arenaSweep() {
    let rowCount = 1;
    outer: for (let y = arena.length - 1; y > 0; --y) { //Start at the bottom of the arena
        for (let x = 0; x < arena[y].length; ++x) {
            if (arena[y][x] === 0) {
                continue outer; //if get 0 the column if not filled, continue in the next for Y index
            }
        }
        const row = arena.splice(y, 1)[0].fill(0); //Get all row index Y filled with 1 and refilled with 0
        arena.unshift(row); //Put in the top of arena ¿unshift move all the rows to the bottom?
        ++y

        player.score += rowCount * 10;
        rowCount *= 2;
    }
}

function collide(arena, player) {
    const [m, o] = [player.matrix, player.pos];
    for (let y = 0; y < m.length; ++y) {
        for (let x = 0; x < m[y].length; ++x) { //m[y] is the array from player to move in horizontal with the x
            //If for checking where player is
            if (m[y][x] !== 0 && //if the player matrix is distinct of 0 continue
                (arena[y + o.y] && //In case doesn't exist also collided (because is the bottom)
                    arena[y + o.y][x + o.x]) !== 0) { //if the position in the arena is equal to 1 then means collided
                return true //if all happen then Collided  
            }
        }
    }
    return false;
}

function createMatrix(w, h) {
    const matrix = [];
    while (h--) {
        matrix.push(new Array(w).fill(0));
    }
    return matrix;
}

function draw() {
    //RedrawCanvas
    context.fillStyle = '#000'
    context.fillRect(0, 0, canvas.width, canvas.height);
    drawMatrix(arena, { x: 0, y: 0 });
    drawMatrix(player.matrix, player.pos);
}

function drawMatrix(matrix, offset) {
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                context.fillStyle = colors[value];
                context.fillRect(x + offset.x,
                    y + offset.y,
                    1, 1); //x Horizontal, y Vertical
            }
        });
    });
}
//Unite arena with player; copi the position from the peace into the arena
function merge(arena, player) {
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                arena[y + player.pos.y][x + player.pos.x] = value;
            }
        })
    })
}

function playerMove(dir) {
    player.pos.x += dir;
    if (collide(arena, player)) {
        player.pos.x -= dir;
    }
}

function playerReset() {
    const pieces = 'ILJOTSZ';
    player.matrix = createPiece(pieces[pieces.length * Math.random() | 0]);
    player.pos.y = 0;
    player.pos.x = (arena[0].length / 2 | 0) -
        (player.matrix[0].length / 2 | 0);
    if (collide(arena, player)) {
        arena.forEach(row => row.fill(0));
        player.score = 0;
        updateScore();
    }
}

function playerRotate(dir) {
    const pos = player.pos.x;
    let offset = 1;
    rotate(player.matrix, dir);
    while (collide(arena, player)) {
        player.pos.x += offset; //if collided we move the player
        offset = -(offset + (offset > 0 ? 1 : -1)); //return the previus number in positive 
        if (offset > player.matrix[0].length) {
            rotate(player.matrix, -dir);
            player.pos.x = pos;
            return;
        }
    }
}

function rotate(matrix, dir) {
    for (let y = 0; y < matrix.length; y++) {
        for (let x = 0; x < y; ++x) {
            [
                matrix[x][y], //'AAA'
                matrix[y][x], //'BBB'
            ] = [
                matrix[y][x], //'BBB'
                matrix[x][y], //'AAA'
            ];
        }
    }
    if (dir > 0) {
        matrix.forEach(row => row.reverse());
    } else {
        matrix.reverse();
    }
}

function playerDrop() {
    player.pos.y++;
    if (collide(arena, player)) {
        player.pos.y--; //is collided then get back 1 space in the vertical
        merge(arena, player); //write in the arena canvas
        playerReset();
        arenaSweep();
        updateScore();
    }
    dropCounter = 0;
}

let dropCounter = 0;
let dropInterval = 1000; //1secont
let lastTime = 0;
//Make drop animation
function update(time = 0) {
    const deltaTime = time - lastTime;
    lastTime = time;
    dropCounter += deltaTime; // same as x+=y (x = x+y)
    if (dropCounter > dropInterval) { //If Dropcounter surpass 1s do the rewrite
        playerDrop();
    }
    draw();
    requestAnimationFrame(update);
}

const arena = createMatrix(12, 20);
const colors = [
    null,
    '#000080',
    '#610B0B',
    '#5E610B',
    '#0B3B0B',
    '#380B61',
    '#FE2EC8',
    '#2E2E2E',
];

const player = {
        pos: { x: 0, y: 0 },
        matrix: null,
        score: 0,
    }
    //Whe get the even from the page when push a any key
document.addEventListener('keydown', event => {
    if (event.keyCode === 37) {
        playerMove(-1);
    } else if (event.keyCode === 39) {
        playerMove(1)
    } else if (event.keyCode === 40) {
        playerDrop();
    } else if (event.keyCode === 38 || event.keyCode === 81) {
        playerRotate(-1);
    } else if (event.keyCode === 87) {
        playerRotate(1);
    }
});
updateScore();
playerReset();
update();