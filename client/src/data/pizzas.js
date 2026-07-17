// Temporary pizza data.
// Later this data will come from our backend database.
import pepperoni from "../assets/pizza/pepperoni.jpg";
import hawaiian from "../assets/pizza/hawaiian.jpg";
import bbqChicken from "../assets/pizza/bbq-chicken.jpg";
// Array of pizza objects
const pizzas = [
  {
    id: 1,
    name: "Pepperoni",
    description: "Loaded with mozzarella cheese and pepperoni.",
    price: 129.99,
    image: pepperoni,
    rating: 4.9,
    popular: true,
  },

  {
    id: 2,
    name: "Hawaiian",
    description: "Ham, pineapple and mozzarella cheese.",
    price: 119.99,
    image: hawaiian,
    rating: 4.9,
    popular: false,
  },

  {
    id: 3,
    name: "BBQ Chicken",
    description: "Grilled chicken with BBQ sauce.",
    price: 149.99,
    image: bbqChicken,
    rating: 4.9,
    popular: true,
  },
];

// Make this array available to other files
export default pizzas;
