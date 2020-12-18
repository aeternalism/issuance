// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.6.0 <0.8.0;

/// @title IERC20 with mint function
/// @author Le Brian
/// @notice Add mintable function to IERC20
interface IERC20Mintable {
    function mint(address to, uint256 amount) external returns(bool);
}
