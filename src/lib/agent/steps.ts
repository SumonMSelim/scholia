export const MAX_STEPS = 10

export const FINAL_STEP_NOTE =
  'FINAL STEP: you have used all your lookups. Do not call any tool. Answer now from the tool results above, with their cite strings.'

// Tools stay active on the last step: Bedrock drops earlier tool results from the request when no tools are
// sent, which would leave the answer without its sources. An instruction keeps the model from looking up more.
export function finalAnswerStep({stepNumber, instructions}: {stepNumber: number; instructions?: unknown}) {
  if (stepNumber < MAX_STEPS - 1 || typeof instructions !== 'string') return undefined
  return {instructions: `${instructions}\n\n${FINAL_STEP_NOTE}`}
}
