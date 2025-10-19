import React from 'react';
import Button from '../common/Button';

const QuestionFlow = ({ questions, onAnswer }) => {
  return (
    <div className="space-y-3">
      {questions.map((question, idx) => (
        <Button
          key={idx}
          variant="secondary"
          fullWidth
          onClick={() => onAnswer(question)}
        >
          {question}
        </Button>
      ))}
    </div>
  );
};

export default QuestionFlow;