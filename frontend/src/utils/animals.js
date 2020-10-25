const chooseRandomly = (arr) => {
  return arr[Math.floor(Math.random() * arr.length)];
};
const randomAnimal = () => {
  var animals = [
    "Panda",
    "Fish",
    "Crocodile",
    "Dog",
    "Cat",
    "Bird",
    "Eagle",
    "Beaver",
    "Elephant",
    "Giraffe",
    "Hamster",
    "Iguana",
    "Kangaroo",
  ];
  const adjectives = [
    "Powerful",
    "Macaroni",
    "Coffee",
    "Large",
    "Benevolent",
    "Omnipotent",
    "Loquacious",
    "Noisy",
    "Elated",
    "Energetic",
    "Strange",
    "Stormy",
    "Successful",
    "Talented",
    "Lovely",
  ];
  const adjective = chooseRandomly(adjectives);
  const animal = chooseRandomly(animals);

  return `${adjective} ${animal}`;
};
export default randomAnimal;
