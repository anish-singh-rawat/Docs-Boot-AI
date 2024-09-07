import {adjectives, nouns} from '@/utils/wordList'
import random from 'random'
import seedrandom from 'seedrandom'

const blacklistedAliases = JSON.parse(process.env.BLACKLISTED_ALIASES);
const getFakeUserByIp = (ip) => {
  let alias;

  random.use(seedrandom(ip))
  do { // keep generating aliases until we get one that isn't blacklisted
    alias = random.choice(adjectives) + '-' + random.choice(nouns);
  } while (blacklistedAliases.includes(alias))

  return alias
}

export default getFakeUserByIp