// client-side js
// run by the browser each time your view template referencing it is loaded

console.log("hello world :o");

const movies = [];

// define variables that reference elements on our page
const moviesForm = document.forms[0];
const movieInput = moviesForm.elements["movie"];
const yearInput = moviesForm.elements["year"];
const moviesList = document.getElementById("movies");
const clearButton = document.querySelector('#clear-movies');

// request the movies from our app's sqlite database
fetch("/getMovies", {})
  .then(res => res.json())
  .then(response => {
    response.forEach(row => {
      appendNewMovie(row.movie);
    });
  });

// a helper function that creates a list item for a given movie
const appendNewMovie = (movie, year) => {
  const newListItem = document.createElement("li");
  newListItem.innerText = movie + ` (${year})`;
  moviesList.appendChild(newListItem);
};

// listen for the form to be submitted and add a new movie when it is
moviesForm.onsubmit = event => {
  // stop our form submission from refreshing the page
  event.preventDefault();

  const data = { movie: movieInput.value,
                 year: yearInput.value 
               };

  fetch("/addMovie", {
    method: "POST",
    body: JSON.stringify(data),
    headers: { "Content-Type": "application/json" }
  })
    .then(res => res.json())
    .then(response => {
      console.log(JSON.stringify(response));
    });
  // get movie value and add it to the list
  movies.push(movieInput.value, yearInput.value);
  appendNewMovie(movieInput.value, yearInput.value);

  // reset form
  movieInput.value = "";
  yearInput.value = "";
  movieInput.focus();
};

clearButton.addEventListener('click', event => {
  fetch("/clearMovies", {})
    .then(res => res.json())
    .then(response => {
      console.log("cleared movies");
    });
  moviesList.innerHTML = "";
});
