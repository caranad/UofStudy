var inGroup = false;

function get_group_id()
{
	var url = window.location.search;
	url = url.substr(url.indexOf("=") + 1);
	return url;
}


/* AJAX requests currently logged in users' information */
function get_user()
{
	$.ajax({
		url: '/users/userData',
		method: 'GET',
		dataType: 'json',
		success: function(data)
		{
			jQuery("span#username").html(data);
			window.username = data;
			console.log('username set');
			get_user_role();
			get_user_data();
		}
	});
}

/* AJAX requests for currently logged in user's data and runs callback on data */
function get_user_data() {
	$.get('/users/?username=' + window.username, null, function(data) {
		window.user_data = data[0];
		console.log(window.user_data);
		get_group_info();
		get_group_members();
		get_group_posts();
	});
}

/* Gets the role of the current user */
function get_user_role()
{
	$.ajax({
		url: '/studygroups/myRole?id=' + get_group_id(),
		method: 'GET'
	});
}

function get_group_info()
{
	$.ajax({
		url: '/studygroups?id=' + get_group_id(),
		method: 'GET',
		success: function(response)
		{
			var group_info = response;

			jQuery("title").html(group_info[0].group_name);
			jQuery(".uos_group_title").html(group_info[0].group_name);
			jQuery(".uos_group_desc").html(group_info[0].description);
			jQuery(".uos_group_desc").html("Meets every " + group_info[0].day + " " + group_info[0].time);
		},
		error: function(response)
		{
			alert("Group does not exist.");
			window.location.href = '/news';
		}
	});
}

/* AJAX requests the hidden posts for currently logged in user and runs a callback */
function get_hidden_posts(cb) {
	$.get('/posts/hide?user_id=' + window.user_data.id, null, function(data) {
		cb(data);
	});
}


/* Requests and renders the groups' post for the current user, taking into
 * account hidden and flagged posts.
 */
function get_group_posts()
{
	$.ajax({
		url: '/posts?group=' + get_group_id(),
		method: 'GET',
		success: function(response)
		{
			// Load the group posts
			var group_posts = response;


			get_hidden_posts(function (hidden_posts) {
				// get the difference of the group posts and hidden posts
				var hidden_ids = hidden_posts.map(function (p) { return p.id;});
				var show = group_posts.filter(function (post) {
					return !(post.id in hidden_ids);
				});

				// map each post to appropriate HTML
				show.forEach(function(post) {
					// create the HTML template
					var the_post = "<div class = 'uos_the_post' data-post = " + post.id + ">" +
								 "<h3>" + post.username + " posted: </h3>" +
								 "<button class='uos_hide_btn'>Hide</button>" +
								 "<p>" + post.post + "</p>" +
								 "<p>Posted at: " + post.time + "</p>";

					// add a comment only section if in group
					if (inGroup) {
						the_post += "<div class = 'uos_comment_input'>" +
					    "<input type = 'text' name = 'comment' data-post-id = " + post.id + ">" +
						"</div>" +
						"<div class = 'uos_submit_comment'>" +
						"<button class = 'uos_add_comment w3-btn w3-blue'>Add comment</button>" +
						"</div>";
					}

					the_post += "<h4>Comments</h4>" +
								"<div class = 'uos_comment_space'>" +
								"</div>" +
								"</div>";

					// add to the body
					jQuery(".uos_group_posts_area").append(the_post);
				});

			});

			get_comments();
		},
		error: function(xhr)
		{
			alert(xhr.responseText);
		}
	});
}

function get_group_members()
{
	jQuery(".uos_group_members_list").empty();
	$.ajax({
		url: '/studygroups/members?id=' + get_group_id(),
		method: 'GET',
		success: function(response)
		{
			var group_members = response;
			var found = false;
			var group_member = "";

			for (var i = 0; i < group_members.length; i++)
			{
				if (window.username === group_members[i].username && found === false)
				{
					inGroup = true;
					jQuery(".uos_post_input_area").html(
						"<input type = 'text' placeholder = 'Enter your post here...' class = 'uos_post_input'>" +
						"<button class = 'w3-btn uos_post'>Post</button>");
					jQuery(".uos_group_in ul").html(
						"<li><a href = '#' class = 'uos_group_members'>View group members</a></li>" +
						"<li><a href = '#' class = 'uos_add_members'>Add group members</a></li>" +
						"<li><a href = '/updateGroup?id=" + get_group_id() + "' class = 'uos_edit_info'>Edit group info</a></li>" +
						"<li><a href = '#' class = 'uos_report_group'>Report group</a></li>" +
						"<li><a href = '#' class = 'uos_leave_group'>Leave group</a></li>" +
						"<li><a href = '#' class = 'uos_delete_group'>Delete group</a></li>");
					found = true;
				}

				group_member += "<div class = 'uos_group_member'>" +
										"<img src = '" + group_members[i].img + "'>" +
										"" + group_members[i].name + "(<span id = 'gm'>" + group_members[i].username + "</span>) <br>" +
										"<button class = ' w3-btn w3-red uos_delete_member'>Delete member</button>" +
									"</div>";

				jQuery(".uos_group_members_list").append(group_member);
			}

			// Default sidebar menu options
			if (!found)
			{
				jQuery(".uos_group_in ul").html(
					"<li><a href = '#' class = 'uos_join_group'>Join group</a></li>" +
					"<li><a href = '#' class = 'uos_report_group'>Report group</a></li>");
			}
		}
	});
}

/* POST a post to the study group and reloads the page */
function create_post()
{
	var id = jQuery(".uos_comment_input input").eq(0).attr("data-post-id");
	id = parseInt(id) + 1;

	var my_post = "<div class = 'uos_the_post' data-post = " + id + ">" +
					 "<h3>" + window.username + " posted: </h3>" +
					 "<p>" + jQuery(".uos_post_input_area input").val() + "</p>" +
					 "<p>Posted at: " + new Date() + "</p>" +
					 "<div class = 'uos_comment_input'>" +
					 	"<input type = 'text' name = 'comment' data-post-id = " + (id) + ">" +
					 "</div>" +
					 "<div class = 'uos_submit_comment'>" +
					 	"<button class = 'uos_add_comment w3-btn w3-blue'>Add comment</button>" +
					 "</div>" +
					 "<h4>Comments</h4>" +
					 "<div class = 'uos_comment_space'>" +
					 "</div>" +
				  "</div>";
	jQuery(".uos_study_group_content .uos_post_input_area input").val("");

	$.ajax({
		url: '/posts',
		method: 'POST',
		data:
		{
			group_id: get_group_id(),
			post_content: jQuery(".uos_post_input_area input").val(),
			pubpr: jQuery("input[name='pubpr']:checked").val()
		}
	});

	window.location.reload();
}

/* Hides the post from the user if successful */
function hide_post() {
	var parent = $(this).parent();
	var post_id = parent.attr("data-post");

	$.ajax({
		url: '/posts/hide',
		method: 'POST',
		success: function (response) {
			// hide the post
			console.log(response);
			parent.slideUp();
		},
		data: {
			post_id: post_id,
			user_id: window.user_data.id
			},
		error: function(xhr) {
				alert(xhr.responseText);
		}
	});
}

function get_comments()
{
	var posts = jQuery(".uos_the_post");

	for (var i = 0; i < posts.length; i++)
	{
		$.ajax({
			url: '/comments?id=' + posts.eq(i).attr("data-post"),
			method: 'GET',
			success: function(response)
			{
				var comments = response;

				if (comments.length > 0)
				{
					for (var i = 0; i < comments.length; i++)
					{
						var comment = "<div class = 'uos_comment'>" +
									  	  "<span class = 'uos_bold'>" + comments[i].username + "</span>: " + comments[i].comment +
									  "</div>";
						jQuery(".uos_the_post[data-post=" + comments[i].id + "] .uos_comment_space").append(comment);
					}
				}
			}
		});
	}
}

function delete_group()
{
	var conf_delete = confirm("Are you sure you want to delete the group?");

	if (conf_delete)
	{
		$.ajax({
			url: '/studygroups?id=' + get_group_id(),
			method: 'DELETE',
			success: function(response)
			{
				alert("Group deleted successfully.");
				window.location.href = '/news';
			},
			error: function(xhr)
			{
				alert(xhr.responseText);
			}
		});
	}
}

/* Leave group */
function leave_group()
{
	var leave = confirm("Are you sure you want to leave the group: " + jQuery(".uos_group_title").html() + "?");

	if (leave)
	{
		$.ajax({
			url: '/studygroups/removeMember?id=' + get_group_id(),
			method: 'DELETE',
			data: {
				username: window.username
			},
			success: function(response)
			{
				window.location.href = "/news";
			},
			error: function(xhr)
			{
				alert(xhr.responseText);
			}
		});
	}
}

/* Report group */
function report_group()
{
	var reason = prompt("Enter a reason why you are reporting the group: ");
	var confirm_report = confirm("You have reported this group for the following reason: " + reason + ". Do you wish to continue?");

	if (confirm_report && reason.trim() != "")
	{
		$.ajax({
			url: 'studygroups/report?id=' + get_group_id(),
			method: 'POST',
			data: {
				report: reason.trim()
			},
			success: function(response)
			{
				alert(response);
			},
			error: function(xhr)
			{
				alert(xhr.responseText);
			}
		});
	}
	else
	{
		alert("Report canceled.");
	}
}

/* Show people who are in your group */
function show_group_members()
{
	jQuery(".uos_modal").hide();
	jQuery(".uos_group_info").css("opacity", "0.5");
	jQuery(".uos_group_info").css("pointer-events", "none");
	jQuery(".uos_group_posts").css("opacity", "0.5");
	jQuery(".uos_group_posts").css("pointer-events", "none");
	jQuery(".uos_group_members_modal").show();
	jQuery(".uos_study_group_content").css("opacity", "0.5");
	jQuery(".uos_study_group_content").css("pointer-events", "none");
	get_group_members();
}

/* Close a modal when it opens */
function close_modal()
{
	jQuery(this).parent().hide();
	jQuery(".uos_group_info").css("opacity", "1");
	jQuery(".uos_group_info").css("pointer-events", "auto");
	jQuery(".uos_group_posts").css("opacity", "1");
	jQuery(".uos_group_posts").css("pointer-events", "auto");
	jQuery(".uos_study_group_content").css("opacity", "1");
	jQuery(".uos_study_group_content").css("pointer-events", "auto");
}

/* Remove a member */
function remove_member()
{
	var conf = confirm("Are you sure you want to remove this user?");

	if (conf)
	{
		$.ajax({
			url: '/studygroups/removeMember?id=' + get_group_id(),
			method: 'DELETE',
			data: {
				username: jQuery("span#gm").html()
			},
			success: function(response)
			{
				alert("Removal of user successful.");
				window.location.reload();
			},
			error: function(xhr)
			{
				alert(xhr.responseText);
			}
		});
	}
}

/* Open the modal when user wants to add a member */
function add_member()
{
	jQuery(".uos_modal").hide();
	jQuery(".uos_group_info").css("opacity", "0.5");
	jQuery(".uos_group_info").css("pointer-events", "none");
	jQuery(".uos_group_posts").css("opacity", "0.5");
	jQuery(".uos_group_posts").css("pointer-events", "none");
	jQuery(".uos_add_group_member").show();
}



function post_comment()
{
	// console.log(jQuery(this).parent().parent().find(".uos_comment_space"));
	var comment = jQuery(this).parent().parent().find(".uos_comment_input input").val();

	var commentHTML = "<div class = 'uos_comment'>" +
					   		"<span class = 'uos_bold'>" + window.username + "</span>: " + comment +
					  "</div>";
	jQuery(this).parent().parent().find(".uos_comment_space").append(commentHTML);

	$.ajax({
		url: '/comments',
		method: 'POST',
		data: {
			post_id: jQuery(this).parent().parent().attr("data-post"),
			username: window.username,
			comment: comment
		},
		error: function(xhr)
		{
			alert(xhr.responseText);
		}
	});
}

/* Send invite to user to join group */
function send_invite()
{
	$.ajax({
		url: 'studygroups/addMember',
		method: 'POST',
		data:
		{
			id: get_group_id(),
			username: jQuery("input[name='username']").val().trim()
		},
		success: function(response)
		{
			alert("You have added " + jQuery("input[name='username']").val() + " to your group.");
			window.location.reload();
		},
		error: function(xhr)
		{
			alert(xhr.responseText);
		}
	});
}

function send_request()
{
	$.ajax({
		url: '/posts',
		method: 'POST',
		data:
		{
			group_id: get_group_id(),
			pubpr: 'private',
			post_content: window.username + " would like to join group " + get_group_id() + ". To accept, enter his username in the 'Add group member' modal."
		},
		success: function(response)
		{
			window.location.reload();
		},
		error: function(xhr)
		{
			alert(xhr.responseText);
		}
	});
}

jQuery(document).ready(function()
{
	// Load group information
	// console.log('document ready');
	get_user();

	jQuery(".uos_close").click(close_modal);
	jQuery(".uos_open_menu").click(open_menu);
	jQuery(".uos_group_members_list").on('click', ".uos_delete_member", remove_member);
	jQuery(".uos_group_in").on('click', ".uos_leave_group", leave_group);
	jQuery(".uos_group_in").on('click', ".uos_report_group", report_group);
	jQuery(".uos_group_in").on('click', ".uos_group_members", show_group_members);
	jQuery(".uos_group_in").on('click', ".uos_add_members", add_member);
	jQuery(".uos_group_in").on('click', ".uos_delete_group", delete_group);
	jQuery(".uos_group_in").on('click', ".uos_join_group", send_request);
	jQuery(".uos_post_input_area").on('click', ".uos_post", create_post);
	jQuery(".uos_add_members").click(add_member);
	jQuery(".uos_add_form form").submit(send_invite);
	jQuery(".uos_add_form").on('click', ".uos_send_request", send_invite);
	jQuery(".uos_group_posts_area").on('click', ".uos_add_comment", post_comment);
	jQuery(".uos_group_posts_area").on('click', ".uos_hide_btn", hide_post);
});
