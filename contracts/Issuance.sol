// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.6.0 <0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./token/IERC20Mintable.sol";
import "./state/StateMachine.sol";

/// @title Issuance smart contract
/// @author Le Brian
/// @notice This contract is used for crowdfunding, token sale event
contract Issuance is Ownable, ReentrancyGuard, StateMachine {
    using SafeMath for uint256;
    bytes32 public currentEvent;
    IERC20Mintable private issuanceToken;

    struct SaleEvent {
        uint256 issuancePrice;
        uint256 minDeposit;
        uint256 maxDeposit;
        uint256 fundGoal;
        uint256 timeEnd;
    }

    mapping(bytes32 => SaleEvent) public saleEvents;
    uint256 public fundRaised;
    mapping(address => uint256) public investments;

    event SaleEventInvested(
        address investor,
        uint256 amount,
        bytes32 eventName
    );
    event SaleEventWithdrawn(address target, uint256 amount);

    constructor() 
        StateMachine() 
    {
        _addTransition("SETUP", "OPEN");
        _addTransition("OPEN", "CLOSE");
        _addTransition("CLOSE", "WITHDRAW");
        _addTransition("WITHDRAW", "SETUP");
    }

    /// @notice Set issuance token that can be distributed later
    /// @dev Token must be inherited from IERC20Mintable
    /// @param _issuanceAddress Issuance token deployed address
    function setIssuanceToken(address _issuanceAddress) public onlyOwner {
        require(_issuanceAddress != address(0), "Issuance is 0x0 address");
        issuanceToken = IERC20Mintable(_issuanceAddress);
    }

    /// @notice Setup an upcoming event
    /// @dev Must call at stage SETUP
    /// @param _event Name of event, used as primary key
    /// @param _issuancePrice Price of the issuance token, ETH/Token rate
    /// @param _minDeposit Minimum amount that investor can deposit (Ether format)
    /// @param _maxDeposit Maximum amount that investor can deposit (Ether format)
    /// @param _fundGoal Funding amount goal for this event (Ether format)
    /// @param _timeEnd Event will close at this time (in epoch timestamp)
    function setupEvent(
        bytes32 _event,
        uint256 _issuancePrice,
        uint256 _minDeposit,
        uint256 _maxDeposit,
        uint256 _fundGoal,
        uint256 _timeEnd
    ) public onlyOwner atStage("SETUP") {
        require(_issuancePrice > 0, "Negative issuance price");
        require(_minDeposit > 0, "Negative min deposit");
        require(_maxDeposit > 0, "Negative max deposit");
        require(_fundGoal > 0, "Negative fund goal");
        require(_timeEnd > block.timestamp, "Time end in the past");

        SaleEvent memory saleEvent = SaleEvent(
            _issuancePrice,
            _minDeposit.mul(1e18),
            _maxDeposit.mul(1e18),
            _fundGoal.mul(1e18),
            _timeEnd
        );
        saleEvents[_event] = saleEvent;
    }

    /// @notice Set event
    /// @param _event Name of the event
    /// @dev Stage must be SETUP or OPEN
    function setEvent(bytes32 _event) public onlyOwner {
        require(
            currentStage == "SETUP" || currentStage == "OPEN",
            "Not allow at this stage"
        );
        currentEvent = _event;
    }

    /// @notice Start event
    /// @dev Stage transits to OPEN
    function startEvent() public onlyOwner {
        _transition("OPEN");
    }

    /// @notice Close event
    /// @dev Stage transits to CLOSE
    function closeEvent() public onlyOwner {
        _transition("CLOSE");
    }

    /// @notice Withdraw event
    /// @dev Stage transits to WITHDRAW
    function withdrawEvent() public onlyOwner {
        _transition("WITHDRAW");
    }

    /// @notice Re setup event
    /// @dev Stage transits to SETUP
    function reSetupEvent() public onlyOwner {
        _transition("SETUP");
    }

    /// @notice Investor send fund using this method
    /// @dev Must be called on stage OPEN
    function invest() external payable nonReentrant atStage("OPEN") {
        // get wei value sent
        // get total raised wei
        // get total issuance token amount this sender can receive
        uint256 _investInWei = msg.value;
        uint256 _receiveAmount = investments[msg.sender];

        SaleEvent memory _saleEvent = saleEvents[currentEvent];

        require(
            _investInWei >= _saleEvent.minDeposit,
            "Deposited less than minimum amount"
        );
        require(
            _investInWei <= _saleEvent.maxDeposit,
            "Deposited larger than maximum amount"
        );

        // Total raised wei must be less than fund goal
        require(
            fundRaised < _saleEvent.fundGoal,
            "Goal reached, see you next time"
        );

        // add invested wei to total fund
        fundRaised = fundRaised.add(_investInWei);
        // sender received amount increases invest*issuancePrice
        investments[msg.sender] = _receiveAmount.add(_investInWei.mul(_saleEvent.issuancePrice));

        emit SaleEventInvested(msg.sender, msg.value, currentEvent);
    }

    /// @notice Investor call this method to receive issuance token
    /// @dev Must be called on stage CLOSE
    function withdraw() public atStage("WITHDRAW") {
        // get issuance amount received by sender address
        uint256 _receiveAmount = investments[msg.sender];
        require(_receiveAmount > 0, "Already withdrawn");

        // reset to 0 when withdraw successful
        investments[msg.sender] = 0;
        // mint to sender
        issuanceToken.mint(msg.sender, _receiveAmount);

        emit SaleEventWithdrawn(msg.sender, _receiveAmount);
    }

    /// @notice Deployer call this method to transfer contract balance to wallet
    /// @param _wallet Wallet address that will receive fund
    /// @dev Must be called on stage WITHDRAW
    function transferFund(address payable _wallet)
        public
        onlyOwner
        atStage("WITHDRAW")
    {
        require(_wallet != address(0), "Transfer to 0x0 address");
        (bool success, ) = _wallet.call{value: address(this).balance}("");
        require(success, "Transfer failed");
    }

}
