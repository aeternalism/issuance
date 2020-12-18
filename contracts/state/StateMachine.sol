// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.6.0 <0.8.0;

/// @title State Machine pattern implemented
/// @author Le Brian
/// @notice State and Transition management smart contract
contract StateMachine {

    bytes32 public currentStage;
    mapping(bytes32 => bytes32) _transitions;

    constructor() 
    {
        currentStage = "SETUP";
    }

    /// @notice Check if target stage is on current stage
    /// @param _targetStage Target to check
    modifier atStage(bytes32 _targetStage)
    {
        require(
            currentStage == _targetStage,
            "Not allow at this stage"
        );
        _;
    }

    /// @notice Check if transition is declared
    /// @param _currentStage Current stage
    /// @param _nextStage Next stage
    function _checkExistedTransition(bytes32 _currentStage, bytes32 _nextStage)
        internal
        view
        returns(bool)
    {
        return _transitions[_currentStage] == _nextStage;
    }

    /// @notice Declare transition
    /// @param _currentStage Current stage
    /// @param _nextStage Next stage
    function _addTransition(bytes32 _currentStage, bytes32 _nextStage)
        internal
    {
        require(!_checkExistedTransition(_currentStage, _nextStage), "Existed transition!");
        _transitions[_currentStage] = _nextStage;
    }

    /// @notice State transits to target stage
    /// @param _targetStage Target to transit
    function _transition(bytes32 _targetStage)
        internal
    {
        require(_checkExistedTransition(currentStage, _targetStage), "Transition not found");
        currentStage = _targetStage;
    }
}
