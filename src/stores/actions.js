export default function initDeck(set) {
  var urly = `https://us-central1-playground-dna.cloudfunctions.net/api/graphql/?query={cards%20{title%20bgImageURL%20date}}`;
  fetch(urly)
    .then(res => res.json())
    .then(data => {
      set(data.data.cards);
    });
}
