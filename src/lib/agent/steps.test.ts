import {describe, expect, it} from 'vitest'
import {FINAL_STEP_NOTE, finalAnswerStep, MAX_STEPS} from './steps'

describe('finalAnswerStep', () => {
  it('leaves the step unchanged before the last one', () => {
    expect(finalAnswerStep({stepNumber: 0, instructions: 'sys'})).toBeUndefined()
    expect(finalAnswerStep({stepNumber: MAX_STEPS - 2, instructions: 'sys'})).toBeUndefined()
  })

  it('tells the model to answer on the last step', () => {
    expect(finalAnswerStep({stepNumber: MAX_STEPS - 1, instructions: 'sys'})).toEqual({instructions: `sys\n\n${FINAL_STEP_NOTE}`})
  })
})
