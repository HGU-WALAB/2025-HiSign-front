// components/StepProgressBar.js
import styled from "styled-components";

const StepProgressBar = ({ currentStep }) => {
  const steps = ["작업 정보 입력", "서명자 추가", "서명 구역 할당"];
  return (
    <BarContainer>
      {steps.map((step, index) => {
        const isActive = index === currentStep;
        const isCompleted = index < currentStep;
        return (
          <Step key={index}>
            <Circle isActive={isActive} isCompleted={isCompleted}>
              {index + 1}
            </Circle>
            <Label isActive={isActive} isCompleted={isCompleted}>
              {step}
            </Label>
            {index < steps.length - 1 && (
              <Line isActive={index < currentStep} />
            )}
          </Step>
        );
      })}
    </BarContainer>
  );
};


export default StepProgressBar;

// styled-components
const BarContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 30px 0;
  flex-wrap: wrap;
`;

const Step = styled.div`
  display: flex;
  align-items: center;
  position: relative;
`;

const Circle = styled.div`
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background-color: ${({ isActive, isCompleted }) =>
    isActive ? "#03A3FF" : isCompleted ? "rgba(3, 163, 255, 0.5)" : "#ccc"};
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: bold;
`;

const Label = styled.div`
  margin: 0 10px;
  font-size: 14px;
  color: ${({ isActive, isCompleted }) =>
    isActive ? "#000" : isCompleted ? "rgba(0, 0, 0, 0.5)" : "#aaa"};
`;

const Line = styled.div`
  height: 2px;
  width: 30px;
  margin-right: 10px;
  background-color: ${({ isActive, isCompleted }) =>
    isActive ? "#03A3FF" : isCompleted ? "rgba(0, 0, 0, 0.5)" : "#aaa"};
`;

