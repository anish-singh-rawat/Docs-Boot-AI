import { getBot } from '@/lib/dbQueries'

export default async function handler(req, res) {
  const { teamId, botId } = req.query
  const bot = await getBot(teamId, botId)
  if (!bot) {
    return res.status(404).json({ message: 'Bot not found' })
  }

  if (req.method === 'GET') {
    const json = {
      openapi: '3.0.2',
      info: {
        title: `${bot.name} Retrieval API`,
        description: `For querying indexed documentation chunks based on natural language queries. Always use to find answers to questions and retrieve relevant information related to ${bot.name}.`,
        version: '1.0.0',
        termsOfService: 'https://docsbot.ai/legal/terms-of-service',
      },
      servers: [
        {
          url: 'https://api.docsbot.ai',
        },
      ],
      paths: {
        [`/teams/${teamId}/bots/${botId}/search`]: {
          post: {
            description: 'Search for documentation chunks about a topic',
            operationId: 'Retrieval Search',
            ['x-openai-isConsequential']: false,
            requestBody: {
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Query',
                  },
                },
              },
              required: true,
            },
            responses: {
              200: {
                description: 'Successful Response',
                content: {
                  'application/json': {
                    schema: {
                      title: 'Semantic Search Results',
                      anyOf: [
                        {
                          type: 'array',
                          items: {
                            $ref: '#/components/schemas/QuerySource',
                          },
                        },
                        {
                          $ref: '#/components/schemas/Error',
                        },
                      ],
                    },
                  },
                },
              },
              422: {
                description: 'Validation Error',
                content: {
                  'application/json': {
                    schema: {
                      $ref: '#/components/schemas/HTTPValidationError',
                    },
                  },
                },
              },
            },
          },
        },
      },
      components: {
        schemas: {
          Error: {
            title: 'Error',
            required: ['error'],
            type: 'object',
            properties: {
              error: {
                title: 'The error message',
                type: 'string',
              },
            },
          },
          HTTPValidationError: {
            title: 'HTTPValidationError',
            type: 'object',
            properties: {
              detail: {
                title: 'Detail',
                type: 'array',
                items: {
                  $ref: '#/components/schemas/ValidationError',
                },
              },
            },
          },
          Query: {
            title: 'Query',
            required: ['query'],
            type: 'object',
            properties: {
              query: {
                title: 'Query',
                description: 'A detailed and full search topic query',
                type: 'string',
              },
              top_k: {
                title: 'Top K',
                description: 'The number of source results to return',
                type: 'integer',
                default: 4,
              },
            },
          },
          QuerySource: {
            title: 'QuerySource',
            required: ['content'],
            type: 'object',
            properties: {
              title: {
                title: 'The title of the source',
                type: 'string',
              },
              url: {
                title: 'The url of the source',
                type: 'string',
              },
              page: {
                title: 'For PDFs, the page number of the source in the PDF',
                type: 'integer',
              },
              content: {
                title: 'The raw text content of the source.',
                type: 'string',
              },
            },
          },
          ValidationError: {
            title: 'ValidationError',
            required: ['loc', 'msg', 'type'],
            type: 'object',
            properties: {
              loc: {
                title: 'Location',
                type: 'array',
                items: {
                  anyOf: [
                    {
                      type: 'string',
                    },
                    {
                      type: 'integer',
                    },
                  ],
                },
              },
              msg: {
                title: 'Message',
                type: 'string',
              },
              type: {
                title: 'Error Type',
                type: 'string',
              },
            },
          },
        },
      },
    }

    if (bot.privacy === 'private') {
      json.components.securitySchemes = {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'API_KEY',
        },
      }
    }

    return res.status(200).json(json)
  } else {
    return res.status(400).json({ message: 'Invalid HTTP method' })
  }
}
