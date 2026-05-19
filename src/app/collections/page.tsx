import CardCollection from "@/components/collection/CardCollection";

export default function CollectionsPage() {
  return (
    <div className="container-page grid">
      <div className="flex flex-col items-center justify-center gap-1 mt-6">
        <h1 className="text-4xl font-bold">Collections</h1>
        <p className="text-base text-gray-400">
          Exploréz les collections de films les plus populaires sur TMDB.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <CardCollection
          name="Fast and Furious"
          movies_count={11}
          startDate="2001-05-18"
          endDate="2023-05-19"
          ImageStart="https://image.tmdb.org/t/p/w500/wjVn1Qng8B3ySvfJr4ovuehI141.jpg"
          ImageEnd="https://image.tmdb.org/t/p/w500/v1467wvoQIXlVY5MtAqt3PUtOdH.jpg"
        />
      </div>
    </div>
  );
}

//
