import {createAmazonBedrock} from '@ai-sdk/amazon-bedrock'
import {fromNodeProviderChain} from '@aws-sdk/credential-providers'

const bedrock = createAmazonBedrock({
  region: process.env.AWS_REGION ?? 'us-east-1',
  credentialProvider: fromNodeProviderChain(),
})

export const agentModel = () => bedrock(process.env.BEDROCK_MODEL_AGENT ?? 'us.amazon.nova-2-lite-v1:0')
export const fastModel = () => bedrock(process.env.BEDROCK_MODEL_FAST ?? 'us.amazon.nova-micro-v1:0')
export const embeddingModel = () => bedrock.textEmbeddingModel(process.env.BEDROCK_MODEL_EMBED ?? 'amazon.titan-embed-text-v2:0')
