// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@chainlink/contracts/src/v0.8/KeeperCompatible.sol";

contract CryproPairPricePredictionFactory is
    Pausable,
    ReentrancyGuard,
    KeeperCompatibleInterface
{
    address private owner;
    uint256 pairsCount;
    uint256 minBet;
    uint256 maxBet;
    uint256 treasuryAmount;
    uint256 fees;
    uint256 roundTime;
    mapping(uint256 => AggregatorV3Interface[2]) pairs;
    mapping(uint256 => uint256) pairRounds;
    mapping(uint256 => bool) pairGenesisRound;
    mapping(uint256 => mapping(uint256 => mapping(address => biddingInfo))) userRoundBids;
    mapping(uint256 => mapping(address => uint256[])) userPlayedRounds;
    mapping(uint256 => mapping(uint256 => Rounds)) gameRoundsLedger;
    uint256 amountToBeTransfered;

    enum TokenSelection {
        firstToken,
        secondToken
    }

    struct biddingInfo {
        TokenSelection tokenselected;
        uint256 amount;
        bool claim;
    }

    struct Rounds {
        uint256 pairNumber;
        uint256 poolAmount;
        uint256 firstTokenPoolAmount;
        uint256 secondTokenPoolAmount;
        uint256 poolTokenRewardAmount;
        uint256 poolTokenBaseAmount;
        uint256 roundNumber;
        bool roundStart;
        bool roundEnded;
        bool roundLock;
        bool gotPaused;
        uint256 startTimeStamp;
        uint256 endTimeStamp;
        int256 firstTokenPriceChange;
        int256 secondTokenPriceChange;
        int256 firstTokenPrice;
        int256 secondTokenPrice;
    }

    Rounds gameRound;

    event Received(address, uint256);
    event PercentageTokenChanges(int256, int256);
    event FeesChanged(uint256);
    event RoundExecution(
        uint256 pair,
        uint256 currentRound,
        uint256 previousRound,
        uint256 nextRound
    );
    event StartRound(uint256 pairRound, uint256 pair);
    event EndRound(uint256 pairRound, uint256 pair);
    event Pause(uint256 roundNumber);
    event Unpause(uint256 pairsActivated);
    event Claim(uint256 amount);
    event Bet(uint256 pair, uint256 amount, TokenSelection tokenBetType);
    event PerformUpKeepUpdated(uint256 pair);

    constructor(address _owner) {
        owner = _owner;
        pairsCount = 0;
        treasuryAmount = 0;
        fees = 120;
        roundTime = 300;
        minBet = 10000000000;
    }

    modifier isOwner() {
        require(owner == msg.sender, "Not an owner");
        _;
    }

    modifier betRequirement(uint256 _pairRound, uint256 _pair) {
        require(
            gameRoundsLedger[_pair][_pairRound].roundStart == true,
            "Round has not started"
        );
        require(
            gameRoundsLedger[_pair][_pairRound].roundEnded == false,
            "Round has not ended"
        );
        require(
            gameRoundsLedger[_pair][_pairRound].roundLock == false,
            "Round is locked"
        );
        require(msg.value >= minBet, "Must meet minimum bet");
        require(
            userRoundBids[_pair][_pairRound][msg.sender].amount == 0,
            "User cannot place bid again"
        );
        require(
            gameRoundsLedger[_pair][_pairRound].endTimeStamp >= block.timestamp,
            "Betting time is over"
        );
        _;
    }

    modifier notContract() {
        require(!_isContract(msg.sender), "Contract not allowed");
        require(msg.sender == tx.origin, "Proxy contract not allowed");
        _;
    }

    function changeFees(uint256 _fees) external isOwner {
        fees = _fees;
        emit FeesChanged(fees);
    }

    function getBlockTimeStamp() external view returns (uint256) {
        return block.timestamp;
    }

    function _getPriceChange(int256 num1, int256 num2)
        internal
        pure
        returns (int256)
    {
        if (num1 > num2) {
            return ((num1 - num2) * 100000000) / num1;
        } else {
            return ((num2 - num1) * 100000000) / num1;
        }
    }

    function changeMinBet(uint256 _minBet) external isOwner {
        minBet = _minBet;
    }

    function getPairCount() external view returns (uint256) {
        return pairsCount;
    }

    function changeRoundTime(uint256 _roundTime) external isOwner {
        roundTime = _roundTime;
    }

    function getPairRounds(uint256 _pair, uint256 size)
        external
        view
        returns (Rounds[] memory)
    {
        uint256 length = pairRounds[_pair];
        uint256 counter = 0;
        Rounds[] memory values = new Rounds[](size);
        for (uint256 i = length; i > 0; i--) {
            if (counter >= size) break;
            values[counter] = gameRoundsLedger[_pair][i];
            counter += 1;
        }
        return values;
    }

    function getUserRounds(uint256 _pair)
        external
        view
        returns (biddingInfo[] memory, uint256[] memory)
    {
        uint256[] memory userRounds = userPlayedRounds[_pair][msg.sender];
        uint256 length = userRounds.length;
        biddingInfo[] memory userBids = new biddingInfo[](length);
        for (uint256 i = 0; i < length; i++) {
            userBids[i] = userRoundBids[_pair][userRounds[i]][msg.sender];
        }
        return (userBids, userRounds);
    }

    function _calculateRoundRewards(uint256 _pairRound, uint256 _pair)
        internal
    {
        require(
            gameRoundsLedger[_pair][_pairRound].poolTokenBaseAmount == 0 &&
                gameRoundsLedger[_pair][_pairRound].poolTokenRewardAmount == 0,
            "Rewards calculated"
        );
        Rounds storage currentRound = gameRoundsLedger[_pair][_pairRound];
        if (
            currentRound.firstTokenPriceChange >
            currentRound.secondTokenPriceChange
        ) {
            uint256 feesAmount = (currentRound.poolAmount * fees) / 10000;
            currentRound.poolTokenBaseAmount = currentRound
                .firstTokenPoolAmount;
            currentRound.poolTokenRewardAmount =
                currentRound.poolAmount -
                feesAmount;
            treasuryAmount += feesAmount;
        } else if (
            currentRound.firstTokenPriceChange <
            currentRound.secondTokenPriceChange
        ) {
            uint256 feesAmount = (currentRound.poolAmount * fees) / 10000;
            currentRound.poolTokenBaseAmount = currentRound
                .secondTokenPoolAmount;
            currentRound.poolTokenRewardAmount =
                currentRound.poolAmount -
                feesAmount;
            treasuryAmount += feesAmount;
        } else {
            currentRound.poolTokenBaseAmount = 0;
            currentRound.poolTokenRewardAmount = 0;
            treasuryAmount += currentRound.poolAmount;
        }
    }

    function getTreauryAmount() external isOwner nonReentrant {
        _safeTransfer(msg.sender, treasuryAmount);
    }

    function _safeTransfer(address to, uint256 value) public {
        (bool success, ) = to.call{value: value}("");
        require(success, "Transfer failed");
    }

    function getRoundInfo(uint256 _pairRound, uint256 _pair)
        public
        view
        returns (Rounds memory)
    {
        return gameRoundsLedger[_pair][_pairRound];
    }

    function roundExecution(uint256 _pair) public whenNotPaused {
        require(
            pairGenesisRound[_pair] == true,
            "genesis round has not started"
        );
        uint256 currentRound = pairRounds[_pair];
        _endRound(currentRound - 1, _pair);
        gameRoundsLedger[_pair][currentRound].roundLock = true;
        _startRound(currentRound + 1, _pair);
        pairRounds[_pair] += 1;
        emit RoundExecution(
            _pair,
            currentRound,
            currentRound - 1,
            currentRound + 1
        );
    }

    function claimReward(uint256 _pairRound, uint256 _pair)
        external
        payable
        notContract
        nonReentrant
    {
        require(
            gameRoundsLedger[_pair][_pairRound].roundEnded == true,
            "Round has not ended"
        );
        require(
            gameRoundsLedger[_pair][_pairRound].poolTokenRewardAmount > 0,
            "All the rewards went to pool as price change of both token are equal"
        );
        require(
            userRoundBids[_pair][_pairRound][msg.sender].claim == false,
            "Already claimed"
        );
        Rounds memory currentRound = gameRoundsLedger[_pair][_pairRound];
        require(
            (currentRound.firstTokenPriceChange >
                currentRound.secondTokenPriceChange &&
                userRoundBids[_pair][_pairRound][msg.sender].tokenselected ==
                TokenSelection.firstToken) ||
                (currentRound.firstTokenPriceChange <
                    currentRound.secondTokenPriceChange &&
                    userRoundBids[_pair][_pairRound][msg.sender]
                        .tokenselected ==
                    TokenSelection.secondToken),
            "Cannot claim"
        );

        amountToBeTransfered =
            (userRoundBids[_pair][_pairRound][msg.sender].amount *
                currentRound.poolTokenRewardAmount) /
            currentRound.poolTokenBaseAmount;
        userRoundBids[_pair][_pairRound][msg.sender].claim = true;

        if (amountToBeTransfered > 0) {
            _safeTransfer(address(msg.sender), amountToBeTransfered);
            emit Claim(amountToBeTransfered);
        }
    }

    function firstTokenBet(uint256 _pairRound, uint256 _pair)
        external
        payable
        whenNotPaused
        betRequirement(_pairRound, _pair)
        notContract
        nonReentrant
    {
        userRoundBids[_pair][_pairRound][msg.sender].amount = msg.value;
        userRoundBids[_pair][_pairRound][msg.sender]
            .tokenselected = TokenSelection.firstToken;
        gameRoundsLedger[_pair][_pairRound].poolAmount += msg.value;
        gameRoundsLedger[_pair][_pairRound].firstTokenPoolAmount += msg.value;
        userPlayedRounds[_pair][msg.sender].push(_pairRound);
        emit Bet(_pair, msg.value, TokenSelection.firstToken);
    }

    function secondTokenBet(uint256 _pairRound, uint256 _pair)
        external
        payable
        whenNotPaused
        betRequirement(_pairRound, _pair)
        notContract
        nonReentrant
    {
        userRoundBids[_pair][_pairRound][msg.sender].amount = msg.value;
        userRoundBids[_pair][_pairRound][msg.sender]
            .tokenselected = TokenSelection.secondToken;
        gameRoundsLedger[_pair][_pairRound].poolAmount += msg.value;
        gameRoundsLedger[_pair][_pairRound].secondTokenPoolAmount += msg.value;
        userPlayedRounds[_pair][msg.sender].push(_pairRound);
        emit Bet(_pair, msg.value, TokenSelection.secondToken);
    }

    function pause(uint256 pair) external whenNotPaused isOwner {
        for (uint256 i = 1; i <= pairsCount; i++) {
            uint256 currentPairRound = pairRounds[i];
            gameRoundsLedger[i][currentPairRound].gotPaused = true;
            gameRoundsLedger[i][currentPairRound].endTimeStamp = 0;
            gameRoundsLedger[i][currentPairRound].roundEnded = true;

            if (!gameRoundsLedger[i][currentPairRound - 1].roundEnded) {
                gameRoundsLedger[i][currentPairRound - 1].endTimeStamp = 0;
                gameRoundsLedger[i][currentPairRound - 1].roundEnded = true;
            }
        }
        _pause();
        emit Pause(pair);
    }

    function unpause() external whenPaused isOwner {
        for (uint256 i = 1; i <= pairsCount; i++) {
            pairGenesisRound[i] = false;
        }
        _unpause();
        emit Unpause(pairsCount);
    }

    function startGenesisRoundForThePair(uint256 _pair)
        external
        whenNotPaused
        isOwner
    {
        require(
            pairGenesisRound[_pair] == false,
            "genesis round has already started"
        );

        uint256 currentRound = pairRounds[_pair] + 1;
        _startRound(currentRound, _pair);
        gameRoundsLedger[_pair][currentRound].roundLock = true;
        pairRounds[_pair] = currentRound + 1;
        _startRound(currentRound + 1, _pair);
    }

    function _estimateRoundTime(uint256 _pairRound, uint256 _pair)
        internal
        returns (uint256)
    {
        if (pairGenesisRound[_pair] == false) {
            pairGenesisRound[_pair] = true;
            return block.timestamp + roundTime;
        }
        return gameRoundsLedger[_pair][_pairRound - 1].endTimeStamp + roundTime;
    }

    function _startRound(uint256 _pairRound, uint256 _pair) internal {
        require(
            gameRoundsLedger[_pair][_pairRound].roundStart == false,
            "Round has already been started"
        );
        gameRoundsLedger[_pair][_pairRound].roundStart = true;
        (int256 tokenPrice1, int256 tokenPrice2) = getLatestPrice(pairs[_pair]);
        gameRoundsLedger[_pair][_pairRound].pairNumber = _pair;
        gameRoundsLedger[_pair][_pairRound].roundNumber = _pairRound;
        gameRoundsLedger[_pair][_pairRound].startTimeStamp = block.timestamp;
        gameRoundsLedger[_pair][_pairRound].endTimeStamp = _estimateRoundTime(
            _pairRound,
            _pair
        );
        gameRoundsLedger[_pair][_pairRound].firstTokenPrice = tokenPrice1;
        gameRoundsLedger[_pair][_pairRound].secondTokenPrice = tokenPrice2;

        emit StartRound(_pairRound, _pair);
    }

    function gettokenPriceChanges(uint256 _pairRound, uint256 _pair)
        public
        returns (int256, int256)
    {
        (int256 tokenPrice1, int256 tokenPrice2) = getLatestPrice(pairs[_pair]);
        int256 firstTokenPriceChange = _getPriceChange(
            gameRoundsLedger[_pair][_pairRound].firstTokenPrice,
            tokenPrice1
        );
        int256 secondTokenPriceChange = _getPriceChange(
            gameRoundsLedger[_pair][_pairRound].secondTokenPrice,
            tokenPrice2
        );
        emit PercentageTokenChanges(tokenPrice1, tokenPrice2);
        return (firstTokenPriceChange, secondTokenPriceChange);
    }

    function _endRound(uint256 _pairRound, uint256 _pair) internal {
        require(
            pairGenesisRound[_pair] == true,
            "genesis round has not started"
        );
        require(
            gameRoundsLedger[_pair][_pairRound].roundEnded == false,
            "Round has already ended"
        );
        require(
            gameRoundsLedger[_pair][_pairRound].startTimeStamp > 0,
            "Round has not started"
        );
        require(
            gameRoundsLedger[_pair][_pairRound].endTimeStamp < block.timestamp,
            "Round has not ended"
        );
        (
            int256 firstTokenPriceChange,
            int256 secondTokenPriceChange
        ) = gettokenPriceChanges(_pairRound, _pair);
        gameRoundsLedger[_pair][_pairRound].roundEnded = true;
        gameRoundsLedger[_pair][_pairRound]
            .firstTokenPriceChange = firstTokenPriceChange;
        gameRoundsLedger[_pair][_pairRound]
            .secondTokenPriceChange = secondTokenPriceChange;
        _calculateRoundRewards(_pairRound, _pair);
        emit EndRound(_pairRound, _pair);
    }

    function hasRoundEnded() public view returns (bool) {
        bool upkeepNeeded = gameRoundsLedger[1][pairRounds[1] - 1]
            .endTimeStamp < block.timestamp;

        return upkeepNeeded;
    }

    function checkUpkeep(bytes calldata)
        external
        view
        override
        returns (bool upkeepNeeded, bytes memory performData)
    {
        bool[] memory hasTimeEnded = new bool[](pairsCount);
        for (uint256 i = 0; i < pairsCount; i++) {
            hasTimeEnded[i] =
                gameRoundsLedger[i + 1][pairRounds[i + 1] - 1].endTimeStamp <
                block.timestamp;
            if (hasTimeEnded[i] == true) upkeepNeeded = true;
        }
        performData = abi.encode(hasTimeEnded);
    }

    function performUpkeep(bytes calldata performData) external override {
        bool[] memory hasTimeEnded = abi.decode(performData, (bool[]));
        for (uint256 i = 0; i < hasTimeEnded.length; i++) {
            if (hasTimeEnded[i]) {
                roundExecution(i + 1);
                emit PerformUpKeepUpdated(i);
            }
        }
    }

    function updateMinMaxDepositAmount(uint256 minDeposit, uint256 maxDeposit)
        external
        isOwner
    {
        minBet = minDeposit;
        maxBet = maxDeposit;
    }

    function updateOwner(address newOwner) external isOwner {
        owner = newOwner;
    }

    function createPredictionPairs(address firstToken, address secondToken)
        external
        isOwner
    {
        pairsCount += 1;
        pairs[pairsCount][0] = AggregatorV3Interface(firstToken);
        pairs[pairsCount][1] = AggregatorV3Interface(secondToken);
    }

    /**
     * Returns the latest price of token
     */
    function getLatestPrice(AggregatorV3Interface[2] memory token)
        internal
        view
        returns (int256, int256)
    {
        (, int256 tokenPrice1, , , ) = token[0].latestRoundData();
        (, int256 tokenPrice2, , , ) = token[1].latestRoundData();
        return (tokenPrice1, tokenPrice2);
    }

    function _isContract(address account) internal view returns (bool) {
        uint256 size;
        assembly {
            size := extcodesize(account)
        }
        return size > 0;
    }

    receive() external payable {
        emit Received(msg.sender, msg.value);
    }
}
