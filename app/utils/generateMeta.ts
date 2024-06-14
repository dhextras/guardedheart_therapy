export function generateMeta(title: string) {
  return () => [
    { title: `${title} | GuardedHeart Therapy` },
    {
      name: "This aims to develop a web application that facilitates real-time communication between users seeking therapy or counseling ( ANONYMOUSLY ) and available verified therapists.",
      content: "Welcome to GuardedHeart Therapy!",
    },
  ];
}
