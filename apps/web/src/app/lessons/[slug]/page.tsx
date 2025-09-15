export default function LessonDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  return (
    <div>
      <h1>Lesson: {params.slug}</h1>
      {/* Lesson detail content will go here */}
    </div>
  );
}
