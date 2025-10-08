import { useEffect, useState, type ChangeEvent } from 'react';
import { useParams } from 'react-router-dom';
import questionEndpoint from 'src/api/questionEndpoint';
import type { Question } from 'src/model/backend/entity/QuestionEntity';
import IcLoader from 'src/assets/ic-loader.svg';
import { MathJax } from 'better-react-mathjax';
import { Button } from '@mui/material';
import Modal from 'src/components/Modal';
import { bn } from 'src/util/bignumber';

const Question = () => {
  const { id } = useParams();
  const [open, setOpen] = useState<boolean>(false);
  const [question, setQuestion] = useState<Question>();
  const [repliedAnswer, setRepliedAnswer] = useState<{ id: number; answer: string }[]>();

  useEffect(() => {
    questionEndpoint.getQuestionId(id ?? '').then((res) => {
      setQuestion(res?.data);
      setRepliedAnswer(res?.data.minor.map((v) => ({ id: v.id, answer: '' })));
    });
  }, [id]);

  const onClickSingle = (id: number) => (e: ChangeEvent<HTMLInputElement>) => {
    const thisAnswer = repliedAnswer?.map((r) =>
      r.id === id ? { ...r, answer: e.target.value } : r,
    );
    setRepliedAnswer(thisAnswer);
  };

  const onClickMultiple = (id: number) => (e: ChangeEvent<HTMLInputElement>) => {
    const thisAnswer = repliedAnswer?.map((r) => {
      if (r.id !== id) return r;
      const answerSet = r.answer === '' ? new Set() : new Set(r.answer.split(','));
      if (e.target.checked) answerSet.add(e.target.value);
      else answerSet.delete(e.target.value);
      return { ...r, answer: [...answerSet].sort().join(',') };
    });
    setRepliedAnswer(thisAnswer);
  };

  const onSubmit = () => {
    if (!id || !repliedAnswer || !question) return;

    const totalScore = question.minor
      .map((v) => {
        if (v.type === 'SINGLE')
          return repliedAnswer.find((r) => r.id === v.id)?.answer === v.answer ? 1 : 0;
        else if (v.type === 'MULTIPLE') {
          if (!v.options || !v.answer) return 1;

          const replied = repliedAnswer.find((r) => r.id === v.id)?.answer ?? '';
          if (replied === '') return 0;

          const answerSet = new Set(v.answer.split(','));
          const repliedSet = new Set(replied.split(','));

          const missing = [...answerSet].filter((o) => !repliedSet.has(o)).length;
          const extra = [...repliedSet].filter((o) => !answerSet.has(o)).length;

          const n = v.options.split(',').length;
          const k = missing + extra;

          return n - 2 * k <= 0
            ? 0
            : bn(n - 2 * k)
                .div(n)
                .dp(4, 7)
                .toNumber();
        }
        return 1;
      })
      .reduce((prev, cur) => prev.plus(cur), bn(0));
    const score = totalScore.div(question.minor.length).dp(4, 7).toNumber();

    questionEndpoint.postQuestionReply({
      questionId: parseInt(id.substring(3), 36),
      userId: 1,
      score,
      elapsedTimeMs: 1,
      repliedAnswer: repliedAnswer.map((r) => r.answer).join('|'),
    });
  };

  if (!question)
    return (
      <div className="flex items-center justify-center">
        <div className="w-20 outline-none">
          <img src={IcLoader} />
        </div>
      </div>
    );

  return (
    <div>
      <MathJax>
        <div dangerouslySetInnerHTML={{ __html: question.content }}></div>
        <div className="mt-4 flex flex-col gap-2">
          {question.minor.map((v) => {
            if (v.type === 'SINGLE')
              return (
                <div key={v.id}>
                  {v.content && <div>{v.content}</div>}
                  <div className="flex flex-wrap gap-2">
                    {v.options?.split(',').map((o) => (
                      <div className="flex items-center" key={v.id + ':' + o}>
                        <input
                          type="radio"
                          id={v.id + ':' + o}
                          name={v.id.toString()}
                          value={o}
                          onChange={onClickSingle(v.id)}
                        />
                        <label className="px-2" htmlFor={v.id + ':' + o}>
                          {o}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              );
            else if (v.type === 'MULTIPLE')
              return (
                <div key={v.id}>
                  {v.content && <div>{v.content}</div>}
                  <div className="flex flex-wrap gap-2">
                    {v.options?.split(',').map((o) => (
                      <div className="flex items-center" key={v.id + ':' + o}>
                        <input
                          type="checkbox"
                          id={v.id + ':' + o}
                          name={v.id.toString()}
                          value={o}
                          onChange={onClickMultiple(v.id)}
                        />
                        <label className="px-2" htmlFor={v.id + ':' + o}>
                          {o}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              );
          })}
        </div>
      </MathJax>
      <div className="mt-4 text-right">
        <Button variant="contained" onClick={() => setOpen(true)}>
          送出
        </Button>
      </div>
      <Modal open={open} onClose={() => setOpen(false)}>
        <>
          <div>請確認你的答案</div>
          {repliedAnswer?.map((r, i) => (
            <div key={r.id}>
              {i + 1}. {r.answer === '' ? '未作答' : r.answer}
            </div>
          ))}
          <div className="mt-4 flex justify-end gap-4">
            <Button variant="outlined" color="error" onClick={() => setOpen(false)}>
              先等等
            </Button>
            <Button variant="contained" onClick={onSubmit}>
              確定送出
            </Button>
          </div>
        </>
      </Modal>
    </div>
  );
};

export default Question;
