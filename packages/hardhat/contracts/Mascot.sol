pragma solidity ^0.8.0;
//SPDX-License-Identifier: MIT

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "./Libraries/MascotLibrary.sol";
import "./Libraries/NFTContract.sol";
import "./Libraries/ToUint256.sol";
import "./Libraries/TokenUriLibrary.sol";

contract Mascot is ERC721Enumerable, IERC721Receiver {
	struct upgradeIds {
		uint256 hatId;
		uint256 scarfId;
	}

	struct NftContracts {
		address hatContract;
		address scarfContract;
	}

	uint256 _tokenIds;

	mapping(address => mapping(uint256 => uint256)) nftById;
	mapping(uint256 => uint256) mintTime;

	mapping(uint8 => NftContracts) nftContracts;

	address payable constant recipient =
		payable(0xCA2951165B67Bce993c86b97D1a96bb1C4e3C326);

	uint256 public constant limit = 2000;
	uint256 public price = 0.005 ether;

	mapping(uint256 => upgradeIds) public mascotUpgrades;

	constructor(address _hat, address _scarf) ERC721("Mascot", "MSC") {
		nftContracts[0].hatContract = _hat;
		nftContracts[0].scarfContract = _scarf;
	}

	function mintItem() public payable returns (uint256) {
		if (msg.value < price) revert();
		if (_tokenIds >= limit) revert();

		_tokenIds += 1;

		uint256 id = _tokenIds;
		_mint(msg.sender, id);

		mintTime[id] = block.timestamp;

		(bool success, ) = recipient.call{ value: msg.value }("");
		require(success, "could not send");

		return id;
	}

	function tokenURI(uint256 id) public view override returns (string memory) {
		if (!_exists(id)) revert();
		return
			TokenUriLibrary._tokenUri(
				id,
				getDescription(id),
				ownerOf(id),
				generateSVGofTokenById(id)
			);
	}

	function generateSVGofTokenById(
		uint256 id
	) internal view returns (string memory) {
		return
			string(
				abi.encodePacked(
					' <svg width="1080" height="1080" viewBox="0 0 1080 1080" fill="none" xmlns="http://www.w3.org/2000/svg">',
					renderTokenById(id),
					"</svg>"
				)
			);
	}

	function getDescription(uint256 id) public view returns (string memory) {
		string memory desc = "Mascot";

		uint256 hatId = mascotUpgrades[id].hatId;
		uint256 scarfId = mascotUpgrades[id].scarfId;

		if (hatId > 0 && scarfId > 0) {
			desc = "Mascot with a hat and scarf";
		} else if (hatId > 0 && scarfId == 0) {
			desc = "Mascot with  a hat";
		} else if (hatId == 0 && scarfId > 0) {
			desc = "Mascot with  a scarf";
		}

		return string(abi.encodePacked(desc));
	}

	function renderTokenById(uint256 id) public view returns (string memory) {
		string memory render = string(
			abi.encodePacked(MascotLibrary.getMascot())
		);

		uint256 hatId = mascotUpgrades[id].hatId;
		uint256 scarfId = mascotUpgrades[id].scarfId;

		if (hatId > 0) {
			render = string(
				abi.encodePacked(
					render,
					NFTContract(nftContracts[0].hatContract).renderTokenById(
						hatId
					)
				)
			);
		}

		if (scarfId > 0) {
			render = string(
				abi.encodePacked(
					render,
					NFTContract(nftContracts[0].scarfContract).renderTokenById(
						scarfId
					)
				)
			);
		}

		return render;
	}

	function removeNftFromMascot(address nft, uint256 id) external {
		if (msg.sender != ownerOf(id)) revert();

		if ((nftById[nft][id] == 0)) revert();

		_removeNftFromMascot(nft, id);
	}

	function _removeNftFromMascot(address nftContract, uint256 id) internal {
		if (nftContract == nftContracts[0].hatContract) {
			mascotUpgrades[id].hatId = 0;
		}
		if (nftContract == nftContracts[0].scarfContract) {
			mascotUpgrades[id].scarfId = 0;
		}

		NFTContract(nftContract).transferFrom(
			address(this),
			ownerOf(id),
			nftById[address(nftContract)][id]
		);

		nftById[address(nftContract)][id] = 0;
	}

	function onERC721Received(
		address /*operator*/,
		address from,
		uint256 tokenId,
		bytes calldata fancyIdData
	) external override returns (bytes4) {
		uint256 fancyId = ToUint256._toUint256(fancyIdData);

		if (ownerOf(fancyId) != from) revert();

		if (nftById[msg.sender][fancyId] != 0) revert();

		nftById[msg.sender][fancyId] = tokenId;

		if (msg.sender == nftContracts[0].hatContract) {
			mascotUpgrades[fancyId].hatId = tokenId;
		}
		if (msg.sender == nftContracts[0].scarfContract) {
			mascotUpgrades[fancyId].scarfId = tokenId;
		}

		return this.onERC721Received.selector;
	}
}
