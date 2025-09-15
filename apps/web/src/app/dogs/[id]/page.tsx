export default function DogDetailPage({ params }: { params: { id: string } }) {
  return (
    <div>
      <h1>Dog: {params.id}</h1>
      {/* Dog detail content will go here */}
    </div>
  );
}
