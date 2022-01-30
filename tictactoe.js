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
        const cloned = [];
        board.forEach(cell => {
            cloned.push({mark: cell.mark, arr_id: cell.arr_id});
        });
        return cloned;
    }

    function hasWon(board_state, player){
        //check rows
        for(let i = 0; i <= 6; i+=3){
            if(board_state[i].mark !== player.mark) continue;
            if(board_state[i].mark === board_state[i + 1].mark && board_state[i + 1].mark === board_state[i + 2].mark) return player;
        }

        //Check columns
        for(let i = 0; i < 3; i++){
            if(board_state[i].mark !== player.mark) continue;
            if(board_state[i].mark === board_state[i + 3].mark && board_state[i + 3].mark === board_state[i + 6].mark) return player;
        }

        //Check for diagonals
        if(board_state[0].mark === player.mark && board_state[0].mark === board_state[4].mark && board_state[4].mark === board_state[8].mark) return player;
        if(board_state[2].mark === player.mark && board_state[2].mark === board_state[4].mark && board_state[4].mark === board_state[6].mark) return player;

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
    function generateSelect(selected, label, values, text){
        if(text === undefined){
            text = values;
        }

        const group = doc.createElement("div");
        const label_for = doc.createElement("label");
        label_for.textContent = label;
        const select = doc.createElement("select");
        for(let i = 0; i < values.length; i++){
            if(i === selected){
                select.innerHTML += `<option value=${values[i]} selected>${text[i]}</option>`
                continue;
            }
            select.innerHTML += `<option value=${values[i]}>${text[i]}</option>`
        }

        group.style = "width: 100px;"
        group.appendChild(label_for);
        group.appendChild(select);
        return group
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

    const players = Array(2); // 1 and 2 are players.
    let current_player = 0;
    const html_board = html.generateBoard(board)
    const player_marks = [html.generateSelect(0, "Player 1:", ["𝗫", "〇", "♂︎", "♁","♡", "☁︎", "☆"]), html.generateSelect(1, "Player 2:", ["𝗫", "〇", "♂︎", "♁","♡", "☁︎", "☆"])];

    const game_mode = html.generateSelect(0, "Game Mode:", ["pvp", "pva", "pvi"], ["PLAYER VS. PLAYER", "PLAYER VS. AI - EASY", "PLAYER VS. AI - IMPOSSIBLE"]);
    const info_sign = html.generateH1("SELECT GAME MODE");
    const stop_start_button = html.generateButton("START", 0);
    stop_start_button.setAttribute("id", "start-button");
    let _aiPlayRound = null;


    // Makes a player object.
    function _makePlayer(name, mark){ 
        return {name, mark};
    }

    function _playerPlayRound(cell){
        board.updateCell(cell.value, players[current_player].mark);
        cell.textContent = players[current_player].mark;

        _evalRound();
    }

    function _simpleAI(){
        let selected_cell;
        //Select an empty cell.
        do{
            selected_cell = _randomInt(0, 8);
        }while(board.getCell(selected_cell).mark !== "");

        board.updateCell(selected_cell, players[current_player].mark);
        html_board.querySelectorAll(".cell")[selected_cell].textContent = players[current_player].mark;

        _evalRound();
    }

    function _imposibleAI(){
        function minimax(state, is_maximizing){
            if(board.hasWon(state, players[1])){
                return 1;
            }else if (board.hasWon(state, players[0])){
                return -1;
            } else if(state.filter(item => item.mark === "").length === 0) { 
                return 0;
            }

            if(is_maximizing){
                let bestScore = -Infinity;
                for(let i = 0; i < state.length; i++){
                    if(state[i].mark === ""){
                        state[i].mark = players[1].mark;
                        const score = minimax(state, false);
                        state[i].mark = "";
                        bestScore = Math.max(score, bestScore);
                    }
                }

                return bestScore;
            } else {
                let bestScore = Infinity;
                for(let i = 0; i < state.length; i++){
                    if(state[i].mark === ""){
                        state[i].mark = players[0].mark;
                        const score = minimax(state, true);
                        state[i].mark = "";
                        bestScore = Math.min(score, bestScore);
                    }
                }

                return bestScore;
            }
        }
        const current_state = board.getBoardArray();
        let bestScore = -Infinity;
        let best_choice;

        for(let i = 0; i < current_state.length; i++){
            if(current_state[i].mark === ""){
                current_state[i].mark = players[1].mark;
                const score = minimax(current_state, false);
                current_state[i].mark = "";
                if(score > bestScore){
                    bestScore = score;
                    best_choice = i;
                }
            }
        }

        board.updateCell(best_choice, players[current_player].mark);
        html_board.querySelectorAll(".cell")[best_choice].textContent = players[current_player].mark;
        _evalRound();
    }

    function _evalRound(){
        const result = board.hasWon(board.getBoardArray(), players[current_player]);
        if(result){
            info_sign.textContent = `${result.name} WON THE GAME!`;
            board.lock();
        }else if(board.isFull()){
            info_sign.textContent = "IT'S A DRAW!";
            board.lock();
        }else{
            current_player = (current_player + 1) % 2;
            if (game_mode.querySelector("select").value === "pvp"){
                info_sign.textContent = `IT'S ${players[current_player].name}'S TURN.`;
            }
        }
    }

    function _randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
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

    
    function init(){
        //Add an event listener to every cell
        html_board.querySelectorAll(".cell").forEach(cell => {
            cell.addEventListener("click", ()=>{
                if(board.isLocked() || cell.textContent !== "") return;

                _playerPlayRound(cell);

                if(current_player === 1 && game_mode.querySelector("select").value !== "pvp"){
                    _aiPlayRound();
                }
            });
        });

        //Add event listener to stop-start-button
        stop_start_button.addEventListener("click", ()=>{
            if(stop_start_button.value === "0")
            { // Game is about to start - lock the settings
                board.unlock();

                players[0] = _makePlayer(`Player ${player_marks[0].querySelector("select").value}` , player_marks[0].querySelector("select").value);
                players[1] = _makePlayer(`Player ${player_marks[1].querySelector("select").value}` , player_marks[1].querySelector("select").value);
                current_player = 0;
                switch (game_mode.querySelector("select").value) {
                    case "pva":
                        _aiPlayRound = _simpleAI;
                        break;
                    case "pvi":
                        _aiPlayRound = _imposibleAI;
                        break;
                }

                if(game_mode.querySelector("select").value !== "pvp") {
                    info_sign.textContent = "MAKE YOUR NEXT MOVE";
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
                players[i].mark = player_marks[i].querySelector("select").value;
                players[i].name = `Player ${player_marks[i].value}`;
            });
        }

        //Display game.
        view.displayHTML(".gameboard", html_board);
        player_marks.forEach(mark_selector => { view.displayHTML(".settings", mark_selector); });
        view.displayHTML(".settings", game_mode);
        view.displayHTML(".info", info_sign);
        view.displayHTML(".game", stop_start_button);
    }

    return{ init }
})(ViewController, HTMLGenerator, Gameboard);

// ---------------------------------------- Exec ----------------------------------------

GameController.init()