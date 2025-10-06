import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import questionEndpoint from 'src/api/questionEndpoint';
import type { Question } from 'src/model/backend/entity/QuestionEntity';
import IcLoader from 'src/assets/ic-loader.svg';

const Question = () => {
  const { id } = useParams();
  const [question, setQuestion] = useState<Question>();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    setIsLoading(true);
    questionEndpoint
      .getQuestionId(id ?? '')
      .then((res) => setQuestion(res?.data))
      .finally(() => setIsLoading(false));
  }, [id]);

  if (isLoading)
    return (
      <div className="flex items-center justify-center">
        <div className="w-20 outline-none">
          <img src={IcLoader} />
        </div>
      </div>
    );

  return (
    <div>
      <div>{question?.content}</div>
    </div>
  );
};

export default Question;
