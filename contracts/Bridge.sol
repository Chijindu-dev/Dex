// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title Bridge
 * @dev Token bridge contract for cross-chain operations
 */
contract Bridge is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;

    // Bridge fees in basis points (100 = 1%)
    uint256 public bridgeFeePercentage = 25; // 0.25%
    uint256 private constant BASIS_POINTS = 10000;

    // Maximum bridge limit per transaction
    uint256 public maxBridgeAmount = type(uint256).max;

    // Minimum bridge amount
    uint256 public minBridgeAmount = 1e18; // 1 token minimum

    // Supported tokens
    mapping(address => bool) public supportedTokens;
    mapping(address => bool) public isWrappedToken;
    mapping(address => address) public wrappedToOriginal;
    mapping(address => address) public originalToWrapped;

    // User bridge history
    mapping(address => BridgeTransaction[]) public userBridgeHistory;

    // Fee recipient
    address public feeRecipient;

    // Bridge statistics
    uint256 public totalBridged;
    mapping(address => uint256) public tokenBridgedAmount;

    // Events
    event TokenBridged(
        address indexed user,
        address indexed token,
        uint256 amount,
        uint256 fee,
        uint256 timestamp,
        string destinationChain
    );

    event TokenUnbridged(
        address indexed user,
        address indexed token,
        uint256 amount,
        uint256 timestamp,
        string sourceChain
    );

    event TokenSupported(address indexed token, string name);
    event TokenRemoved(address indexed token);
    event WrappedTokenCreated(address indexed original, address indexed wrapped);
    event FeeUpdated(uint256 newFee);
    event MaxAmountUpdated(uint256 newMax);

    struct BridgeTransaction {
        address token;
        uint256 amount;
        uint256 fee;
        uint256 timestamp;
        string destinationChain;
        bool completed;
    }

    constructor(address _feeRecipient) {
        feeRecipient = _feeRecipient;
    }

    // ============ Bridge Functions ============

    /**
     * @dev Bridge tokens to another chain
     * @param token Address of token to bridge
     * @param amount Amount to bridge
     * @param destinationChain Name of destination chain
     */
    function bridgeToken(
        address token,
        uint256 amount,
        string memory destinationChain
    ) external nonReentrant {
        require(supportedTokens[token], "Token not supported");
        require(amount > 0, "Amount must be greater than 0");
        require(amount >= minBridgeAmount, "Amount below minimum");
        require(amount <= maxBridgeAmount, "Amount exceeds maximum");

        // Calculate fee
        uint256 fee = (amount * bridgeFeePercentage) / BASIS_POINTS;
        uint256 amountAfterFee = amount - fee;

        // Transfer tokens from user
        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);

        // Transfer fee to fee recipient
        if (fee > 0) {
            IERC20(token).safeTransfer(feeRecipient, fee);
        }

        // Update statistics
        totalBridged += amountAfterFee;
        tokenBridgedAmount[token] += amountAfterFee;

        // Record transaction
        userBridgeHistory[msg.sender].push(
            BridgeTransaction({
                token: token,
                amount: amountAfterFee,
                fee: fee,
                timestamp: block.timestamp,
                destinationChain: destinationChain,
                completed: false
            })
        );

        emit TokenBridged(msg.sender, token, amountAfterFee, fee, block.timestamp, destinationChain);
    }

    /**
     * @dev Receive bridged tokens from another chain
     * @param token Address of token to receive
     * @param user Address of recipient
     * @param amount Amount to receive
     * @param sourceChain Name of source chain
     */
    function unbridgeToken(
        address token,
        address user,
        uint256 amount,
        string memory sourceChain
    ) external onlyOwner nonReentrant {
        require(token != address(0), "Invalid token address");
        require(user != address(0), "Invalid user address");
        require(amount > 0, "Amount must be greater than 0");

        // Transfer tokens to user
        IERC20(token).safeTransfer(user, amount);

        emit TokenUnbridged(user, token, amount, block.timestamp, sourceChain);
    }

    // ============ Admin Functions ============

    /**
     * @dev Add supported token
     */
    function addSupportedToken(address token) external onlyOwner {
        require(token != address(0), "Invalid token address");
        require(!supportedTokens[token], "Token already supported");

        supportedTokens[token] = true;
        emit TokenSupported(token, "New Supported Token");
    }

    /**
     * @dev Remove supported token
     */
    function removeSupportedToken(address token) external onlyOwner {
        require(supportedTokens[token], "Token not supported");

        supportedTokens[token] = false;
        emit TokenRemoved(token);
    }

    /**
     * @dev Update bridge fee percentage
     */
    function setBridgeFee(uint256 newFeePercentage) external onlyOwner {
        require(newFeePercentage <= 1000, "Fee too high (max 10%)");

        bridgeFeePercentage = newFeePercentage;
        emit FeeUpdated(newFeePercentage);
    }

    /**
     * @dev Update max bridge amount
     */
    function setMaxBridgeAmount(uint256 newMax) external onlyOwner {
        require(newMax > 0, "Max amount must be greater than 0");

        maxBridgeAmount = newMax;
        emit MaxAmountUpdated(newMax);
    }

    /**
     * @dev Update minimum bridge amount
     */
    function setMinBridgeAmount(uint256 newMin) external onlyOwner {
        require(newMin > 0, "Min amount must be greater than 0");

        minBridgeAmount = newMin;
    }

    /**
     * @dev Update fee recipient
     */
    function setFeeRecipient(address newFeeRecipient) external onlyOwner {
        require(newFeeRecipient != address(0), "Invalid address");

        feeRecipient = newFeeRecipient;
    }

    /**
     * @dev Emergency token withdrawal
     */
    function emergencyWithdraw(address token) external onlyOwner {
        uint256 balance = IERC20(token).balanceOf(address(this));
        require(balance > 0, "No tokens to withdraw");

        IERC20(token).safeTransfer(owner(), balance);
    }

    // ============ View Functions ============

    /**
     * @dev Get user bridge history
     */
    function getUserBridgeHistory(address user) external view returns (BridgeTransaction[] memory) {
        return userBridgeHistory[user];
    }

    /**
     * @dev Get bridge history length
     */
    function getUserBridgeHistoryLength(address user) external view returns (uint256) {
        return userBridgeHistory[user].length;
    }

    /**
     * @dev Calculate bridge fee
     */
    function calculateBridgeFee(address token, uint256 amount) external view returns (uint256) {
        require(supportedTokens[token], "Token not supported");

        return (amount * bridgeFeePercentage) / BASIS_POINTS;
    }

    /**
     * @dev Get supported token status
     */
    function isSupportedToken(address token) external view returns (bool) {
        return supportedTokens[token];
    }
}
