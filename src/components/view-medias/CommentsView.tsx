import CommentsInput from "./CommentsInput";

export default function CommentsView() {
  return (
    <>
      <CommentsInput />

      <div className="flex items-center justify-center py-4 text-sm text-[#c7c7c7]">
        Aucun commentaire pour le moment. Soyez le premier à commenter !
      </div>
    </>
  );
}
