import ActorCard from "./ActorCard";

export default function CastingView() {
  return (
    <div className="grid grid-cols-3 gap-4">
      <ActorCard actorName="John Doe" actorRole="Lead Actor" />
      <ActorCard actorName="Jane Smith" actorRole="Supporting Actor" />
      <ActorCard actorName="Bob Johnson" actorRole="Background Actor" />
    </div>
  );
}
