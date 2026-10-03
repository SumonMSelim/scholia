import {describe, expect, it} from 'vitest'
import {FINAL_STEP_NOTE, LOOKUP_BY_STEP, MAX_STEPS, prepareAgentStep} from './steps'

const step = (...tools: string[]) => ({toolCalls: tools.map((toolName) => ({toolName}))})
const kbOnly = [step('initial_context'), step('knowledge_base_search', 'knowledge_base_read')]

describe('prepareAgentStep', () => {
  it('leaves early steps alone', () => {
    expect(prepareAgentStep({stepNumber: 0, steps: [], instructions: 'sys'})).toBeUndefined()
    expect(prepareAgentStep({stepNumber: LOOKUP_BY_STEP - 1, steps: kbOnly.slice(0, 1), instructions: 'sys'})).toBeUndefined()
  })

  it('forces lookup_source when the agent has only read the knowledge base', () => {
    expect(prepareAgentStep({stepNumber: LOOKUP_BY_STEP, steps: kbOnly, instructions: 'sys'})).toEqual({
      toolChoice: {type: 'tool', toolName: 'lookup_source'},
    })
  })

  it('does not force it again once sources were looked up', () => {
    expect(prepareAgentStep({stepNumber: 4, steps: [...kbOnly, step('lookup_source'), step('knowledge_base_read')], instructions: 'sys'})).toBeUndefined()
  })

  it('tells the model to answer on the last step', () => {
    expect(prepareAgentStep({stepNumber: MAX_STEPS - 1, steps: kbOnly, instructions: 'sys'})).toEqual({instructions: `sys\n\n${FINAL_STEP_NOTE}`})
  })
})
