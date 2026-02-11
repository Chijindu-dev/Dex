// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./DexPair.sol";

/**
 * @title DexFactory
 * @dev Factory contract for creating and managing token pairs
 */
contract DexFactory {
    address public feeTo;
    address public feeToSetter;

    mapping(address => mapping(address => address)) public getPair;
    address[] public allPairs;

    event PairCreated(address indexed token0, address indexed token1, address pair, uint256);

    constructor(address _feeToSetter) {
        feeToSetter = _feeToSetter;
    }

    function allPairsLength() external view returns (uint256) {
        return allPairs.length;
    }

    /**
     * @dev Creates a new pair for tokenA and tokenB
     * @param tokenA First token address
     * @param tokenB Second token address
     * @return pair Address of the created pair
     */
    function createPair(address tokenA, address tokenB) external returns (address pair) {
        require(tokenA != tokenB, "DexFactory: IDENTICAL_ADDRESSES");
        require(tokenA != address(0) && tokenB != address(0), "DexFactory: ZERO_ADDRESS");
        require(getPair[tokenA][tokenB] == address(0), "DexFactory: PAIR_EXISTS");

        // Ensure deterministic ordering
        (address token0, address token1) = tokenA < tokenB ? (tokenA, tokenB) : (tokenB, tokenA);

        // Create new pair using salt for deterministic address
        bytes32 salt = keccak256(abi.encodePacked(token0, token1));
        pair = address(new DexPair{salt: salt}());
        DexPair(pair).initialize(token0, token1);

        // Map both directions for convenience
        getPair[tokenA][tokenB] = pair;
        getPair[tokenB][tokenA] = pair;
        allPairs.push(pair);

        emit PairCreated(token0, token1, pair, allPairs.length);
    }

    /**
     * @dev Sets the fee recipient address
     * @param _feeTo New fee recipient address
     */
    function setFeeTo(address _feeTo) external {
        require(msg.sender == feeToSetter, "DexFactory: FORBIDDEN");
        feeTo = _feeTo;
    }

    /**
     * @dev Sets the fee setter address
     * @param _feeToSetter New fee setter address
     */
    function setFeeToSetter(address _feeToSetter) external {
        require(msg.sender == feeToSetter, "DexFactory: FORBIDDEN");
        feeToSetter = _feeToSetter;
    }
}
