import { interpretQuestion } from "./interpret";
import { retrieveSources } from "./retrieve";
import { summariseAnswer } from "./generate";
import type { AskAnswer, StreamEvent } from "../types";

export async function runAskPipeline(
  question: string,
  emit: (event: StreamEvent) => void,
): Promise<AskAnswer> {
  const interpretation = interpretQuestion(question);
  emit({ stage: "interpret", interpretation });

  const docs = await retrieveSources(interpretation, ({ queries, hitCount }) => {
    emit({ stage: "search", queries, hitCount });
  });
  emit({ stage: "retrieve", titles: docs.map((doc) => doc.title) });

  if (docs.length === 0) {
    throw new Error("No relevant GOV.UK pages were found for that question. Try a shorter, more specific question.");
  }

  const answer = await summariseAnswer(interpretation, docs);
  emit({ stage: "answer", answer });
  return answer;
}
