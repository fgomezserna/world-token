// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import "./IMintableERC20.sol";
import "hardhat/console.sol";


/**
 * @title VestingContract
 * @notice This is a simple vesting contract that allows to create vesting schedules for a beneficiary with daily/weekly/monthly and/or cliff unlocking.
 */
contract VestingContract is Ownable {
    using SafeERC20 for IERC20;

    /**
     * @notice The token to be vested
     */
    IMintableERC20 public immutable token;

    enum DurationUnits {
        Days,
        Weeks,
        Months
    }

    struct VestingSchedule {
        // beneficiary of tokens after they are released
        address beneficiary;
        // start time of the vesting period
        uint256 start;
        // duration of the vesting period in DurationUnits
        uint256 duration;
        // units of the duration
        DurationUnits durationUnits;
        // total amount of tokens to be released at the end of the vesting;
        uint256 amountTotal;
        // amount of tokens released
        uint256 released;
        // block vesting
        bool block;
    }

    /**
     * @notice List of vesting schedules for each beneficiary
     */
    mapping(address => VestingSchedule[]) public vestingSchedules;

    /**
     * @notice Emitted when a vesting schedule is created
     * @param beneficiary The address of the beneficiary
     * @param start The start UNIX timestamp of the vesting period
     * @param duration The duration of the vesting period in DurationUnits
     * @param durationUnits The units of the duration(0 = days, 1 = weeks, 2 = months)
     */
    event VestingScheduleCreated(
        address indexed beneficiary, uint256 start, uint256 duration, DurationUnits durationUnits, uint256 amountTotal
    );

    /**
     * @notice Emitted when tokens are released
     * @param beneficiary The address of the beneficiary
     * @param amount The amount of tokens released
     */
    event TokensReleased(address indexed beneficiary, uint256 amount);

    /**
     * @notice Emitted when a vesting schedule is blocked
     * @param beneficiary The address of the beneficiary
     * @param scheduleIndex The index of the schedule
     */
    event VestingScheduleBlocked(address indexed beneficiary, uint256 scheduleIndex);

    /**
     * @notice Emitted when a vesting schedule is unblocked
     * @param beneficiary The address of the beneficiary
     * @param scheduleIndex The index of the schedule
     */
    event VestingScheduleUnblocked(address indexed beneficiary, uint256 scheduleIndex);


    /**
     * @param _token The token to be vested
     */
    constructor(IMintableERC20 _token) {

        token = _token;
    }

    /**
     * @notice Creates a vesting schedule
     * @param _beneficiary The address of the beneficiary
     * @param _start The start UNIX timestamp of the vesting period
     * @param _duration The duration of the vesting period in DurationUnits
     * @param _durationUnits The units of the duration(0 = days, 1 = weeks, 2 = months)
     * @param _amountTotal The total amount of tokens to be vested
     * @dev Approve the contract to transfer the tokens before calling this function
     */
    function createVestingSchedule(
        address _beneficiary,
        uint256 _start,
        uint256 _duration,
        DurationUnits _durationUnits,
        uint256 _amountTotal
    ) external onlyOwner {
        // perform input checks
        require(_beneficiary != address(0), "VestingContract: beneficiary is the zero address");
        require(_amountTotal > 0, "VestingContract: amount is 0");
        require(_start >= block.timestamp, "VestingContract: start is before current time");

        // create the vesting schedule and add it to the list of schedules for the beneficiary
        vestingSchedules[_beneficiary].push(
            VestingSchedule({
                beneficiary: _beneficiary,
                start: _start,
                duration: _duration,
                durationUnits: _durationUnits,
                amountTotal: _amountTotal,
                released: 0,
                block: false
            })
        );

        emit VestingScheduleCreated(_beneficiary, _start, _duration, _durationUnits, _amountTotal);
    }

    /**
     * @notice Releases the vested tokens for a beneficiary
     */
    function release() external {
        address _beneficiary = msg.sender;
        VestingSchedule[] storage schedules = vestingSchedules[_beneficiary];
        uint256 schedulesLength = schedules.length;
        require(schedulesLength > 0, "VestingContract: no vesting schedules for beneficiary");

        uint256 totalRelease;

        for (uint256 i = 0; i < schedulesLength; i++) {
            VestingSchedule storage schedule = schedules[i];
            if(schedules[i].block) continue;

            // calculate the releasable amount
            uint256 amountToSend = releasableAmount(schedule);
            if (amountToSend > 0) {
                // update the released amount
                schedule.released += amountToSend;
                // update the total released amount
                totalRelease += amountToSend;
                // transfer the tokens to the beneficiary
                token.mint(schedule.beneficiary, amountToSend);
            }
        }

        emit TokensReleased(_beneficiary, totalRelease);
    }

    /**
     * @notice Returns the releasable amount of tokens for a beneficiary
     * @param _beneficiary The address of the beneficiary
     */
    function getReleaseableAmount(address _beneficiary) external view returns (uint256) {
        VestingSchedule[] memory schedules = vestingSchedules[_beneficiary];
        if (schedules.length == 0) return 0;

        uint256 amountToSend = 0;
        for (uint256 i = 0; i < schedules.length; i++) {
            if(schedules[i].block) continue;
            VestingSchedule memory schedule = vestingSchedules[_beneficiary][i];
            amountToSend += releasableAmount(schedule);
        }
        return amountToSend;
    }

    /**
     * @notice Returns the releasable amount of tokens for a vesting schedule
     * @param _schedule The vesting schedule
     */
    function releasableAmount(VestingSchedule memory _schedule) public view returns (uint256) {
        return vestedAmount(_schedule) - _schedule.released;
    }

    /**
     * @notice Returns the vested amount of tokens for a vesting schedule
     * @param _schedule The vesting schedule
     */
    function vestedAmount(VestingSchedule memory _schedule) public view returns (uint256) {
        if (_schedule.duration == 0) {
            if (block.timestamp >= _schedule.start) {
                return _schedule.amountTotal;
            } else {
                return 0;
            }
        }
        uint256 sliceInSeconds;
        if (_schedule.durationUnits == DurationUnits.Days) {
            sliceInSeconds = 1 days;
        } else if (_schedule.durationUnits == DurationUnits.Weeks) {
            sliceInSeconds = 7 days;
        } else if (_schedule.durationUnits == DurationUnits.Months) {
            sliceInSeconds = 30 days;
        }
        if (block.timestamp < _schedule.start) {
            return 0;
        } else if (block.timestamp >= _schedule.start + _schedule.duration * sliceInSeconds) {
            return _schedule.amountTotal;
        } else {
            uint256 secondsPassed = (block.timestamp - _schedule.start);
            return (_schedule.amountTotal * secondsPassed) / (_schedule.duration * sliceInSeconds);
        }
    }

    // get number schedules by beneficiary
    function getNumberOfSchedules(address _beneficiary) external view returns (uint256) {
        return vestingSchedules[_beneficiary].length;
    }

  
    /**
     * @notice Blocks a vesting schedule
     * @param _beneficiary The address of the beneficiary
     * @param _scheduleIndex The index of the schedule
     */
    function blockVestingSchedule(address _beneficiary, uint256 _scheduleIndex) external onlyOwner {
        require(_scheduleIndex < vestingSchedules[_beneficiary].length, "VestingContract: invalid schedule index");
        vestingSchedules[_beneficiary][_scheduleIndex].block = true;
        emit VestingScheduleBlocked(_beneficiary, _scheduleIndex);
    }
    /**
     * @notice Unblocks a vesting schedule
     * @param _beneficiary The address of the beneficiary
     * @param _scheduleIndex The index of the schedule
     */
    function unblockVestingSchedule(address _beneficiary, uint256 _scheduleIndex) external onlyOwner {
        require(_scheduleIndex < vestingSchedules[_beneficiary].length, "VestingContract: invalid schedule index");
        vestingSchedules[_beneficiary][_scheduleIndex].block = false;
        emit VestingScheduleUnblocked(_beneficiary, _scheduleIndex);
    }
}
