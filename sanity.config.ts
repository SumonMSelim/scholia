'use client'

import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './src/sanity/schemaTypes'
import {structure} from './src/sanity/structure'
import {apiVersion, dataset, projectId} from './src/sanity/env'

export default defineConfig({
  name: 'scholia',
  title: 'Scholia',
  basePath: '/studio',
  projectId,
  dataset,
  plugins: [structureTool({structure}), visionTool({defaultApiVersion: apiVersion})],
  schema: {types: schemaTypes},
})
