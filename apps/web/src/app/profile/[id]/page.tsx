export default function ProfilePage({ params }: { params: { id: string } }) {
  return (
    <div>
      <h1>Profile: {params.id}</h1>
      {/* User profile content will go here */}
    </div>
  );
}
