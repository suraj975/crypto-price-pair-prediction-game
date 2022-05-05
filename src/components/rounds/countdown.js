import { Flex, Box, chakra } from "@chakra-ui/react";
import React from "react";
import Countdown from "react-countdown";

const Completionist = () => (
  <chakra.span fontWeight="bold">Round Over!</chakra.span>
);

const TimerBox = ({ timeValue, timeNotation, showDots, ...props }) => {
  if (!props?.isSeconds && !timeValue) return null;
  return (
    <Box p="5px" minW="30px" fontWeight="bold" textAlign="center">
      {timeValue} {timeNotation} {showDots ? ":" : ""}
    </Box>
  );
};

const renderer = ({ hours, days, minutes, seconds, completed }) => {
  if (completed) {
    return <Completionist />;
  } else {
    return (
      <Flex>
        <TimerBox timeValue={days} timeNotation="D" showDots={true} />
        <TimerBox timeValue={hours} timeNotation="H" showDots={true} />
        <TimerBox timeValue={minutes} timeNotation="M" showDots={true} />
        <TimerBox
          isSeconds={true}
          timeValue={seconds}
          timeNotation="S"
          showDots={false}
        />
      </Flex>
    );
  }
};

export const CountDownTimer = ({ time }) => {
  return <Countdown date={time} renderer={renderer} />;
};
