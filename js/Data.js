// ============================================================
// data.js — Totes les constants estàtiques que abans estaven
// definides dins del component React Home.jsx
// ============================================================

const timelineParagraphs = [
  {
    year: 2015,
    text: "El nostre blog Tradicions de Mataró va començar amb la idea d'explicar la cultura popular de la ciutat.",
    audio: "/audio/2015.mp3",
    img: "/images/timeline/2015.jpg",
    trobans: [
      { titol: "Trobada fundacional al Cafè del Teatre", desc: "Primera reunió de l'equip per definir la línia editorial del blog." }
    ]
  },
  {
    year: 2016,
    text: "Vam publicar les primeres entrades amb fotos i vídeos de la Mostra de Gegants, mostrant la riquesa cultural de Mataró.",
    audio: "/audio/2016.mp3",
    img: "/images/timeline/2016.jpg",
    trobans: [
      { titol: "Mostra de Gegants 2016", desc: "Cobertura completa amb fotografies i vídeos exclusius de la rua." },
      { titol: "Taller de fotografia cultural", desc: "Sessió formativa amb el col·lectiu per millorar la qualitat audiovisual." }
    ]
  },
  {
    year: 2017,
    text: "Comencem a fer reportatges més complets amb entrevistes a experts locals i fotografies exclusives.",
    audio: "/audio/2017.mp3",
    img: "/images/timeline/2017.jpg",
    trobans: [
      { titol: "Entrevista al Museu de Mataró", desc: "Conversa amb l'historiador local sobre les arrels de les festes majors." }
    ]
  },
  {
    year: 2018,
    text: "Creació de contingut original: entrevistes, noves seccions i col·laboració amb artistes locals.",
    audio: "/audio/2018.mp3",
    img: "/images/timeline/2018.jpg",
    trobans: [
      { titol: "Trobada amb artistes locals", desc: "Sessió de col·laboració al Tecla Sala per definir noves seccions." }
    ]
  },
  {
    year: 2019,
    text: "Naixement de la nostra presència a Instagram per connectar amb la comunitat jove.",
    audio: "/audio/2019.mp3",
    img: "/images/timeline/2019.jpg",
    trobans: [
      { titol: "Llançament del compte d'Instagram", desc: "Primera trobada amb seguidors per presentar el nou canal." }
    ]
  },
  {
    year: 2020,
    text: "Any especial amb contingut adaptat des de casa, incloent tutorials i activitats culturals en línia.",
    audio: "/audio/2020.mp3",
    img: "/images/timeline/2020.jpg",
    trobans: [
      { titol: "Trobades virtuals setmanals", desc: "Sessions online amb la comunitat per mantenir el contacte durant el confinament." }
    ]
  },
  {
    year: 2021,
    text: "Cobertura d'actes amb mascareta i formats digitals innovadors per mantenir viva la tradició.",
    audio: "/audio/2021.mp3",
    img: "/images/timeline/2021.jpg",
    trobans: [
      { titol: "Festa Major adaptada", desc: "Trobada a l'aire lliure amb mesures de seguretat i format híbrid." }
    ]
  },
  {
    year: 2022,
    text: "Creixement amb exposicions, col·laboracions i difusió de la cultura popular en mitjans digitals.",
    audio: "/audio/2022.mp3",
    img: "/images/timeline/2022.jpg",
    trobans: [
      { titol: "Exposició 'Memòria Viva'", desc: "Inauguració amb trobada d'entitats culturals de la ciutat." },
      { titol: "Col·laboració amb Ràdio Mataró", desc: "Primera trobada per planificar continguts conjunts." }
    ]
  },
  {
    year: 2023,
    text: "Conte de Sant Jordi i projectes especials amb participació de col·legis i associacions culturals.",
    audio: "/audio/2023.mp3",
    img: "/images/timeline/2023.jpg",
    trobans: [
      { titol: "Sant Jordi als col·legis", desc: "Trobada amb estudiants per presentar el conte commemoratiu." }
    ]
  },
  {
    year: 2024,
    text: "Expansió del contingut audiovisual, amb vídeos documentals i entrevistes en profunditat.",
    audio: "/audio/2024.mp3",
    img: "/images/timeline/2024.jpg",
    trobans: [
      { titol: "Rodatge del documental", desc: "Trobada amb els protagonistes per planificar les entrevistes en profunditat." }
    ]
  },
  {
    year: 2025,
    text: "Estrenem nova marca amb el lema: 'Teixint tradicions, creant futur', reflectint la nostra missió.",
    audio: "/audio/2025.mp3",
    img: "/images/timeline/2025.jpg",
    trobans: [
      { titol: "Presentació de la nova marca", desc: "Esdeveniment públic per donar a conèixer el rebranding i el nou lema." },
      { titol: "Trobada amb col·laboradors", desc: "Reunió per definir els objectius i projectes del 2025." }
    ]
  }
];

const sliderItems = [
  { text: "Vols unir-te a Tradicions Mataró?", link: "/unirte" },
  { text: "Vols contactar amb nosaltres?", link: "/contactar" },
  { text: "Vols saber qui som?", link: "/qui-som" },
];

const imageCarousel = [
  "/images/carrusel1.jpg",
  "/images/carrusel2.jpg",
  "/images/carrusel3.jpg"
];

const featuredArticles = [
  { titol: "La Mostra de Gegants torna amb força", categoria: "Cultura Popular", img: "/images/articles/gegants.jpg", data: "12 Maig 2026" },
  { titol: "Entrevista exclusiva amb els organitzadors de la Festa Major", categoria: "Entrevistes", img: "/images/articles/festamajor.jpg", data: "28 Abril 2026" },
  { titol: "Documental: Els oficis tradicionals de Mataró", categoria: "Audiovisual", img: "/images/articles/oficis.jpg", data: "15 Abril 2026" },
  { titol: "Sant Jordi 2026: el conte commemoratiu", categoria: "Projectes Especials", img: "/images/articles/santjordi.jpg", data: "23 Abril 2026" }
];

const statsData = [
  { numero: "10", label: "Anys de trajectòria" },
  { numero: "150", label: "Reportatges publicats" },
  { numero: "40", label: "Trobades i esdeveniments" },
  { numero: "5K", label: "Seguidors a les xarxes" }
];

const featuredTrobans = [
  { year: 2025, titol: "Presentació de la nova marca", desc: "Esdeveniment públic per donar a conèixer el rebranding i el nou lema." },
  { year: 2024, titol: "Rodatge del documental", desc: "Trobada amb els protagonistes per planificar les entrevistes en profunditat." },
  { year: 2022, titol: "Exposició 'Memòria Viva'", desc: "Inauguració amb trobada d'entitats culturals de la ciutat." },
  { year: 2021, titol: "Festa Major adaptada", desc: "Trobada a l'aire lliure amb mesures de seguretat i format híbrid." },
  { year: 2018, titol: "Trobada amb artistes locals", desc: "Sessió de col·laboració al Tecla Sala per definir noves seccions." },
  { year: 2016, titol: "Mostra de Gegants 2016", desc: "Cobertura completa amb fotografies i vídeos exclusius de la rua." },
];

const galleryItems = [
  { img: "/images/gegants-cercavila.jpg", label: "Mostra de Gegants", year: "2024", className: "g1" },
  { img: "/images/rovafabes2.jpg",        label: "Festa Major",        year: "2023", className: "g2" },
  { img: "/images/mort.jpg",              label: "Mort d'en Pallofa",  year: "2022", className: "g3" },
  { img: "/images/carnaval2.jpg",         label: "Carnaval",           year: "2025", className: "g4" },
  { img: "/images/rovafabes3.jpg",        label: "Carrers de Mataró",  year: "2021", className: "g5" },
  { img: "/images/cercavila2.jpg",        label: "Memòria Viva",       year: "2020", className: "g6" },
];

const galleryStrip = [
  { img: "/images/gegants-cercavila.jpg", label: "Castellers" },
  { img: "/images/rovafabes2.jpg",        label: "Sardanes" },
  { img: "/images/mort.jpg",              label: "Correfoc" },
  { img: "/images/carnaval2.jpg",         label: "Rua de Carnaval" },
  { img: "/images/rovafabes3.jpg",        label: "Gralla" },
  { img: "/images/cercavila2.jpg",        label: "Havaneres" },
];

const videoSideItems = [
  {
    thumb:    "/images/video1.mp4",
    title:    "La Seixantada Dels 60 anys  de la Fundació el Maresme amb la Crida a la Festa",
    cat:      "Cobertura",
    catClass: "video-cat--yellow",
    duration: "6:12",
    date:     "Juny 2026",
  },
  {
    thumb:    "/images/video2.mp4",
    title:    "Mataró celebra Sant Jordi amb una gran Trobada de gegants, gegantes i nans",
    cat:      "Reportatge",
    catClass: "video-cat--pink",
    duration: "4:47",
    date:     "Abril 2026",
  },
  {
    thumb:    "/images/video3.mp4",
    title:    "Carnestoltes Mataró 2026 festa, humor i reivindicació en una rua amb Disbauixa",
    cat:      "Especial",
    catClass: "video-cat--yellow",
    duration: "8:03",
    date:     "Febrer 2026",
  },
  {
    thumb:    "/images/video4.mp4",
    title:    "Gelats Karbú, obert tot l'any: moments de dolçor per compartir i somriure ",
    cat:      "Especial",
    catClass: "video-cat--yellow",
    duration: "8:03",
    date:     "Octubre 2026",
  },
];

const videoReels = [
  { thumb: "/images/cercavila2.jpg",        label: "Cercavila nocturna",  duration: "0:58" },
  { thumb: "/images/carnaval2.jpg",         label: "Foc i música",        duration: "1:12" },
  { thumb: "/images/gegants-cercavila.jpg", label: "Gegants infantils",   duration: "0:44" },
  { thumb: "/images/rovafabes3.jpg",        label: "Sardana a la plaça",  duration: "1:05" },
  { thumb: "/images/mort.jpg",              label: "Tarda de carnaval",   duration: "0:37" },
];

const PUBLI_PER_PAGE = 4;