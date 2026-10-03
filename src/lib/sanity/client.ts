import {createClient} from 'next-sanity'
import {apiVersion, dataset, projectId} from '@/sanity/env'

// Public dataset: anonymous reads. Used for course lists and structured lookups.
export const readClient = createClient({projectId, dataset, apiVersion, useCdn: true})

export function writeClient() {
  const token = process.env.SANITY_WRITE_TOKEN
  if (!token) throw new Error('SANITY_WRITE_TOKEN is not set')
  return createClient({projectId, dataset, apiVersion, useCdn: false, token})
}
