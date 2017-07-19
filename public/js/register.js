/* Front end validation using Javascript for user registration */
function loadPlaces()
{
    var autocomplete = new google.maps.places.Autocomplete(document.getElementById("city"));

    autocomplete.addListener('place_changed', function()
    {
      var place = autocomplete.getPlace();
      console.log(place);
    });
}
