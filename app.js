const express = require('express');
const app = express();
const fs = require('fs');
const bodyParser = require('body-parser');

// http://morpion-marine.fxbresson.fr/

app.set('view engine', 'ejs');
app.use(express.static('assets'));
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// Constante variable with the width od the board
const boardWith = 3;


/********************************************************************
 *  ROUTER
 ********************************************************************/

// Return all routes
app.get('/', function (req, res) {
    res.render('template' , { page: "home" , title: "Home" , body: "home" });
});




// Return all states to resume a game
app.get('/resume', function (req, res) {
    // Get JSON object of the file
    var states = readJSON();

    res.render('template' , { page: "resume" , title: "Resume a game" , body: "resume" , states: states });
});



// Return the board with its <id>
app.get('/state/:id', function (req, res) {
    // Get JSON object of the file
    var states = readJSON();

    // Get the state with the id
    var state = states[req.params.id];

    res.render('template' , { page: "state" , title: "Let's play!" , body: "state" , state: state });
});





// Start a new game
app.post('/start', function (req, res) {
    // Increment the id of the last state
    var newStateId = findLastState() + 1;

    // Create the board with the width
    var boardArray = [];
    for (var i = 0; i < boardWith*boardWith; i++) {
        // All cells are 0 for the beginning
        boardArray.push(0);
    }

    // Create a new state
    var stateOutput = {
        "id": newStateId,
        "board": boardArray,
        "player1": req.body.player1,
        "player2": req.body.player2,
        "current": req.body.player1,
        "winner": null
    };

    // Add the new state into the JSON file
    appendJSON(stateOutput);

    res.render('template' , { page: "state" , title: "Let's play!" , body: "state" , state: stateOutput });
});



// The <player> put the pawn in the <cell> of the <board>
app.get('/play/:board/:player/:cell', function (req, res) {
    // We play and get a message
    play(req.params.board,req.params.cell,req.params.player);

    // Send message to AJAX request
    res.send(true);
});



app.listen(3000, function () {
    console.log('Example app listening on port 3000!');
});



/********************************************************************
 *  FUNCTIONS
 ********************************************************************/

/**
 * JSON : Append new content into a JSON file
 * @param output content to put in the file
 */
function appendJSON(output)
{
    // Get JSON object of the file
    var states = readJSON()
    // Push the new output into the JSON object
    states.push(output);
    // Write into the JSON file
    writeJSON(states);
}



/**
 * JSON : Read a JSON file
 * @return data
 */
function readJSON()
{
    try {
        var data = JSON.parse(fs.readFileSync('json/states.json', 'utf8'));
        return data;
    } catch(e) {
        console.log('Error:', e.stack);
    }
}



/**
 * JSON : Write into a JSON file
 * @param output content to put in the file
 */
function writeJSON(output)
{
    fs.writeFile('json/states.json', JSON.stringify(output, null, 2), 'utf-8', function(err) {
        if (err) throw err
        console.log('Done!')
    })
}



/**
 * Request JSON : Find last state id
 * @return state
 */
function findLastState()
{
    // Get JSON object of the file
    var lesStates = readJSON();
    // Return the id of the last state
    return lesStates[lesStates.length-1]['id'];
}




/**
 * GAME : Play with
 * @param id state id
 * @param cell index of the board
 * @param player name of the player
 */
function play(id,cell,player)
{
    // Get JSON object of the file
    var states = readJSON();

    // Get the state with the id
    var state = states[id];

    // Check if the cell has not been clicked, and if there is no winner
    if(state.board[cell] == 0 && state.winner == null) {
        // Get the value of the player: 1 = player1 / 2 = player2
        // Change the value on the cell
        var n = (player == state.player1 ? 1 : 2)
        state.board[cell] = n;

        // Change the current player
        state.current = (player == state.player1 ? state.player2 : state.player1);

        // Write into the JSON file
        writeJSON(states);

        // If it's the fifth pawn
        if (getNumberOfPawn(state.board) >= 5) {
            // Is there is a result
            if(result(state,n)) {
                // The winner is the player
                state.winner = player;
            }
            // If it's the nineth pawn (the last one) and there is no result
            else if (getNumberOfPawn(state.board) == 9 && !result(state,n)) {
                // There is no winner
                state.winner = "none";
            }
        }

        // Write into the JSON file
        writeJSON(states);

    }
}


/**
 * GAME : get number of play
 */
function getNumberOfPawn(board)
{
    // New counter
    var count = 0;

    for (var i = 0; i < board.length; i++) {
        // If the cell has been clicked
        if (board[i] != 0)
            // Increment count
            count++;
    }

    return count;
}



/**
 * GAME : Check result
 */
function result(state,n)
{
    // If one check is true
    return (checkVertical(state,n) || checkHorizontal(state,n) || checkDiagonal(state,n)) ? true : false;
}

/**
 * GAME : Check vertical cells
 * @param state
 * @param n number of the player
 */
function checkVertical(state,n)
{
    // Loop on the lines
    for (var i = 0; i < boardWith; i++) {
        // Create counter
        var count = 0;

        // Loop on the cols
        for (var j = 0; j < boardWith; j++) {
            // Check if the cells equal the number of the player
            if (state.board[i+(boardWith*j)] == n)
                // Increment count
                count++;
        }
        // If the counter equals the with of the board
        if (count == boardWith)
            // The player wins
            return true;
    }

    // The player loses
    return false;
}

/**
 * GAME : Check horizontal cells
 * @param state
 * @param n number of the player
 */
function checkHorizontal(state,n)
{
    // Loop on the cols
    for (var i = 0; i < boardWith*(boardWith-1); i+=boardWith) {
        // Create counter
        var count = 0;

        // Loop on the lines
        for (var j = 0; j < boardWith; j++) {
            // Check if the cells equal the number of the player
            if (state.board[i+j] == n)
                // Increment counter
                count++;
        }
        // If the counter equals the with of the board
        if (count == boardWith)
            // The player wins
            return true;
    }

    // The player loses
    return false;
}

/**
 * GAME : Check diagonal cells
 * @param state
 * @param n number of the player
 */
function checkDiagonal(state,n)
{
    // Create counter
    var count = 0;
    // Diagonal top/left to bottom/right
    for (var i = 0; i < boardWith; i++) {
        // Check if the cells equal the number of the player
        if (state.board[i+(boardWith*i)] == n)
            // Increment counter
            count++;
    }
    // If the counter equals the with of the board
    if (count == boardWith)
        // The player wins
        return true;

    // Create counter
    count = 0;
    // Diagonal top/right to bottom/left
    for (var i = 1; i <= boardWith; i++) {
        // Check if the cells equal the number of the player
        if (state.board[i*(boardWith-1)] == n)
            // Increment counter
            count++;
    }

    // If the counter equals the with of the board
    if (count == boardWith)
        // The player wins
        return true;

    // The player loses
    return false;
}
