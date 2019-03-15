const { ApolloServer } = require('apollo-server')
const { loadTypeDefs } = require('./type-defs')
const { getConfig } = require('./utils/config')
const { showServerInfo } = require('./utils/server-info')
const { contextFactory } = require('./context')
const resolvers = require('./resolvers')

let started = false

/**
 * get server port
 * @param {config} config
 * @returns {number}
 */
const getPort = config => {
  if (config.PORT) {
    return config.PORT
  }

  return process.env.PORT || 8081
}

const serverFactory = async () => {
  // prevents the server from starting more than once.
  if (started) {
    return Promise.reject(new Error('server was created'))
  }

  const config = getConfig()

  // need to be imported after handling the env
  const debug = require('./utils/debug')

  const typeDefs = await loadTypeDefs()

  started = true

  const server = new ApolloServer({
    cors: true,
    resolvers,
    typeDefs,
    tracing: config.NODE_ENV !== 'production',
    context: contextFactory({ config, debug })
  })

  const info = await server.listen({ port: getPort(config) })

  await showServerInfo(config, info)

  console.log(`🚀  Server ready (${config.NODE_ENV || 'development'})`)

  // allows extra manipulation of this variables
  return { server, info, config, debug }
}

module.exports = { serverFactory }
