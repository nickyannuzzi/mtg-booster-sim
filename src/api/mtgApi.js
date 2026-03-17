import axios from 'axios';

const mtgApi = axios.create({
  baseURL: 'https://api.magicthegathering.io/v1',
});

const scryfallApi = axios.create({
  baseURL: 'https://api.scryfall.com',
});

/**
 * @typedef {Object} MtgSet
 * @property {string} code
 * @property {string} name
 * @property {string[]=} booster
 */

/**
 * @typedef {Object} MtgSetsResponse
 * @property {MtgSet[]} sets
 */

/**
 * @typedef {Object} CardImageUris
 * @property {string=} small
 */

/**
 * @typedef {Object} ScryfallCardFace
 * @property {CardImageUris=} image_uris
 */

/**
 * @typedef {Object} ScryfallCard
 * @property {string} id
 * @property {string} name
 * @property {'common' | 'uncommon' | 'rare' | 'mythic' | string} rarity
 * @property {CardImageUris=} image_uris
 * @property {ScryfallCardFace[]=} card_faces
 * @property {boolean=} digital
 */

/**
 * @typedef {Object} ScryfallListResponse
 * @property {ScryfallCard[]} data
 * @property {boolean} has_more
 * @property {string=} next_page
 */

/**
 * @typedef {Object} CardsByRarity
 * @property {ScryfallCard[]} common
 * @property {ScryfallCard[]} uncommon
 * @property {ScryfallCard[]} rare
 */

function hasDisplayableImage(card) {
  return Boolean(card.image_uris?.small || card.card_faces?.some((face) => face.image_uris?.small));
}

function normalizeCardImage(card) {
  if (card.image_uris?.small || !card.card_faces?.length) {
    return card;
  }

  const firstFaceWithImage = card.card_faces.find((face) => face.image_uris?.small);

  if (!firstFaceWithImage) {
    return card;
  }

  return {
    ...card,
    image_uris: firstFaceWithImage.image_uris,
  };
}

export async function fetchExpansionSets() {
  const response = await mtgApi.get('/sets?type=expansion');
  /** @type {MtgSetsResponse} */
  const data = response.data;

  return data.sets ?? [];
}

export async function fetchSetCards(setCode) {
  /** @type {CardsByRarity} */
  const cardsByRarity = {
    common: [],
    uncommon: [],
    rare: [],
  };

  let nextPage = `/cards/search?q=e%3A${encodeURIComponent(setCode)}+game%3Apaper&unique=prints`;

  while (nextPage) {
    const response = await scryfallApi.get(nextPage);
    /** @type {ScryfallListResponse} */
    const page = response.data;

    page.data
      .filter((card) => !card.digital && hasDisplayableImage(card))
      .map(normalizeCardImage)
      .forEach((card) => {
        if (card.rarity === 'common') {
          cardsByRarity.common.push(card);
          return;
        }

        if (card.rarity === 'uncommon') {
          cardsByRarity.uncommon.push(card);
          return;
        }

        if (card.rarity === 'rare' || card.rarity === 'mythic') {
          cardsByRarity.rare.push(card);
        }
      });

    if (!page.has_more || !page.next_page) {
      nextPage = '';
      continue;
    }

    nextPage = page.next_page.replace('https://api.scryfall.com', '');
  }

  return cardsByRarity;
}
