/* Take the user to register.html when clicked */
function go_to_register()
{
	window.location.href = "/register";
}

function open_login_modal()
{
	jQuery("#uos_login_modal").show();
}

function close_login_modal()
{
	 jQuery("#uos_login_modal").hide();
}

jQuery(document).ready(function()
{
	// Check for error
	if (window.location.href.indexOf("?") > 0)
	{
		open_login_modal();
		jQuery(".uos_errors").html("Username could not be found.");
	}

	jQuery(".uos_signup").click(go_to_register);
	jQuery("#uos_open_login_modal").click(open_login_modal);
	jQuery("#uos_close_login_modal").click(close_login_modal);
});
