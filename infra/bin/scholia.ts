import {App} from 'aws-cdk-lib'
import {ScholiaStack} from '../lib/scholia-stack.js'

const app = new App()
new ScholiaStack(app, 'Scholia', {
  env: {account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION ?? 'us-east-1'},
  domainName: app.node.tryGetContext('domain'),
  certificateArn: app.node.tryGetContext('certArn'),
})
