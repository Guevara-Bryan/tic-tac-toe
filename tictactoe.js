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

    return{
        updateCell,
        getBoardArray,
        getCell
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

    return{
        generateBoard
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

    const players = Array(3); // 1 and 2 are players. 3 is the current player.
    
    // Makes a player object.
    function _makePlayer(name, mark, id){ return {name, mark, id}; }

    function init(){
        const html_board = html.generateBoard(board)

        html_board.querySelectorAll(".cell").forEach(cell => {
            cell.addEventListener("click", ()=>{
                if(cell.textContent !== "") return;
                board.updateCell(cell.value, players[2].mark);
                cell.textContent = players[2].mark;

                players[2] = players[2].id == 0 ? players[1] : players[0];
            });
        });

        view.displayHTML(".container", html_board);
    }

    function play(){
        players[0] = _makePlayer("Bryan", "❌", 0);
        players[1] = _makePlayer("Daniela", "⭕️", 1);
        players[2] = players[0];
        
    }

    return{ init, play}
})(ViewController, HTMLGenerator, Gameboard);



GameController.init()
GameController.play();