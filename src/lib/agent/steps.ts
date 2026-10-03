export const MAX_STEPS = 10
/** By this step the agent must have looked up exact sources at least once. */
export const LOOKUP_BY_STEP = 2

export const FINAL_STEP_NOTE =
  'FINAL STEP: you have used all your lookups. Do not call any tool. Answer now from the tool results above, with their cite strings.'

type StepInfo = {stepNumber: number; steps: {toolCalls: {toolName: string}[]}[]; instructions?: unknown}

// Two rules the model does not follow reliably from the prompt alone:
// - It answers from Knowledge Base entries without checking the course sources, which can cite the wrong course
//   or call a covered topic "not covered". So it must call lookup_source before LOOKUP_BY_STEP.
// - It can spend every step on lookups. On the last step it is told to answer. Tools stay active there:
//   Bedrock drops earlier tool results from the request when no tools are sent.
export function prepareAgentStep({stepNumber, steps, instructions}: StepInfo) {
  if (stepNumber >= MAX_STEPS - 1) {
    return typeof instructions === 'string' ? {instructions: `${instructions}\n\n${FINAL_STEP_NOTE}`} : undefined
  }
  const lookedUp = steps.some((s) => s.toolCalls.some((c) => c.toolName === 'lookup_source'))
  if (stepNumber >= LOOKUP_BY_STEP && !lookedUp) return {toolChoice: {type: 'tool' as const, toolName: 'lookup_source' as const}}
  return undefined
}
