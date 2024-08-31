// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

contract Bet {
    struct BetInfo {
        address player1;
        address player2;
        uint256 amount;
        bool isChallenged;
    }

    mapping(address => BetInfo) public bets;
    uint256 public initialBetAmount;

    // Player 1 places a bet
    function bet() external payable {
        require(msg.value > 0, "Bet must be greater than 0");
        require(bets[msg.sender].amount == 0, "You have already placed a bet"); // This means they can only place one bet at a time, should change this later

        initialBetAmount = msg.value;
        bets[msg.sender] = BetInfo(msg.sender, address(0), msg.value, false);
    }

    // Player 2 challenges the bet
    function challengeBet(address _player1) external payable {
        BetInfo storage betInfo = bets[_player1];

        require(betInfo.amount > 0, "No bet found for this player");
        require(!betInfo.isChallenged, "Bet already challenged");
        require(
            msg.value == initialBetAmount,
            "Bet must match original bettor's amount"
        );

        betInfo.player2 = msg.sender;
        betInfo.isChallenged = true;
    }

    // Winner withdraws their winnings
    function withdraw(address _player1) external {
        BetInfo storage betInfo = bets[_player1];

        require(betInfo.isChallenged, "Bet has not been challenged");
        require(
            msg.sender == _player1 || msg.sender == betInfo.player2,
            "Only players involved in the bet can withdraw"
        );

        uint256 totalAmount = betInfo.amount * 2;
        require(
            address(this).balance >= totalAmount,
            "Not enough funds in contract"
        );

        delete bets[_player1]; // Reset the bet info after payout
        payable(msg.sender).transfer(totalAmount);
    }

    // Get contract balance
    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }
}
