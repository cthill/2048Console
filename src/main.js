blank = new Array(10).join(" ");
line = new Array(10).join("#");
col = "#";
start = false;

String.prototype.replaceAt=function(index, character) {
    return this.substr(0, index) + character + this.substr(index + character.length);
}

var init = function() {
    displayBuffer = [];
    board = new Array(16);
    boardHistory = [JSON.parse(JSON.stringify(board))];
    highest = 2;
    won = false;
    lost = false;
    score = 0;

    emptyBoard();
    addRandomTile();
    drawScreen();

    window.addEventListener("keyup", dealWithKeyboard, false);
    setInterval(function() {
        mainLoop();
    }, 16);
}

var clearDisplay = function() {
    displayBuffer = [];
    console.clear();
}

var emptyBoard = function() {
    for(var i = 0; i < 16; i++) {
        board[i] = {
            "text": blank,
        };
    }
}

var mainLoop = function() {
    if (!lost) {
        scanForMoves();
    }
    if (highest == 11 && !won) {
        win();
    }
}

var drawScreen = function() {
    clearDisplay();

    buildBoard();

    if (start == false) {
        var m = buildMessage3(["2048 Console Edition", "By: Christian T Hill", "Press enter to begin."]);
        writeMessage(m);
    }
    if (won == 1) {
        var m = buildMessage3(["YOU WIN!", "Press enter to continue", "or click play to restart."]);
        writeMessage(m);
    } else if (lost == true) {
        var m = buildMessage3(["GAME OVER!", "Score: " + score, "Press enter to restart."]);
        writeMessage(m);
    }

    console.log("\n" + displayBuffer.join("\n") + "\n\n" + "Score: " + score);
}

var buildMessage3 = function(messages) {
    var b = "@" + new Array(32).join(" ") + "@";
    var l = new Array(34).join("@")
    var m = [l, b];
    for (var i = 0; i < 3; i++) {
        var tM = messages[i];
        var padding = Math.ceil((32 - tM.length)/2);
        var pad = new Array(padding).join(" ");
        m.push("@" + pad + tM + pad + (tM.length%2 == 0 ? " " : "") + "@", b);
    }
    m.push(l);
    return m;
}

var writeMessage = function(m) {
    for (var i = 7; i < 16; i++) {
        for (var j = 3; j < 36; j++) {
            displayBuffer[i] = displayBuffer[i].replaceAt(j, m[i - 7][j - 3]);
        }
    }
}

var getBoardIndex = function(row, col) {
    return (row * 4) + col;
}

var buildTile = function(exp, fresh) {
    fresh = (fresh == true ? fresh : false);
    highest = highest < exp ? exp : highest;
    var tile = {
        "exp": exp,
        "text": getTileText(exp),
        "fresh": fresh
    }
    return tile;
}

var getTileText = function(exp) {
    if (exp == null || exp == 0)
        return blank;
    var val = Math.pow(2, exp).toString();
    var l = val.length;
    var padding = Math.ceil((10 - l)/2);
    padding = new Array(padding).join(" ");
    var text = padding + val + padding + (l%2 == 0 ? " " : "");
    return text;
}

var addRandomTile = function() {
    var blanks = [];
    for (var i = 0; i < board.length; i++) {
        if (board[i].text == blank) {
            blanks.push(i);
        }
    }
    if (blanks.length > 0) {
        var ind = Math.floor(Math.random() * blanks.length);
        var val = Math.floor(Math.random() * 2 + 1);
        board[blanks[ind]] = buildTile(val);
    }
}

var scanForMoves = function() {
    for (var i = 0; i < 3; i++) {
        for (var j = 0; j < 3; j++) {
            var thisTile = board[getBoardIndex(i, j)];

            //check right
            var cTile = board[getBoardIndex(i, j + 1)];
            if (cTile.exp == thisTile.exp || cTile.text == blank) {
                return true;
            }

            //check down
            var cTile = board[getBoardIndex(i + 1, j)];
            if (cTile.exp == thisTile.exp || cTile.text == blank) {
                return true;
            }
        }
    }
    lose();
}

var lose = function() {
    lost = true;
    drawScreen();
}

var win = function() {
    won = 1;
    drawScreen();
}

var deFresh = function() {
    for(var i = 0; i < 16; i++) {
        board[i].fresh = false;
    }
}

var buildBoard = function() {
    for (var i = 1; i < 24; i++) { //Row loop
        var output = "";
        for (var j = 0; j < 4; j++) { //Column loop
            drawing = ((i - 3)%6 == 0);
            if (drawing) {
                //Draw the number
                output += board[getBoardIndex(Math.floor(i/6), j)].text;//generateGP(gB[][j]);
            } else if (i%6 == 0) {
                //Draw a flat line
                output += line;
            } else {
                output += blank;
            }
            output += (j != 3 ? col : "");
        }
        displayBuffer.push(output);
    }
}

var saveBoard = function() {
    boardHistory.push(JSON.parse(JSON.stringify(board)));
}

var undo = function() {
    if (boardHistory.length > 1) {
        board = JSON.parse(JSON.stringify(boardHistory[boardHistory.length - 1]));
        boardHistory.pop();
        drawScreen();
    }
}


function dealWithKeyboard(e) {
    if (e.keyCode == 13 || e.keyCode == 27) {
        if (!start) {
            start = true;
            drawScreen();
        }
        if (won == 1) {
            won++;
            drawScreen();
        }
        if (lost == true) {
            init();
        }
        return;
    }

    if (36 < e.keyCode && e.keyCode < 41) {
        //Save the baord to the history. This makes the undo function work.
        saveBoard();
        /*
        This bit of code is interesting. It invokes the correct shift function based on the keyCode. The shift functions
        will return true if they made a change to the board. If they changed the board, we add a random tile.
        */
        if (e.keyCode % 2 == 0 ? (shiftV(e.keyCode == 40)) : (shiftH(e.keyCode == 39))) {
            addRandomTile();
        }
        drawScreen();
        deFresh();
    }
}

var shiftH = function(dir) {
    //dir: false = left, true = right

    //start value for the "j" for loop
    var js = dir ? 2 : 1;
    //exit condition for the "j" for loop
    var jc = function(j) { return dir ? j >= 0 : j < 4 };
    //increment for the "j" for loop
    var ji = dir ? -1 : 1;

    //start
    var cs = dir ? 1 : -1;
    //exit condition
    var cc = function(c) { return dir ? c < 4 : c >= 0 };
    //increment
    var ci = dir ? 1 : -1;

    var moved = false;

    //Scan the colums
    for (var j = js; jc(j); j += ji) {
        //Scan the rows
        for (var i = 0; i < 4; i++) {
            var thisTile = board[getBoardIndex(i, j)];
            if (thisTile.text != blank) {
                var newCol = j;
                for (var c = j + cs; cc(c); c += ci) {
                    var checkTile = board[getBoardIndex(i, c)];
                    if (checkTile.text == blank || (checkTile.exp == thisTile.exp && checkTile.fresh != true)) {
                        newCol = c;
                        moved = true;
                        if (checkTile.exp == thisTile.exp) {
                            break;
                        }
                    } else {
                        break;
                    }
                }
                var thisTile = board[getBoardIndex(i, j)];
                board[getBoardIndex(i, j)] = buildTile(0);//blanktile

                var newPos = board[getBoardIndex(i, newCol)]
                if (newPos.text != blank && newPos.fresh != true) {
                    board[getBoardIndex(i, newCol)] = buildTile(thisTile.exp + 1, true);
                    score += Math.pow(2, thisTile.exp + 1);
                } else {
                    board[getBoardIndex(i, newCol)] = thisTile;
                }
                drawScreen();
            }

        }
    }

    return moved;
}

var shiftV = function(dir) {
    //dir: false = left, true = right

    //start value for the "i" for loop
    var is = dir ? 2 : 1;
    //exit condition for the "i" for loop
    var ic = function(j) { return dir ? i >= 0 : i < 4 };
    //increment for the "i" for loop
    var ii = dir ? -1 : 1;

    //start
    var cs = dir ? 1 : -1;
    //exit condition
    var cc = function(c) { return dir ? c < 4 : c >= 0 };
    //increment
    var ci = dir ? 1 : -1;

    var moved = false;

    for (var i = is; ic(i); i += ii) {
        //Scan the colums
        for (var j = 0; j < 4; j++) {
            var thisTile = board[getBoardIndex(i, j)];
            if (thisTile.text != blank) {
                var newRow = i;
                for (var c = i + cs; cc(c); c += ci) {
                    var checkTile = board[getBoardIndex(c, j)];
                    if (checkTile.text == blank || (checkTile.exp == thisTile.exp && checkTile.fresh != true)) {
                        newRow = c;
                        moved = true;
                        if (checkTile.exp == thisTile.exp) {
                            break;
                        }
                    } else {
                        break;
                    }
                }
                var thisTile = board[getBoardIndex(i, j)];
                board[getBoardIndex(i, j)] = buildTile(0);//blanktile

                var newPos = board[getBoardIndex(newRow, j)]
                if (newPos.text != blank && newPos.fresh != true) {
                    board[getBoardIndex(newRow, j)] = buildTile(thisTile.exp + 1, true);
                    score += Math.pow(2, thisTile.exp + 1);
                } else {
                    board[getBoardIndex(newRow, j)] = thisTile;
                }
            }

        }
    }
    return moved;
}
