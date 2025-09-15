export default function PostDetailPage({ params }: { params: { id: string } }) {
  return (
    <div>
      <h1>Post: {params.id}</h1>
      {/* Post detail and comments will go here */}
    </div>
  );
}
