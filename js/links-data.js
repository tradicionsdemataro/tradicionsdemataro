// links-data.js
// Dades estàtiques de la pàgina "Links" (extretes de Links.jsx)

const categories = [
  {
    id: "institucional",
    className: "cat-institucional",
    icon: "🏛️",
    nom: "Institucionals i Cultura",
    accentColor: "var(--yellow)",
    links: [
      { nom: "TV Mataró",       url: "https://www.tvmataro.cat/" },
      { nom: "Cultura Mataró",  url: "https://www.culturamataro.cat/" },
      { nom: "Fundació Iluro",  url: "https://fundacioiluro.cat/" },
      { nom: "Visit Mataró",    url: "https://visitmataro.cat/" },
      { nom: "EMM Mataró",      url: "https://www.emmmataro.cat/" },
      { nom: "Sala Cabanyes",   url: "https://salacabanyes.cat/" },
      { nom: "Capgròs",         url: "https://capgros.elnacional.cat/" },
    ],
  },
  {
    id: "festes",
    className: "cat-festes",
    icon: "🎭",
    nom: "Festes i Tradicions",
    accentColor: "var(--orange)",
    links: [
      { nom: "Pessebres de Mataró",    url: "https://www.pessebresmataro.org/" },
      { nom: "Setmana Santa Mataró",   url: "https://setmanasantamataro.blogspot.com/" },
      { nom: "Armats de Mataró",       url: "https://armatsdemataro.cat/" },
      { nom: "Hermandad Nazareno",     url: "https://hermandadnazareno.blogspot.com/" },
      { nom: "Crist Bona Mort",        url: "https://cristbonamort.blogspot.com/" },
      { nom: "Captiu Dolors Mataró",   url: "https://captiudolorsmataro.blogspot.com/" },
      { nom: "Coronació d'Espines",    url: "https://bonamort.wixsite.com/coronaciodespines" },
      { nom: "Pellofa Oficial",        url: "https://www.pellofaoficial.com/" },
      { nom: "Cercavila.cat",          url: "https://cercavila.cat/" },
      { nom: "Sardanistes Sta. Anna",  url: "https://sardanistesdesantaanna.blogspot.com/" },
    ],
  },
  {
    id: "musica",
    className: "cat-musica",
    icon: "🎶",
    nom: "Música, Colles i Associacions",
    accentColor: "var(--pink)",
    links: [
      { nom: "NEM",                   url: "https://nem.cat/" },
      { nom: "La Gofreria",           url: "https://lagofreria.com/" },
      { nom: "Godrac Mataró",         url: "https://www.godracmataro.cat/" },
      { nom: "GIE Escola",            url: "https://www.giescola.com/" },
      { nom: "Boetukada",             url: "https://boetukadaboetukada.blogspot.com/" },
      { nom: "AV Cirera",             url: "https://www.avcirera.cat/" },
      { nom: "Colla Lucius Marcius",  url: "https://collaluciusmarcius.wordpress.com/" },
      { nom: "Mestres del Gai Saber", url: "https://mestresdelgaisaber.cat/" },
      { nom: "CLAP",                  url: "https://www.clap.cat/" },
      { nom: "Casa de la Música",     url: "https://www.casadelamusica.cat/" },
      { nom: "MC Guiu",               url: "https://mcguiu.cat/" },
      { nom: "Oscar Torres Band",     url: "https://www.oscartorresband.es/" },
    ],
  },
  {
    id: "port",
    className: "cat-port",
    icon: "⚓",
    nom: "Port, Marina i Esports",
    accentColor: "var(--blue)",
    links: [
      { nom: "Port Mataró", url: "https://portmataro.org/" },
      { nom: "REM Mataró",  url: "https://remmataro.com/" },
    ],
  },
  {
    id: "llibres",
    className: "cat-llibres",
    icon: "📚",
    nom: "Llibres, Arts i Educació",
    accentColor: "var(--yellow)",
    links: [
      { nom: "Dòria Llibres",       url: "https://www.doriallibres.com/" },
      { nom: "Espai Agrari Mataró", url: "https://espaiagrarimataro.cat/" },
      { nom: "Rovira Brull",        url: "https://rovirabrull.cat/" },
    ],
  },
  {
    id: "festivals",
    className: "cat-festivals",
    icon: "🎉",
    nom: "Festivals i Esdeveniments",
    accentColor: "var(--pink)",
    links: [
      { nom: "Festa Tardor",       url: "https://www.festatardor.com/" },
      { nom: "Festival 2 Tersos",  url: "https://www.festival2tersos.cat/" },
      { nom: "La Fuerza del Alma", url: "https://lafuerzadelalma.com/" },
      { nom: "Mashup Party",       url: "https://mashupparty.com/" },
    ],
  },
  {
    id: "gegants",
    className: "cat-gegants",
    icon: "🤴",
    nom: "Gegants, Capgrossos i Tradicions Populars",
    accentColor: "var(--orange)",
    links: [
      { nom: "Gegantcat",      url: "https://gegantcat.com/" },
      { nom: "Gegants Mataró", url: "https://www.gegantsmataro.net/" },
      { nom: "Robafaves",      url: "https://www.robafaves.cat/" },
      { nom: "Capgrossos",     url: "https://capgrossos.cat/" },
    ],
  },
  {
    id: "social",
    className: "cat-social",
    icon: "🏢",
    nom: "Fundacions i Suport Social",
    accentColor: "var(--blue)",
    links: [
      { nom: "Fundació Maresme",        url: "http://www.fundaciomaresme.cat/" },
      { nom: "Associació Sempervirens", url: "https://firadelarbremataro.com/" },
    ],
  },
];

const totalLinks = categories.reduce((acc, c) => acc + c.links.length, 0);

function netloc(url) {
  try { return new URL(url).hostname.replace(/^www\./, ""); }
  catch { return url; }
}