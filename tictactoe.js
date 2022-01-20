// Board structure where game status is stored.
let Gameboard = (function(){
    const board = [];
    for(let i = 0; i < 9; i++){
        board.push({mark: "", arr_id: i});
    }
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

    return{
        updateCell,
        getBoardArray,
        getCell,
        hasWon,
        clear, 
        isFull
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

    function generateSelect(options, selected=0){
        const select = doc.createElement("select");
        for(let i = 0; i < options.length; i++){
            if(i === selected){
                select.innerHTML += `<option value=${options[i]} selected>${options[i]}</option>`
            }
            select.innerHTML += `<option value=${options[i]}>${options[i]}</option>`
        }
        return select
    }

    return{
        generateBoard,
        generateH1,
        generateSelect
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

    const players = []; // 1 and 2 are players. 3 is the current player.

    //
    const html_board = html.generateBoard(board)
    const player_marks = [html.generateSelect(["❌", "⭕️", "🦠", "💉"]),
                          html.generateSelect(["❌", "⭕️", "🦠", "💉"], 1)] 
    const info_sign = html.generateH1("Begin Game!");


    // Makes a player object.
    function _makePlayer(name, mark){ 
        return {name, mark, id: players.length}
    }

    function init(){
        players.push(_makePlayer(`Player ${player_marks[0].value}` , player_marks[0].value));
        players.push(_makePlayer(`Player ${player_marks[1].value}` , player_marks[1].value));
        players[2] = players[0];


        html_board.querySelectorAll(".cell").forEach(cell => {
            cell.addEventListener("click", ()=>{
                if(cell.textContent !== "") return;
                board.updateCell(cell.value, players[2].mark);
                cell.textContent = players[2].mark;


                players[2] = players[2].id == 0 ? players[1] : players[0];
                
                const result = board.hasWon(players[2])
                if(result){
                    info_sign.textContent = `${result.name} won the game!`;
                    setTimeout(_endGame, 2000);
                }else if(board.isFull()){
                    info_sign.textContent = "It's a DRAW!";
                    setTimeout(_endGame, 2000);
                }else{
                    info_sign.textContent = `It ${players[2].name}'s turn.`;
                }
            });
        });

        for(let i = 0; i < 2; i++){
            player_marks[i].addEventListener("change", ()=>{
                players[i].mark = player_marks[i].value;
                players[i].name = `Player ${player_marks[i].value}`;
            });
        }

        view.displayHTML(".gameboard", html_board);
        player_marks.forEach(mark_selector => {view.displayHTML(".settings", mark_selector)});
        view.displayHTML(".info", info_sign);
    }

    function _endGame(){
        info_sign.textContent = "Begin Game!"
        board.clear();
        html_board.querySelectorAll(".cell").forEach(cell => cell.textContent = "");
    }

    return{ init }
})(ViewController, HTMLGenerator, Gameboard);



GameController.init()