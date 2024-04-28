const { randomUUID, createHmac } = require('crypto');
const AsciiTable = require('ascii-table');
const readline = require('readline-sync');

class Game {
    play() {
        if(this.#isValidInput()) {
            console.log("Please provide an odd number of unique moves (minimum of 3) \nExample: Rock Paper Scissors")
            process.exit(0);
        }
        let computerMove = this.getComputerMove();
        let secretKey = new KeyGenerator().generateRandomKey();
        let hmacCalculator = new HmacCalculator();

        console.log(`HMAC: ${hmacCalculator.calculateHmac(secretKey, moves[computerMove])}`);
        this.displayMenu();
        let userMove = this.handleUserInput();
        let result = this.determineOutcome(computerMove, userMove);
        this.diplayFinalResults(computerMove, userMove, result);
        this.displayKey(secretKey);
    }

    displayMenu() {
        console.log("Available moves:")
        for (let i = 1; i <= moves.length; i++) {
            console.log(`${i}: ${moves[i-1]}`)
        }
        console.log('0: exit')
        console.log('?: help')
    }

    handleUserInput() {
        while(true) {
            const move = readline.question("Enter your move: ");
            if (move === '0') {
                console.log("Exiting...");
                process.exit(0);
            } else if (move === '?') {
                let tableGenerator = new HelpTableGenerator(this.determineOutcome);
                console.log(tableGenerator.generateHelpTable());
            } else if (this.#isValidMove(move)) {
                return move;
            } else {
                console.log(`Please enter a move number between 1 (${moves[0]}) and ${N} (${moves[N-1]}).`);
            }
        }
    }

    getComputerMove() {
        const computerMove = Math.floor(Math.random() * N);
        return computerMove;
    }

    determineOutcome(computerMove, userMove) {
        let result = Math.sign((computerMove - userMove + P + N) % N - P);
        return result > 0 ? 'Win' : result == 0 ? 'Draw' : 'Lose';
    }

    diplayFinalResults(computerMove, userMove, result) {
        console.log(`Your move: ${moves[userMove-1]}`);
        console.log(`Computer move: ${moves[computerMove]}`);
        console.log(result == 'Draw' ? 'Draw' : `You ${result}!`);
    }

    displayKey(secretKey) {
        console.log('--------------------------------------');
        console.log(`Key: ${secretKey}`);
        console.log(`To verify fair play, visit https://www.devglan.com/online-tools/hmac-sha256-online`)
    }

    #isValidInput() {
        if (N < 3 || !(N&1) || new Set(moves).size!=N) {
            return true;
        } else {
            return false;
        }
    }

    #isValidMove(move) {
        return move > 0 && move <= N;
    }
}

class HelpTableGenerator {
    constructor(determineOutcomeFunction) {
        this.determineOutcome = determineOutcomeFunction;
    }

    generateHelpTable() {
        const description = 'The victory is defined based on a circular relationship between the moves:\nImagine the moves as Rock (R), Paper (P), and Scissors (S) arranged in a circle:\nR -> P -> S -> R. If you choose R, then P and S that come \x1b[42mafter\x1b[0m it in the circle\nwill defeat it. Conversely, moves that come \x1b[42mbefore\x1b[0m it (S) will lose.\n\x1b[0m'
        const table = new AsciiTable('Your moves - Our rules');
        table.setHeading('v User\\PC >', ...moves);

        for (let i = 0; i < moves.length; i++) {
          const row = this.#generateTableRow(i);
          table.addRow(row);
        }

        return description + table.toString();
    }

    #generateTableRow(move) {
        const row = [moves[move]];
        for (let j = 0; j < moves.length; j++) {
            row.push(this.determineOutcome(move, j));
        }
        return row;
    }
}

class KeyGenerator {
    generateRandomKey(keyLength = 256) {
        return randomUUID({ size: keyLength / 8 })
    }
}

class HmacCalculator {
    calculateHmac(key, message, algorithm = 'sha256') {
        return createHmac(algorithm, key)
            .update(message)
            .digest('hex');
    }
}


const moves = process.argv.slice(2);
const N = moves.length;
const P = Math.floor(N / 2);

let game = new Game();
game.play();