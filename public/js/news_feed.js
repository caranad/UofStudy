var uos_profile_tabs = jQuery(".uos_news_feed_header ul li a");

/* Start Google maps and place all the markers */
function start()
{
	var mapProp =
	{
    	center: new google.maps.LatLng(43.663, -79.40),
    	zoom: 12,
	};

	var map = new google.maps.Map(document.getElementById("uos_google_map"), mapProp);
	var geocoder = new google.maps.Geocoder();

	geocode_locations(geocoder, map);
}

function geocode_locations(geocoder, map)
{
	$.ajax({
		url: 'studygroups/locations',
		method: "GET",
		dataType: 'json',
		success: function(data)
		{
			var locations = data;

			for (var i = 0; i < locations.length; i++)
			{
				var group_name = locations[i]['group_name'];
				var group_id = locations[i]['id'];
				var location = locations[i]['location'];

				post_location(geocoder, map, group_name, group_id, location);
			}
		}
	});
}

function post_location(geocoder, map, name, id, location)
{
	geocoder.geocode({address: location}, function(results, status)
	{
		// Place information data
		if (status == 'OK')
		{
			var marker = new google.maps.Marker({
				map: map,
				position: results[0].geometry.location
			});

			var content = "Group: " + name + "<div><a href = '/group?id=" + id + "'>View group</a></div>";

			// Display the information of the google maps marker
			var infowindow = new google.maps.InfoWindow({ content: content });

			// When marker clicked, do this
			google.maps.event.addListener(marker, 'click', function ()
			{
				infowindow.open(map, marker);
			});
		}
	});
}

/* Open the search, recommended groups, maps, etc. tab */
function open_tab()
{
	var value = jQuery(this).attr("id");
	jQuery(".uos_basic_search").hide();

	// Toggle the highlight
	jQuery(".highlighted").removeClass("highlighted");
	jQuery(this).parent().addClass("highlighted");

	for (var i = 0; i < uos_profile_tabs.length; i++)
	{
		var tab_value = uos_profile_tabs.eq(i).attr("id");
		var class_to_affect = ".uos_" + tab_value;

		if (value == tab_value)
		{
			jQuery("" + class_to_affect).show();
		}
		else
		{
			jQuery("" + class_to_affect).hide();
		}
	}
}

function open_tab_by_name(tag)
{
	for (var i = 0; i < uos_profile_tabs.length; i++)
	{
		var tab_value = uos_profile_tabs.eq(i).attr("id");
		var class_to_affect = ".uos_" + tab_value;

		if (tag == tab_value)
		{
			jQuery("" + class_to_affect).show();
		}
		else
		{
			jQuery("" + class_to_affect).hide();
		}
	}
}

/* Delete a user account */
function delete_user()
{
	var conf = confirm("Are you sure you want to remove your account?");

	if (conf)
	{
		$.ajax({
			url: '/users?username=' + jQuery("span#username").html(),
			method: 'DELETE',
			success: function(response)
			{
				alert("User account deleted.");
				window.location.href = '/';
			},
			error: function(xhr)
			{
				alert(xhr.responseText);
			}
		})
	}
}

/* When range slider changes position, update the group size value */
function edit_group_size_text()
{
	var size = jQuery(this).val();
	jQuery(".uos_group_size_text").html(size);
}

/* When clicked, show results of basic search */
function basic_search()
{
	jQuery(".uos_map, .uos_news, .uos_profile_bar, .uos_study_group, .uos_advanced_search").hide();

	$.ajax({
		url: '/basicsearch?keyword=' + jQuery(".uos_search_bar").val(),
		method: 'GET',
		success: function(response)
		{
			jQuery(".uos_basic_search").show();
			var results = response;
			jQuery(".uos_basic_search").html("");

			if (results.length == 0)
			{
				alert("Your search queries returned nothing.");
			}
			else
			{
				var data = "";
				for (var i = 0; i < results.length; i++)
				{
					data += "<div class = 'uos_search_result'>" +
							"<img src = '" + results[i]['img'] + "'>" +
							"<div class = 'uos_result_info'>" +
								"<div class = 'uos_result_title'>" + results[i]['group_name'] + "</div>" +
								"<div class = 'uos_result_tagline'>" + results[i]['description'] + "</div>" +
								"<div class = 'uos_result_members'>Meets " + results[i]['day'] + " at " + results[i]['time'] + "</div>" +
								"<a href = '/group?id=" + results[i]['id'] + "' id = 'uos_open_group'>View profile</a>" +
							"</div>" +
						"</div>";
				}

				jQuery(".uos_basic_search").html(data);
			}
		}
	});
}

function build_adv_search_query(input)
{
	var query = "";
	var found = false;

	for (var i = 0; i < input.length; i++)
	{
		if (input.eq(i).val() != "")
		{
			if (!found)
			{
				query += "?" + input.eq(i).attr("name") + "=" + input.eq(i).val();
				found = true;
			}
			else
			{
				query += "&" + input.eq(i).attr("name") + "=" + input.eq(i).val();
			}
		}
	}

	return query;
}

/* Show advanced search results */
function show_adv_search_res(e)
{
	e.preventDefault();

	$.ajax({
		url: '/advsearch' + build_adv_search_query(jQuery(".uos_adv_search_input")),
		method: 'GET',
		success: function(response)
		{
			var results = response;
			jQuery(".uos_advanced_results").html("");

			if (results.length == 0)
			{
				alert("Your search queries returned nothing.");
			}
			else
			{
				var data = "";
				for (var i = 0; i < results.length; i++)
				{
					data += "<div class = 'uos_search_result'>" +
							"<img src = '" + results[i]['img'] + "'>" +
							"<div class = 'uos_result_info'>" +
								"<div class = 'uos_result_title'>" + results[i]['group_name'] + "</div>" +
								"<div class = 'uos_result_tagline'>" + results[i]['description'] + "</div>" +
								"<div class = 'uos_result_members'>Meets " + results[i]['day'] + " at " + results[i]['time'] + "</div>" +
								"<a href = '/group?id=" + results[i]['id'] + "' id = 'uos_open_group'>View profile</a>" +
							"</div>" +
						"</div>";
				}

				jQuery(".uos_advanced_results").html(data);
			}
		}
	});
}

function show_user_info()
{
	$.ajax({
		url: 'users/userData',
		method: "GET",
		dataType: 'json',
		success: function(data)
		{
			jQuery("#username").html(data);
			$.ajax({
				url: '/users?username='+jQuery("#username").html(),
				method: 'GET',
				dataType: 'json',
				success: function(data)
				{
					var user = data;

					jQuery(".uos_profile_info").html("<h1>" + user[0]['name'] + "</h1>");
					jQuery(".uos_profile_info").append("<h4>" + user[0]['year_of_study'] + "rd year student studying " + user[0]['program'] + "</h4>");
					jQuery(".uos_profile_info").append("<h4>Lives in: " + user[0]['city'] + "</h4>");
				}
			});
		}
	});


	show_my_groups();
}

/* Show a list of groups that a user might be interested in joining */
function show_recommended_groups()
{
	jQuery(".uos_groups_to_recommend").empty();

	// Load the recommended groups
	var groups = [];

	$.ajax({
		url: 'studygroups/recommended',
		method: 'GET',
		success: function(response)
		{
			groups = response;
			console.log(groups);

			if (groups.length == 0)
			{
				alert("No recommended groups at this time.");
			}
			else
			{
				// Show a preset list of recommended group results in a JSON list
				for (var i = 0; i < groups.length; i++)
				{
					var data = "<div class = 'uos_group_rec w3-third'>" +
							"<img src = '" + groups[i]['img'] + "'>" +
							"<div class = 'uos_result_info'>" +
								"<div class = 'uos_result_title'>" + groups[i]['group_name'] + "</div>" +
								"<a href = '/group?id=" + groups[i]['group_id'] + "' id = 'uos_open_group'>View profile</a>" +
							"</div>" +
						"</div>";

					jQuery(".uos_groups_to_recommend").append(data);
				}
			}
		},
		error: function(xhr)
		{
			alert(xhr.responseText);
		}
	})

}

/* Show the groups I am a part of */
function show_my_groups()
{
	var study_groups = [];

	$.ajax({
		url: '/studygroups/myGroups',
		method: 'GET',
		dataType: 'json',
		success: function(data)
		{
			study_groups = data;
			jQuery(".uos_my_study_groups").empty();
			jQuery(".uos_my_study_groups").html("<h1>My Study Groups</h1>");

			for (var i = 0; i < study_groups.length; i++)
			{
				var data = "<div class = 'uos_sg'>" +
								"<div class = 'uos_study_group_img'>" +
									"<img src = '" + study_groups[i]['img'] + "'>" +
								"</div>" +
								"<div class = 'uos_study_group_text'>" +
									"<h3>" + study_groups[i]['group_name'] + "</h3>" +
									"<a href = '/group?id=" + study_groups[i]['group_id'] + "' id = 'uos_open_group'>View profile</a>" +
								"</div>" +
							"</div>";

				jQuery(".uos_my_study_groups").append(data);
			}
		}
	});
}

/* Show recent events */
function show_news()
{
	var news = [];

	$.ajax({
		url: '/posts?type=public',
		method: 'GET',
		success: function(response)
		{
			news = response;
			jQuery(".uos_news").empty();

			for (var i = 0; i < news.length; i++)
			{
				var data = "<div class = 'uos_news_post'>" +
								"<h4>" + news[i]['username'] + " posted in " + news[i]['group_name'] + ": </h4>" +
								"<p>" + news[i]['post'] + "</p>" +
							"</div>";

				jQuery(".uos_news").append(data);
			}
		}
	});
}

/* Take me to the study group from the profile */
function go_to_group()
{
	jQuery(".uos_profile_bar").hide();
	jQuery(".uos_study_group").show();
}

/* Take me to the study group from the recommended groups section */
function go_to_recommended_group()
{
	jQuery(".uos_recommended_groups").hide();
	jQuery(".uos_study_group").show();
}

/* Take me to the study groups from a search result */
function go_to_result()
{
	jQuery(".uos_advanced_search").hide();
	jQuery(".uos_study_group").show();
}

jQuery(document).ready(function()
{
	jQuery(".uos_news, .uos_advanced_search, .uos_study_group, .uos_map").hide();
	jQuery(".uos_profile_bar").show();
	show_user_info();

	jQuery(".uos_open_menu").click(open_menu);
	jQuery(".uos_news_feed_header ul li a").click(open_tab);
	jQuery("#map").click(start);
	jQuery(".uos_terminate").click(delete_user);
	jQuery("input[name='group_size']").on('change', edit_group_size_text);
	jQuery(".uos_search_btn").click(basic_search);
	jQuery(".uos_search").click(show_adv_search_res);
	jQuery("#recommended_groups").click(show_recommended_groups);
	jQuery("#profile_bar").click(show_user_info);
	jQuery("#news").click(show_news);
	jQuery(".uos_my_study_groups").on("click", "#uos_open_group", go_to_group);
	jQuery(".uos_groups_to_recommend").on('click', '#uos_open_group', go_to_recommended_group);
	jQuery(".uos_advanced_results").on('click', '#uos_open_group', go_to_result);
});
