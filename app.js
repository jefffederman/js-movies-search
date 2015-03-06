var moviesSearch = (function() {
  var OMDBEndpoint = 'http://www.omdbapi.com/';

  var searchForm = document.getElementById('search');

  searchForm.addEventListener('submit', function(event) {
    event.preventDefault();
    var searchTitle = document.getElementById('searchTitle');
    var searchString = searchTitle.value;
    var url = OMDBEndpoint + '?s=' + searchString;
    updateResults(url);
  });

  function updateResults(url) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          var data = JSON.parse(xhr.responseText);
          var items = data.Search;
          var html = "";
          for (var i = 0; i < items.length; i++) {
            html += buildResultEntry(items[i]);
          }
          document.getElementById('results').innerHTML = html;
        } else {
          console.log('There was a problem with this request.');
        }
      }
    };
    xhr.open('GET', url);
    xhr.send();
  }

  function buildResultEntry(searchResult) {
    var title = searchResult.Title;
    var year = searchResult.Year;
    var movieId = searchResult.imdbID;
    var url = getURLforMovieId(movieId);
    return '<li><a class="search-result" href="' + url + '">' +  title + ' (' + year + ')</a></li>';
  }

  var searchResults = document.getElementById('results');

  searchResults.addEventListener('click', function(event) {
    event.preventDefault();
    var target = event.target;
    if (target && target.nodeName == "A") {
      var url = target.getAttribute('href');
      updateDetails(url);
    }
  });

  var movieKeys = ['Rated', 'Released', 'Runtime', 'Genre', 'Director', 'Writer', 'Actors', 'Plot', 'Language', 'Country', 'Awards'];

  function updateDetails(url) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          var data = JSON.parse(xhr.responseText);
          html = buildResultDetails(data);
          document.getElementById('details').innerHTML = html;
        } else {
          console.log('There was a problem with this request.');
        }
      }
    };
    xhr.open('GET', url);
    xhr.send();
  }

  function buildResultDetails(data) {
    var title = data.Title;
    var year = data.Year;
    var posterURL = data.Poster;
    var movieId = data.imdbID;
    var html = "";
    var poster = buildPoster(posterURL, title);
    var isAFavorite = isFavorite(movieId);
    var heading = buildHeading(title, year, isAFavorite);
    var dlContent = "";
    for (var key in data) {
      if (movieKeys.indexOf(key) != -1) {
        var dt = '<dt>' + key + ':</dt>';
        var dd = '<dd>' + data[key] + '</dd>';
        dlContent += dt + dd;
      }
    }
    var dl = '<dl>' + dlContent + '</dl>';
    var favoriteToggle = buildAddOrRemoveFavorite(movieId, isAFavorite);
    var body = '<div class="detail-body">' + heading + dl + favoriteToggle + '</div>';
    return html += '<hr>' + poster + body;
  }

  function getURLforMovieId(movieId) {
    return OMDBEndpoint + '?i=' + movieId;
  }

  function buildPoster(url, title) {
    var src = url.indexOf('http') != -1 ? url : 'http://placehold.it/300&text=No+poster+found';
    return '<img class="poster" src="' + src + '" alt="' + title + '"/>';
  }

  function buildStar() {
    return '<img src="http://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Full_Star_Yellow.svg/64px-Full_Star_Yellow.svg.png" alt="favorite" width="24" height="24"/>';
  }

  function buildHeading(title, year, isFavorite) {
    if (typeof isFavorite == 'undefined') {
      isFavorite = false;
    }
    var heading = '<h2>' + title + ' (' + year + ')';
    if (isFavorite) {
      heading += buildStar();
    }
    return heading + '</h2>';
  }

  function getFavorites() {
    return JSON.parse(localStorage.getItem('favorites')) || [];
  }

  function setFavorite(movieId) {
    var favorites = getFavorites();
    favorites.push(movieId);
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }

  function removeFavorite(movieId) {
    var favorites = getFavorites();
    var index = favorites.indexOf(movieId);
    favorites.splice(index, 1);
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }

  function isFavorite(movieId) {
    var favorites = getFavorites();
    if (favorites.indexOf(movieId) != -1) {
      return true;
    }
    return false;
  }

  function buildAddOrRemoveFavorite(movieId, isFavorite) {
    var className = isFavorite ? 'remove-from-favorites' : 'add-to-favorites';
    var text = isFavorite ? 'Remove from Favorites' : 'Add to Favorites';
    return '<button class="' + className + '" data-movie-id="' + movieId + '">' + text + '</button>';
  }

  function buildFavoritesToggle(isFavoritesShowing) {
    if (typeof isFavoritesShowing == 'undefined') {
      isFavoritesShowing = false;
    }
    var className = isFavoritesShowing ? 'show-favorites' : 'hide-favorites';
    var text = isFavoritesShowing ? 'Show Favorites' : 'Hide Favorites';
    return '<a href="#" class="' + className + '">' + text + '</a>';
  }

  function toggleFavorites(isFavoritesShowing) {
    var favoritesBox = document.getElementById('favorites');
    favoritesBox.className = favoritesBox.className.replace(/\s*favorites-(showing|hidden)/, '');
    if (isFavoritesShowing) {
      favoritesBox.className += ' favorites-hidden';
    } else {
      favoritesBox.className += ' favorites-showing';
    }
  }

  var movieDetails = document.getElementById('details');

  movieDetails.addEventListener('click', function(event) {
    var target = event.target;
    if (target && target.className == 'add-to-favorites') {
      var movieId = target.dataset.movieId;
      setFavorite(movieId);
      updateDetails(getURLforMovieId(movieId));
    }
    if (target && target.className == 'remove-from-favorites') {
      var movieId = target.dataset.movieId;
      removeFavorite(movieId);
      updateDetails(getURLforMovieId(movieId));
    }
  });

  var favoritesToggle = document.getElementById('favorites-toggle');

  favoritesToggle.innerHTML = buildFavoritesToggle(true);

  favoritesToggle.addEventListener('click', function(event) {
    event.preventDefault();
    var target = event.target;
    var isFavoritesShowing;
    if (target && target.className == 'show-favorites') {
      isFavoritesShowing = false;
      favoritesToggle.innerHTML = buildFavoritesToggle(isFavoritesShowing);
      toggleFavorites(isFavoritesShowing);
    }
    if (target && target.className == 'hide-favorites') {
      isFavoritesShowing = true;
      favoritesToggle.innerHTML = buildFavoritesToggle(isFavoritesShowing);
      toggleFavorites(isFavoritesShowing);
    }

  });
})();
