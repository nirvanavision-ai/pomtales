/*
  Pom Tales site content. Edit this file to update the site.
  Anything marked [PLACEHOLDER] still needs real Pom Tales content.
*/
window.POM = {
  site: {
    name: "Pom Tales",
    tagline: "Little dogs. Big adventures.", // [PLACEHOLDER] replace with your tagline
    intro:
      "Pom Tales is an animated series following a pack of fluffy Pomeranians through everyday mischief and big-hearted adventures. New episodes drop regularly. Grab a snack and press play.", // [PLACEHOLDER]
    email: "hello@thepomtales.com", // [PLACEHOLDER]
    socials: [
      { label: "YouTube", url: "#" },   // [PLACEHOLDER]
      { label: "Instagram", url: "#" }, // [PLACEHOLDER]
      { label: "TikTok", url: "#" }     // [PLACEHOLDER]
    ]
  },

  // Quick facts shown under the hero.
  facts: [
    { label: "Episodes", value: "12" },        // [PLACEHOLDER]
    { label: "Seasons", value: "2" },          // [PLACEHOLDER]
    { label: "Runtime", value: "~5 min each" },// [PLACEHOLDER]
    { label: "For", value: "All ages" }        // [PLACEHOLDER]
  ],

  /*
    Episodes. Newest first.
    - id: used in the link (episode.html?id=...)
    - youtube: the video ID only, e.g. "dQw4w9WgXcQ" from youtube.com/watch?v=dQw4w9WgXcQ
    - thumb: path to an image in assets/img (leave "" to use the YouTube thumbnail or a placeholder)
    - featured: true shows it in the "Featured episodes" section
  */
  episodes: [
    { id: "s2e6", season: 2, number: 6, title: "Episode Title Six", logline: "One-line hook for this episode.", description: "A short paragraph about what happens in this episode. [PLACEHOLDER]", date: "2026-10-01", runtime: "5:12", youtube: "", thumb: "", tags: ["Adventure", "Friendship"], featured: true },
    { id: "s2e5", season: 2, number: 5, title: "Episode Title Five", logline: "One-line hook for this episode.", description: "A short paragraph about what happens in this episode. [PLACEHOLDER]", date: "2026-09-15", runtime: "4:48", youtube: "", thumb: "", tags: ["Comedy"], featured: true },
    { id: "s2e4", season: 2, number: 4, title: "Episode Title Four", logline: "One-line hook for this episode.", description: "A short paragraph about what happens in this episode. [PLACEHOLDER]", date: "2026-09-01", runtime: "5:30", youtube: "", thumb: "", tags: ["Holiday"], featured: true },
    { id: "s2e3", season: 2, number: 3, title: "Episode Title Three", logline: "One-line hook for this episode.", description: "A short paragraph about what happens in this episode. [PLACEHOLDER]", date: "2026-08-15", runtime: "5:05", youtube: "", thumb: "", tags: ["Mystery"], featured: true },
    { id: "s2e2", season: 2, number: 2, title: "Episode Title Two", logline: "One-line hook for this episode.", description: "A short paragraph about what happens in this episode. [PLACEHOLDER]", date: "2026-08-01", runtime: "4:55", youtube: "", thumb: "", tags: ["Comedy"] },
    { id: "s2e1", season: 2, number: 1, title: "Episode Title One", logline: "One-line hook for this episode.", description: "A short paragraph about what happens in this episode. [PLACEHOLDER]", date: "2026-07-15", runtime: "5:20", youtube: "", thumb: "", tags: ["Season premiere"] },
    { id: "s1e6", season: 1, number: 6, title: "Season One Finale", logline: "One-line hook for this episode.", description: "A short paragraph about what happens in this episode. [PLACEHOLDER]", date: "2026-05-01", runtime: "6:02", youtube: "", thumb: "", tags: ["Finale"] },
    { id: "s1e5", season: 1, number: 5, title: "Episode Title Five", logline: "One-line hook for this episode.", description: "A short paragraph about what happens in this episode. [PLACEHOLDER]", date: "2026-04-15", runtime: "4:40", youtube: "", thumb: "", tags: ["Adventure"] },
    { id: "s1e4", season: 1, number: 4, title: "Episode Title Four", logline: "One-line hook for this episode.", description: "A short paragraph about what happens in this episode. [PLACEHOLDER]", date: "2026-04-01", runtime: "5:15", youtube: "", thumb: "", tags: ["Comedy"] },
    { id: "s1e3", season: 1, number: 3, title: "Episode Title Three", logline: "One-line hook for this episode.", description: "A short paragraph about what happens in this episode. [PLACEHOLDER]", date: "2026-03-15", runtime: "4:58", youtube: "", thumb: "", tags: ["Friendship"] },
    { id: "s1e2", season: 1, number: 2, title: "Episode Title Two", logline: "One-line hook for this episode.", description: "A short paragraph about what happens in this episode. [PLACEHOLDER]", date: "2026-03-01", runtime: "5:10", youtube: "", thumb: "", tags: ["Adventure"] },
    { id: "s1e1", season: 1, number: 1, title: "Pilot", logline: "Where it all began.", description: "A short paragraph about what happens in this episode. [PLACEHOLDER]", date: "2026-02-14", runtime: "5:45", youtube: "", thumb: "", tags: ["Pilot"] }
  ],

  // The cast. [PLACEHOLDER] names, roles and art.
  characters: [
    { name: "Character One", role: "The brave leader of the pack.", img: "" },
    { name: "Character Two", role: "Always hungry, always scheming.", img: "" },
    { name: "Character Three", role: "The sleepy one with big ideas.", img: "" },
    { name: "Character Four", role: "Small paws, loudest bark.", img: "" }
  ],

  // FAQ. [PLACEHOLDER] answers.
  faq: [
    { q: "Where can I watch Pom Tales?", a: "Every episode is on this site and on our YouTube channel." },
    { q: "Is Pom Tales suitable for kids?", a: "Yes. Every episode is made to be family friendly." },
    { q: "How often do new episodes come out?", a: "We release new episodes regularly. Follow us on social media to hear first." },
    { q: "Are the Poms real dogs?", a: "Tell fans the story behind the characters here." },
    { q: "Can I use Pom Tales clips or art?", a: "Please get in touch before using any Pom Tales material." },
    { q: "How can I work with Pom Tales?", a: "For partnerships, licensing or press, email us using the address below." }
  ]
};
