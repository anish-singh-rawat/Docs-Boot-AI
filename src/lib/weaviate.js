import weaviate, { ApiKey } from 'weaviate-ts-client'

const weaviateClient = () => {
  try {
    const args = {
      scheme: 'https',
      host: process.env.WEAVIATE_URL,
    }
    if (process.env.WEAVIATE_API_KEY) {
      args['apiKey'] = new ApiKey(process.env.WEAVIATE_API_KEY)
    } else {
      args['authClientSecret'] = new weaviate.AuthUserPasswordCredentials({
        username: process.env.WEAVIATE_USERNAME,
        password: process.env.WEAVIATE_PASSWORD,
      })
    }
    return weaviate.client(args)
  } catch (e) {
    console.warn('Error creating weaviate client', e)
  }
}

export const createSchema = (team, indexId) => {
  let text2vecConfig = {
    skip: false,
    vectorizePropertyName: false,
  }

  let moduleConfig = {
    model: 'ada',
    modelVersion: '002',
    type: 'text',
    vectorizeClassName: false,
  }

  if (team['AzureDeploymentBase']) {
    console.log('!!!!!!!!!!!!!!!!! Using Azure Deployment')
    let url = new URL(team['AzureDeploymentBase']);
    let hostname = url.hostname;
    let shortHostname = hostname.split('.')[0];
    moduleConfig['resourceName'] = shortHostname
    moduleConfig['deploymentId'] = team['AzureDeploymentName']
  }

  //create a weaviate schema for the bot
  return weaviateClient()
    .schema.classCreator()
    .withClass({
      class: indexId,
      description: 'A text document chunk',
      vectorizer: 'text2vec-openai',
      moduleConfig: {
        'text2vec-openai': moduleConfig,
      },
      properties: [
        {
          dataType: ['text'],
          description: 'The content of the paragraph',
          moduleConfig: {
            'text2vec-openai': text2vecConfig,
          },
          name: 'content',
        },
        {
          dataType: ['string'],
          description: 'The json wrapped metadata of the document',
          moduleConfig: {
            'text2vec-openai': {
              skip: false,
              vectorizePropertyName: false,
            },
          },
          name: 'metadata',
        },
        {
          dataType: ['string'],
          description: 'Source Type',
          moduleConfig: {
            'text2vec-openai': {
              skip: true,
              vectorizePropertyName: false,
            },
          },
          tokenization: 'field',
          name: 'type',
        },
        {
          dataType: ['string'],
          description: 'Source Id',
          moduleConfig: {
            'text2vec-openai': {
              skip: true,
              vectorizePropertyName: false,
            },
          },
          tokenization: 'field',
          name: 'sourceId',
        },
      ],
    })
    .do()
}

export const getSchema = (indexId) => {
  //get a weaviate schema for the bot
  return weaviateClient().schema.classGetter().withClassName(indexId).do()
}

export const deleteSchema = (indexId) => {
  //delete a weaviate schema for the bot
  return weaviateClient().schema.classDeleter().withClassName(indexId).do()
}

export const importChunks = (indexId, type, sourceId, data) => {
  // Prepare a batcher
  let batcher = weaviateClient().batch.objectsBatcher()
  let counter = 0
  let batchSize = 40

  data.forEach((chunk) => {
    const obj = {
      class: indexId,
      properties: {
        content: chunk.text,
        metadata: JSON.stringify({ title: chunk.title, source: chunk.url }),
        type,
        sourceId,
      },
      vector: chunk.vector,
    }

    // add the object to the batch queue
    batcher = batcher.withObject(obj)

    // When the batch counter reaches batchSize, push the objects to Weaviate
    if (counter++ == batchSize) {
      // flush the batch queue
      batcher
        .do()
        .then((res) => {})
        .catch((err) => {
          console.error(err)
        })

      // restart the batch queue
      counter = 0
      batcher = weaviateClient().batch.objectsBatcher()
    }
  })

  // Flush the remaining objects
  return batcher
    .do()
    .then((res) => {})
    .catch((err) => {
      console.error(err)
    })
}
