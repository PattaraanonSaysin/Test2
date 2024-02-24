import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [selectedPokemon, setSelectedPokemon] = useState(null);
  const [evolutionChain, setEvolutionChain] = useState([]);

  const fetchRandomPokemon = async () => {
    try {
      const randomId = Math.floor(Math.random() * 151) + 1;
      const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${randomId}/`);
      setSelectedPokemon(response.data);
      const speciesUrl = response.data.species.url;
      const speciesResponse = await axios.get(speciesUrl);
      const evolutionChainUrl = speciesResponse.data.evolution_chain.url;
      const evolutionResponse = await axios.get(evolutionChainUrl);
      const chain = evolutionResponse.data.chain;
      const evolutionChainArray = [];
      parseEvolutionChain(chain, evolutionChainArray);
      const evolutionData = await Promise.all(evolutionChainArray.map(async pokemon => {
        if (pokemon.name !== response.data.name) {
          const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${pokemon.id}/`);
          const { data } = response;
          return {
            name: data.name,
            types: data.types.map(type => type.type.name),
            stats: data.stats.map(stat => ({
              name: stat.stat.name,
              base_stat: stat.base_stat
            })),
            image: data.sprites.front_default
          };
        } else {
          return null;
        }
      }));
      const filteredEvolutionData = evolutionData.filter(pokemon => pokemon !== null);
      setEvolutionChain(filteredEvolutionData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const parseEvolutionChain = (chain, resultArray) => {
    const pokemonId = extractPokemonId(chain.species.url);
    resultArray.push({ name: chain.species.name, id: pokemonId });
    if (chain.evolves_to.length > 0) {
      parseEvolutionChain(chain.evolves_to[0], resultArray);
    }
  };

  const extractPokemonId = (url) => {
    const parts = url.split('/');
    return parts[parts.length - 2];
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <h1>API</h1>
      <h2>Pokemon</h2>
      <button 
        onClick={fetchRandomPokemon} 
        style={{ 
          backgroundColor: 'navy', 
          color: 'white', 
          border: 'none', 
          padding: '10px 20px', 
          fontSize: '16px', 
          cursor: 'pointer', 
          marginBottom: '20px' 
        }}
      >
        Get Pokemon Dex
      </button>
      {selectedPokemon && (
        <div style={{ 
          backgroundColor: 'lightgreen', 
          padding: '20px', 
          borderRadius: '10px', 
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', 
          maxWidth: '400px', 
          margin: '0 auto' 
        }}>
          <img src={selectedPokemon.sprites.front_default} alt={selectedPokemon.name} style={{ maxWidth: '100px', marginBottom: '10px' }} />
          <div style={{ textAlign: 'left' }}>
            <p><strong>Name:</strong> {selectedPokemon.name}</p>
            <p><strong>Type:</strong> {selectedPokemon.types.map((type, index) => (
              <span key={index}>{type.type.name}{index !== selectedPokemon.types.length - 1 ? ', ' : ''}</span>
            ))}</p>
            <p><strong>Base stats:</strong> </p>
            <ul>
              {selectedPokemon.stats.map((stat, index) => (
                <li key={index}>{stat.stat.name}: {stat.base_stat}</li>
              ))}
            </ul>
          </div>
          <p>Evolution Chain:</p>
          <ul>
            {evolutionChain.map((pokemon, index) => (
              <li key={index}>
                <img src={pokemon.image} alt={pokemon.name} style={{ maxWidth: '100px', marginBottom: '10px' }} />
                <div style={{ textAlign: 'left' }}>
                  <p><strong>Name:</strong> {pokemon.name}</p>
                  <p><strong>Type:</strong> {pokemon.types.map((type, index) => (
                    <span key={index}>{type}{index !== pokemon.types.length - 1 ? ', ' : ''}</span>
                  ))}</p>
                  <p><strong>Base stats:</strong> </p>
                  <ul>
                    {pokemon.stats.map((stat, index) => (
                      <li key={index}>{stat.name}: {stat.base_stat}</li>
                    ))}
                  </ul>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;

