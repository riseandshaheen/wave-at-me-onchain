// SPDX-License-Identifier: UNLICENSED
/* Change List 
CH01 - @SHAHEEN - Deprecated saving wave to address mapping
CH02 - @SHAHEEN - Modified wave function to take message argument and push wave data in a struct 
CH03 - @SHAHEEN - Sending 0.0001 ETH to all lovely wavers
CH04 - @SHAHEEN - Now only lucky few will get a chance to win eth + Cooldown logic. Dont want a spammer to keep waving and finish our funds!
updates to git
*/

pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract WavePortal {
    uint256 totalWaves;

    uint256 private seed; //CH04

    /* CH01 deprecated 
    mapping (uint256 => address) waveIdToAddress; */

    /* CH02 Save waver's address, timestamp, and their msg */
    event NewWave(address indexed from, uint256 timestamp, string message);
    struct Wave {
        address waver; // The address of the user who waved.
        string message; // The message the user sent.
        uint256 timestamp; // The timestamp when the user waved.
    }
    /* CH02 a dynamic array to store all waves */
    Wave[] waves;

    mapping(address => uint256) public lastWavedAt; //ch04

    constructor() payable {
        console.log("Smart Contract 3.0 unleashed");
    }

    function wave(string memory _message) public {

        require(
            lastWavedAt[msg.sender] + 15 minutes < block.timestamp,
            "Wait 15m"
        );
        lastWavedAt[msg.sender] = block.timestamp;

        totalWaves += 1;
        /*CH01 waveIdToAddress[totalWaves] =  msg.sender; */

        waves.push(Wave(msg.sender, _message, block.timestamp));
        console.log("Congrats! %s has waved", msg.sender);
        emit NewWave(msg.sender, block.timestamp, _message); //CH02

        //CH04
        uint256 randomNumber = (block.difficulty + block.timestamp + seed) % 100;
        console.log("Random # generated: %s", randomNumber);
        seed = randomNumber;

        if (randomNumber < 50) {
            console.log("%s won!", msg.sender);
            /* CH03 */
            uint256 prizeAmount = 0.0001 ether;
            require(
                prizeAmount <= address(this).balance,
                "Trying to withdraw more money than the contract has."
            );
            (bool success, ) = (msg.sender).call{value: prizeAmount}("");
            require(success, "Failed to withdraw money from contract.");
        }
    }

    /*CH02 return the array of waves */
    function getAllWaves() public view returns (Wave[] memory) {
        return waves;
    }

    function getTotalWaves() public view returns (uint256) {
        console.log("%s total waves recieved", totalWaves);
        /* CH01
        console.log("------------------------");
        console.log("Wave Id          Visitor");
        console.log("------------------------");
        for(uint i=1;i<=totalWaves;i++)
        {
            console.log("%s   ->   %s", i, waveIdToAddress[i]);
        }
        */
        return totalWaves;
    }
}
