/**
 * Generates meta tags for a given page title.
 * @param {string} title - The title of the page.
 * @returns {Array} An array containing the title and description meta tags.
 */
export function generateMeta(title: string) {
  return () => [
    { title: `${title} | GuardedHeart Therapy` },
    {
      name: "description",
      content: "This aims to develop a web application that facilitates real-time communication between users seeking therapy or counseling ( ANONYMOUSLY ) and available verified therapists.",
    },
  ];
}
