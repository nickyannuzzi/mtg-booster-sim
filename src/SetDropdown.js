import { useEffect, useMemo, useState } from 'react';

import './setDropdown.css';
import {
  fetchExpansionSets,
  fetchSetCards,
} from './api/mtgApi';

const DEFAULT_BOOSTER = {
  rare: 1,
  uncommon: 3,
  common: 11,
};

function convertBooster(booster) {
  if (!booster) {
    return DEFAULT_BOOSTER;
  }

  return booster.reduce(
    (counts, slot) => {
      if (Array.isArray(slot)) {
        return {
          ...counts,
          rare: counts.rare + 1,
        };
      }

      switch (slot) {
        case 'rare':
        case 'mythic':
          return {
            ...counts,
            rare: counts.rare + 1,
          };
        case 'uncommon':
          return {
            ...counts,
            uncommon: counts.uncommon + 1,
          };
        case 'common':
          return {
            ...counts,
            common: counts.common + 1,
          };
        default:
          return {
            ...counts,
            common: counts.common + 1,
          };
      }
    },
    { rare: 0, uncommon: 0, common: 0 }
  );
}

function pickRandomCards(cards, count) {
  if (!cards.length || count <= 0) {
    return [];
  }

  return Array.from({ length: count }, () => {
    const index = Math.floor(Math.random() * cards.length);
    return cards[index];
  });
}

function SetDropdown() {
  const [sets, setSets] = useState([]);
  const [selectedSetName, setSelectedSetName] = useState('');
  const [cardsByRarity, setCardsByRarity] = useState({
    common: [],
    uncommon: [],
    rare: [],
  });
  const [openedCards, setOpenedCards] = useState([]);
  const [isLoadingSets, setIsLoadingSets] = useState(true);
  const [isLoadingCards, setIsLoadingCards] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let isCancelled = false;

    async function loadSets() {
      setIsLoadingSets(true);
      setErrorMessage('');

      try {
        const fetchedSets = await fetchExpansionSets();

        if (isCancelled) {
          return;
        }

        setSets(fetchedSets);
        setSelectedSetName(fetchedSets[0]?.name ?? '');
      } catch (error) {
        if (!isCancelled) {
          setErrorMessage('Unable to load sets right now.');
        }
      } finally {
        if (!isCancelled) {
          setIsLoadingSets(false);
        }
      }
    }

    loadSets();

    return () => {
      isCancelled = true;
    };
  }, []);

  const setMap = useMemo(
    () =>
      sets.reduce((map, set) => {
        map[set.name] = set;
        return map;
      }, {}),
    [sets]
  );

  const selectedSet = selectedSetName ? setMap[selectedSetName] : null;

  useEffect(() => {
    let isCancelled = false;

    async function loadCards() {
      if (!selectedSet?.code) {
        setCardsByRarity({
          common: [],
          uncommon: [],
          rare: [],
        });
        return;
      }

      setIsLoadingCards(true);
      setErrorMessage('');
      setOpenedCards([]);

      try {
        const groupedCards = await fetchSetCards(selectedSet.code);

        if (!isCancelled) {
          setCardsByRarity(groupedCards);
        }
      } catch (error) {
        if (!isCancelled) {
          setCardsByRarity({
            common: [],
            uncommon: [],
            rare: [],
          });
          setErrorMessage(`Unable to load cards for ${selectedSet.name}.`);
        }
      } finally {
        if (!isCancelled) {
          setIsLoadingCards(false);
        }
      }
    }

    loadCards();

    return () => {
      isCancelled = true;
    };
  }, [selectedSet]);

  function handleOpenPack() {
    if (!selectedSet) {
      return;
    }

    const boosterTemplate = convertBooster(selectedSet.booster);
    const nextOpenedCards = [
      ...pickRandomCards(cardsByRarity.rare, boosterTemplate.rare),
      ...pickRandomCards(cardsByRarity.uncommon, boosterTemplate.uncommon),
      ...pickRandomCards(cardsByRarity.common, boosterTemplate.common),
    ];

    setOpenedCards(nextOpenedCards);
  }

  const canOpenPack =
    !isLoadingSets &&
    !isLoadingCards &&
    selectedSet &&
    cardsByRarity.rare.length > 0 &&
    cardsByRarity.uncommon.length > 0 &&
    cardsByRarity.common.length > 0;

  return (
    <div className="background">
      <div className="dropdownMenu">
        <select
          onChange={(event) => setSelectedSetName(event.target.value)}
          value={selectedSetName}
          disabled={isLoadingSets || !sets.length}
        >
          {sets.map((set) => (
            <option key={set.code} value={set.name}>
              {set.name}
            </option>
          ))}
        </select>
      </div>
      <button type="button" id="open-button" onClick={handleOpenPack} disabled={!canOpenPack}>
        {isLoadingCards ? 'Loading cards...' : 'Open pack!'}
      </button>
      {errorMessage ? <p className="statusMessage">{errorMessage}</p> : null}
      {!errorMessage && isLoadingSets ? <p className="statusMessage">Loading sets...</p> : null}
      <div className="pack" id="pack-frame">
        {openedCards.map((card, index) => (
          <img
            key={`${card.id ?? card.name}-${index}`}
            className="card"
            src={card.image_uris?.small ?? ''}
            alt={card.name}
          />
        ))}
      </div>
    </div>
  );
}

export default SetDropdown;
