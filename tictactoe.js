// Board structure where game status is stored.
let Gameboard = (function(){
    const board = [];
    for(let i = 0; i < 9; i++){
        board.push({mark: "", arr_id: i});
    }

    let locked = true;
    // Updates cells pointed to by "cell_id" and changes its mark
    function updateCell(cell_id, mark){
        board[cell_id].mark = mark;
    } 

    // Returns a copy of the cell 
    function getCell(cell_id){
        return Object.assign({}, board[cell_id]);
    }

    //returns a copy of the board.
    function getBoardArray(){
        return [...board];
    }

    function hasWon(player){
        //check rows
        for(let i = 0; i <= 6; i+=3){
            if(board[i].mark !== player.mark) continue;
            if(board[i].mark === board[i + 1].mark && board[i + 1].mark === board[i + 2].mark) return player;
        }

        //Check columns
        for(let i = 0; i < 3; i++){
            if(board[i].mark !== player.mark) continue;
            if(board[i].mark === board[i + 3].mark && board[i + 3].mark === board[i + 6].mark) return player;
        }

        //Check for diagonals
        if(board[0].mark === player.mark && board[0].mark === board[4].mark && board[4].mark === board[8].mark) return player;
        if(board[2].mark === player.mark && board[2].mark === board[4].mark && board[4].mark === board[6].mark) return player;

        //No one won
        return null;
    }

    function clear(){
        board.forEach(cell => { cell.mark = ""; });
    }

    function isFull(){
        let full = true;

        for(let i = 0; i < board.length; i++){
            if(board[i].mark === ""){ full = false; break;}
        }

        return full;
    }

    function lock(){locked = true;}
    function unlock(){locked = false;}
    function isLocked(){const dummy = locked; return dummy;}

    return{
        updateCell,
        getBoardArray,
        getCell,
        hasWon,
        clear, 
        isFull,
        lock,
        unlock,
        isLocked
    }
})();


// Generates HTML for the ViewController.
let HTMLGenerator = (function(doc){
    function generateBoard(board){
        let board_html = doc.createElement("div");
        board_html.classList.add("board");

        board.getBoardArray().forEach(cell => {
            const button = doc.createElement("button");
            button.classList.add("cell");
            button.value = cell.arr_id;
            board_html.appendChild(button);
        });
        return board_html;
    }

    function generateH1(text){
        const element = doc.createElement("h1");
        element.textContent = text;
        return element;
    }

    // Allows you to create Select html objects with different values and text
    // If text is not defined then the values are displayed by default.
    function generateSelect(selected, values, text){
        if(text === undefined){
            text = values;
        }

        const select = doc.createElement("select");
        for(let i = 0; i < values.length; i++){
            if(i === selected){
                select.innerHTML += `<option value=${values[i]} selected>${text[i]}</option>`
                continue;
            }
            select.innerHTML += `<option value=${values[i]}>${text[i]}</option>`
        }
        return select
    }

    function generateButton(text, value){
        let button = doc.createElement("button");
        button.textContent = text;
        button.setAttribute("value", value);
        return button;
    }

    return{
        generateBoard,
        generateH1,
        generateSelect,
        generateButton
    }
})(document);

// Display HTML on the document.
let ViewController = (function(doc){
    function displayHTML(target, element){
        doc.querySelector(target).appendChild(element);
    }

    return{
        displayHTML
    }
})(document);


// Controlls the flow of the game (whose turn, winners, losers, ...).
let GameController = (function(view, html, board){

    const players = Array(2); // 1 and 2 are players. 3 is the current player.
    let current_player = 0;
    const html_board = html.generateBoard(board)
    const player_marks = [html.generateSelect(0, ["❌", "⭕️", "🦠", "💉"]),
                          html.generateSelect(1, ["❌", "⭕️", "🦠", "💉"])];

    const game_mode = html.generateSelect(0, ["pvp", "pva", "pvi"], ["Player vs. Player", "Player vs. AI", "Player vs. Impossible"]);
    const info_sign = html.generateH1("SELECT GAME MODE");
    const stop_start_button = html.generateButton("START", 0);
    let _aiPlayRound = null;


    // Makes a player object.
    function _makePlayer(name, mark){ 
        return {name, mark};
    }

    function _playerPlayRound(cell){
        if(cell.textContent !== "" || board.isLocked()) return;
        board.updateCell(cell.value, players[current_player].mark);
        cell.textContent = players[current_player].mark;

        _evalRound();
    }

    function simpleAI(){
        if(board.isLocked()) return;
        let selected_cell;
        //Select an empty cell.
        do{
            selected_cell = _randomInt(0, 8);
            console.log(`Computer selected cell: ${selected_cell}`);
        }while(board.getCell(selected_cell).mark !== "");

        board.updateCell(selected_cell, players[current_player].mark);
        html_board.querySelectorAll(".cell")[selected_cell].textContent = players[current_player].mark;

        _evalRound();
    }

    function imposibleAI(){
        console.log("I am invinsible");

        _evalRound();
    }

    function _evalRound(){
        const result = board.hasWon(players[current_player]);
        if(result){
            info_sign.textContent = `${result.name} WON THE GAME!`;
            board.lock();
        }else if(board.isFull()){
            info_sign.textContent = "IT'S A DRAW!";
        }else{
            current_player = (current_player + 1) % 2;
            if (game_mode.value === "pvp"){
                info_sign.textContent = `IT'S ${players[current_player].name}'S TURN.`;
            }
        }
    }

    function _randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
      }

    function init(){
        //Add an event listener to every cell
        html_board.querySelectorAll(".cell").forEach(cell => {
            cell.addEventListener("click", ()=>{
                _playerPlayRound(cell);

                if(!board.isFull() && game_mode.value !== "pvp"){
                    _aiPlayRound();
                }
            });
        });

        //Add event listener to stop-start-button
        stop_start_button.addEventListener("click", ()=>{
            if(stop_start_button.value === "0")
            { // Game is about to start - lock the settings
                board.unlock();

                players[0] = _makePlayer(`Player ${player_marks[0].value}` , player_marks[0].value);
                players[1] = _makePlayer(`Player ${player_marks[1].value}` , player_marks[1].value);
                current_player = _randomInt(0, 1);

                if(game_mode.value === "pvi"){
                    _aiPlayRound = imposibleAI;
                    _aiPlayRound();
                } else if (game_mode.value === "pva"){
                    _aiPlayRound = simpleAI;
                    _aiPlayRound();
                } else {
                    info_sign.textContent = `It ${players[current_player].name}'s turn.`;
                }

                stop_start_button.textContent = "RESET";
                stop_start_button.value = "1";
                game_mode.setAttribute("disabled", true);
                player_marks.forEach(mark => mark.setAttribute("disabled", true));
            } 
            else
            { // Game is being restarted. enable settings.
                board.lock();
                _endGame();
            }
        });

        //Add event listeners to the select tags
        for(let i = 0; i < 2; i++){
            player_marks[i].addEventListener("change", ()=>{
                players[i].mark = player_marks[i].value;
                players[i].name = `Player ${player_marks[i].value}`;
            });
        }

        game_mode.addEventListener("change", ()=>{ console.log(game_mode.value); });

        //Display game.
        view.displayHTML(".gameboard", html_board);
        player_marks.forEach(mark_selector => { view.displayHTML(".settings", mark_selector); });
        view.displayHTML(".settings", game_mode);
        view.displayHTML(".info", info_sign);
        view.displayHTML(".game", stop_start_button);
    }

    function _endGame(){
        board.lock();

        info_sign.textContent = "SELECT GAME MODE"
        board.clear();
        html_board.querySelectorAll(".cell").forEach(cell => cell.textContent = "");


        stop_start_button.textContent = "START";
        stop_start_button.value = "0";
        game_mode.removeAttribute("disabled");
        player_marks.forEach(mark => mark.removeAttribute("disabled"));
    }

    return{ init }
})(ViewController, HTMLGenerator, Gameboard);

// ---------------------------------------- Exec ----------------------------------------

GameController.init()