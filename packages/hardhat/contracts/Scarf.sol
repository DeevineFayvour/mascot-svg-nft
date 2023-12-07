pragma solidity ^0.8.0;
//SPDX-License-Identifier: MIT

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "base64-sol/base64.sol";

import "./Libraries/ScarfLibrary.sol";
import "hardhat/console.sol";

// GET LISTED ON OPENSEA: https://testnets.opensea.io/get-listed/step-two

contract Scarf is ERC721Enumerable {
	using Strings for uint256;
	using Strings for uint160;
	using Counters for Counters.Counter;

	Counters.Counter private _tokenIds;

	address payable public constant recipient =
		payable(0xCA2951165B67Bce993c86b97D1a96bb1C4e3C326);

	uint256 public constant limit = 3000;
	uint256 price = 0.002 ether;

	constructor() ERC721("MascotScarf", "MCS") {}

	function mintItem() public payable returns (uint256) {
		require(msg.value >= price, "NOT ENOUGH");
		require(_tokenIds.current() <= limit);

		_tokenIds.increment();

		uint256 id = _tokenIds.current();
		_mint(msg.sender, id);

		(bool success, ) = recipient.call{ value: msg.value }("");
		require(success, "could not send");

		return id;
	}

	function renderTokenById(uint256 id) public view returns (string memory) {
		require(_exists(id), "!exist");
		string memory render = ScarfLibrary.getScarf();
		return render;
	}

	// function generateSVGofTokenById(uint256 id) internal view returns (string memory) {
	function generateSVGofTokenById(
		uint256 id
	) internal view returns (string memory) {
		require(_exists(id), "!exist");
		string memory svg = string(
			abi.encodePacked(
				'<svg width="1080" height="1080" viewBox="0 0 1080 1080" fill="none" xmlns="http://www.w3.org/2000/svg">',
				renderTokenById(id),
				"</svg>"
			)
		);
		return svg;
	}

	function getDescription(uint256 id) public view returns (string memory) {
		require(_exists(id), "!exist");
		string memory desc = "Scarf";
		return desc;
	}

	function tokenURI(uint256 id) public view override returns (string memory) {
		require(_exists(id), "!exist");

		string memory name = string(
			abi.encodePacked("Mascot Scarf #", id.toString())
		);

		string memory description = "Scarf";
		string memory image = Base64.encode(bytes(generateSVGofTokenById(id)));

		return
			string(
				abi.encodePacked(
					"data:application/json;base64,",
					Base64.encode(
						bytes(
							abi.encodePacked(
								'{"name":"',
								name,
								'","description":"',
								description,
								'","external_url":"https://yourCollectible.com/token/',
								id.toString(),
								'"}], "owner":"',
								(uint160(ownerOf(id))).toHexString(20),
								'","image": "',
								"data:image/svg+xml;base64,",
								image,
								'"}'
							)
						)
					)
				)
			);
	}
}
