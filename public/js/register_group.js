
/* Autocomplete for the Google maps location */
function loadPlaces()
{
    var autocomplete = new google.maps.places.Autocomplete(document.getElementById("location"));

    autocomplete.addListener('place_changed', function()
    {
      var place = autocomplete.getPlace();
      console.log(place);
    });
}
