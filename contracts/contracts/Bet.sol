// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

contract Bet {
    struct BetInfo {
        address player1;
        address player2;
        uint256 amount;
        bool isChallenged;
    }

    mapping(address => BetInfo) public bets; // This means for now they can only bet once
    address[] public betAddresses;  // List of addresses that have placed a bet

    // Player 1 places a bet
    function bet() external payable {
        require(msg.value > 0, "Bet must be greater than 0");
        require(bets[msg.sender].amount == 0, "You have already placed a bet");

        bets[msg.sender] = BetInfo(msg.sender, address(0), msg.value, false);
        betAddresses.push(msg.sender);
    }

    // Player 2 challenges the bet
    function challengeBet(address _player1) external payable {
        BetInfo storage betInfo = bets[_player1];

        require(betInfo.amount > 0, "No bet found for this player");
        require(!betInfo.isChallenged, "Bet already challenged");
        require(msg.value == betInfo.amount, "Bet must match original bettor's amount");

        betInfo.player2 = msg.sender;
        betInfo.isChallenged = true;
        betAddresses.push(msg.sender);
    }

    // Winner withdraws their winnings
    // Instead of finding bet using _player1, can use db to find cast hash + bet amount
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

    // Function to get active bets for the connected wallet
    function getActiveBets(address user) external view returns (BetInfo[] memory) {
        uint256 count = 0;
        for (uint256 i = 0; i < betAddresses.length; i++) {
            if (
                bets[betAddresses[i]].player1 == user ||
                bets[betAddresses[i]].player2 == user
            ) {
                count++;
            }
        }

        BetInfo[] memory activeBets = new BetInfo[](count);
        uint256 index = 0;
        for (uint256 i = 0; i < betAddresses.length; i++) {
            if (
                bets[betAddresses[i]].player1 == user ||
                bets[betAddresses[i]].player2 == user
            ) {
                activeBets[index] = bets[betAddresses[i]];
                index++;
            }
        }

        return activeBets;
    }

    // Get contract balance
    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }
}
