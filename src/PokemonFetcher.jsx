import React, { useState, useEffect } from 'react';
import './PokemonFetcher.css'; // Opcional: para estilos básicos
import pokemonLogo from './assets/International_Pokémon_logo.svg.png';
import pokemonIcon from './assets/pokemon-4657023_1280.webp';

const PokemonFetcher = () => {
  const [pokemones, setPokemones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [tipoSeleccionado, setTipoSeleccionado] = useState('');
  const [tiposDisponibles, setTiposDisponibles] = useState([]);

  // Lista de tipos de Pokémon disponibles (en inglés para las solicitudes a la API)
  const tiposPokemon = [
    'normal', 'fire', 'water', 'electric', 'grass', 'ice', 'fighting', 'poison',
    'ground', 'flying', 'psychic', 'bug', 'rock', 'ghost', 'dragon', 'dark',
    'steel', 'fairy'
  ];

  // Mapeo de tipos de inglés a español para mostrar en la interfaz
  const tiposEnEspanol = {
    'normal': 'Normal',
    'fire': 'Fuego',
    'water': 'Agua',
    'electric': 'Eléctrico',
    'grass': 'Planta',
    'ice': 'Hielo',
    'fighting': 'Lucha',
    'poison': 'Veneno',
    'ground': 'Tierra',
    'flying': 'Volador',
    'psychic': 'Psíquico',
    'bug': 'Bicho',
    'rock': 'Roca',
    'ghost': 'Fantasma',
    'dragon': 'Dragón',
    'dark': 'Siniestro',
    'steel': 'Acero',
    'fairy': 'Hada'
  };

  // Cargar tipos disponibles al montar el componente
  useEffect(() => {
    setTiposDisponibles(tiposPokemon);
  }, []);

  // Función para cargar Pokémon aleatorios
  const fetchPokemonesAleatorios = async () => {
    try {
      setCargando(true);
      setError(null);
      const fetchedPokemones = [];
      const pokemonIds = new Set(); // Usar un Set para asegurar IDs únicos

      // Generar 4 IDs de Pokémon únicos aleatorios
      while (pokemonIds.size < 4) {
        const randomId = Math.floor(Math.random() * 898) + 1; // 898 es el número actual de Pokémon en la PokeAPI
        pokemonIds.add(randomId);
      }

      // Convertir el Set a un array para iterar
      const idsArray = Array.from(pokemonIds);

      for (const id of idsArray) {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}/`);
        if (!response.ok) {
          throw new Error(`Error al cargar el Pokémon con ID ${id}: ${response.statusText}`);
        }
        const data = await response.json();
        fetchedPokemones.push({
          id: data.id,
          nombre: data.name,
          imagen: data.sprites.front_default,
          tipos: data.types.map(typeInfo => typeInfo.type.name),
        });
      }
      setPokemones(fetchedPokemones);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  // Función para cargar Pokémon por tipo
  const fetchPokemonesPorTipo = async (tipo) => {
    try {
      setCargando(true);
      setError(null);
      const fetchedPokemones = [];

      // Hacer solicitud a la API para obtener Pokémon del tipo seleccionado
      const response = await fetch(`https://pokeapi.co/api/v2/type/${tipo}/`);
      if (!response.ok) {
        throw new Error(`Error al cargar el tipo ${tipo}: ${response.statusText}`);
      }

      const data = await response.json();

      // Tomar los primeros 8 Pokémon del tipo seleccionado
      const pokemonesDelTipo = data.pokemon.slice(0, 8);

      // Obtener detalles de cada Pokémon
      for (const pokemonInfo of pokemonesDelTipo) {
        const pokemonResponse = await fetch(pokemonInfo.pokemon.url);
        if (!pokemonResponse.ok) {
          continue; // Saltar este Pokémon si hay error
        }

        const pokemonData = await pokemonResponse.json();
        fetchedPokemones.push({
          id: pokemonData.id,
          nombre: pokemonData.name,
          imagen: pokemonData.sprites.front_default,
          tipos: pokemonData.types.map(typeInfo => typeInfo.type.name),
        });
      }

      setPokemones(fetchedPokemones);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  // Manejar cambio de tipo seleccionado
  const handleTipoChange = (e) => {
    const tipo = e.target.value;
    setTipoSeleccionado(tipo);

    if (tipo === '') {
      // Si no hay tipo seleccionado, cargar Pokémon aleatorios
      fetchPokemonesAleatorios();
    } else {
      // Si hay tipo seleccionado, filtrar por ese tipo
      fetchPokemonesPorTipo(tipo);
    }
  };

  // Función para convertir tipos de inglés a español
  const convertirTiposAEspanol = (tipos) => {
    return tipos.map(tipo => tiposEnEspanol[tipo] || tipo.charAt(0).toUpperCase() + tipo.slice(1));
  };

  // Función para obtener la clase CSS del tipo
  const obtenerClaseTipo = (tipo) => {
    const tipoEspanol = tiposEnEspanol[tipo] || tipo;
    const claseTipo = tipoEspanol.toLowerCase().replace(/[áéíóú]/g, function(match) {
      const acentos = { 'á': 'a', 'é': 'e', 'í': 'i', 'ó': 'o', 'ú': 'u' };
      return acentos[match];
    });
    return `tipo-${claseTipo}`;
  };

  // Función para obtener la URL del icono de tipo
  const obtenerIconoTipo = (tipo) => {
    const tipoEspanol = tiposEnEspanol[tipo] || tipo;
    try {
      // Importación dinámica de los iconos de tipos
      return new URL(`./assets/tipos-pokemon/Icon_${tipoEspanol}.webp`, import.meta.url).href;
    } catch (error) {
      console.warn(`No se pudo cargar el icono para el tipo: ${tipoEspanol}`);
      return '';
    }
  };

  // Cargar Pokémon aleatorios al montar el componente
  useEffect(() => {
    fetchPokemonesAleatorios();
  }, []); // El array vacío asegura que se ejecute solo una vez al montar el componente

  if (cargando) {
    return <div className="pokemon-container">Cargando Pokémon...</div>;
  }

  if (error) {
    return <div className="pokemon-container error">Error: {error}</div>;
  }

  return (
    <div className='pokemon-container'>
      <h2><img id="pokemon-logo" src={pokemonLogo} alt="Pokémon Logo" /></h2>

      {/* Selector de tipo */}
      <div className="filtro-tipo">
        <label htmlFor="tipo-select">Filtrar por tipo: </label>
        <img id="icono-pokemon" src={pokemonIcon} alt="icono-pokemon" />

        <select
          id="tipo-select"
          value={tipoSeleccionado}
          onChange={handleTipoChange}
          className="tipo-selector"
        >
          <option value="">Todos los tipos (Aleatorios)</option>
          {tiposDisponibles.map(tipo => (
            <option key={tipo} value={tipo}>
              {tiposEnEspanol[tipo]}
            </option>
          ))}
        </select>
      </div>

      {/* Título dinámico */}
      <h3>
        {tipoSeleccionado
          ? (
            <>
              Pokémon de tipo {tiposEnEspanol[tipoSeleccionado]}
              {tipoSeleccionado && (
                <img
                // seleccionar el icono de tipo de pokemon de la carpeta assets/tipos-pokemon
                  src={obtenerIconoTipo(tipoSeleccionado)}
                  alt={`icono tipo ${tiposEnEspanol[tipoSeleccionado]}`}
                  className="icono-tipo-titulo"
                  style={{ marginLeft: '10px', width: '2em', height: '2em', verticalAlign: 'middle' }}
                />
              )}
            </>
          )
          : 'Tus 4 Pokémon Aleatorios'
        }
      </h3>

      <div className="pokemon-list">
        {pokemones.map(pokemon => (
          <div key={pokemon.id} className="pokemon-card">
            <h3>{pokemon.nombre.charAt(0).toUpperCase() + pokemon.nombre.slice(1)}</h3>
            <img src={pokemon.imagen} alt={pokemon.nombre} />
            <p>
              <strong>Tipos:</strong>
            </p>
            <div className="tipos-container">
              {pokemon.tipos.map(tipo => (
                <span
                  key={tipo}
                  className={`tipo-badge ${obtenerClaseTipo(tipo)}`}
                >
                  {tiposEnEspanol[tipo]}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PokemonFetcher;
