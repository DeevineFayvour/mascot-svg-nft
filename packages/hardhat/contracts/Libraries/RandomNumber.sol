pragma solidity ^0.8.0;

//SPDX-License-Identifier: MIT

library RandomNumber {
	function genertaeRandomNumber(uint256 id) internal view returns (uint8) {
		bytes32 predictableRandom = keccak256(
			abi.encodePacked(id, (block.number), msg.sender, address(this))
		);

		return (uint8(predictableRandom[4])) % 4;
	}
}
