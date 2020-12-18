// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.6.0 <0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import '@openzeppelin/contracts/token/ERC20/ERC20.sol';
import './IERC20Mintable.sol';

/// @title Test token
/// @author Le Brian
contract TestToken is ERC20, IERC20Mintable, Ownable, ReentrancyGuard {

  address private issuance;

  constructor() ERC20("TestToken", "TT") {}

  function setIssuance(address _issuance) 
    public
    onlyOwner
  {
    issuance = _issuance;
  }

  function mint(address to, uint amount) 
    external 
    override
    returns(bool) 
  {
    require(msg.sender == issuance || owner() == _msgSender(), "Not allow to mint");
    super._mint(to, amount);
  }
    
}
