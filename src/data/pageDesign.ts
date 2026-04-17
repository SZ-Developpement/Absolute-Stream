interface ImageData {
  name: string;
  src: string;
  // Propriete qui sert a savoir si les sous page auront aussi limage en fond
  // exemple: si false la page /films/123 aura l'image de fond de la page /films
  exact?: boolean;
}

export const pageDesign: ImageData[] = [
  {
    name: "movies",
    src: "https://image.tmdb.org/t/p/original/rshlQ6LfPRSWFhpGL4s5ZkIPR51.jpg",
    exact: true,
  },
  {
    name: "series",
    src: "https://image.tmdb.org/t/p/original/tkfUWT5WULSz9GuJldBUxq8yH6C.jpg",
    exact: true,
  },
  {
    name: "animes",
    src: "https://image.tmdb.org/t/p/original/fFI7CYmqbW28eD7QbSxtUk9dABO.jpg",
    exact: true,
  },
  {
    name: "match",
    src: "https://image.tmdb.org/t/p/original/pdfwmHRUrreESvcWXUtJs9KjBcT.jpg",
    exact: false,
  },
];
