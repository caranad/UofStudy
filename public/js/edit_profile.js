/* Update the profile of the user */

function get_current_info()
{
	$.ajax({
		url: '/users/userData',
		method: 'GET',
		dataType: 'json',
		success: function(data)
		{
			var user = data;
			jQuery(".uos_username").html(user);

			$.ajax({
				url: '/users?username=' + user,
				method: 'GET',
				dataType: 'json',
				success: function(data)
				{
					var user = data[0];

					jQuery("input[name='username']").val(data[0]['username']);
					jQuery("input[name='name']").val(data[0]['name']);
					jQuery("select[name='program']").val(data[0]['program']);
					jQuery("input[name='year_of_study']").val(data[0]['year_of_study']);
					jQuery("input[name='email']").val(data[0]['email']);
				}
			});
		}
	});
}

jQuery(document).ready(function()
{
	get_current_info();

	jQuery(".uos_edit_form").submit(function(e)
	{
		e.preventDefault();
		$.ajax({
			url: '/users',
			method: 'PUT',
			data: update_data(jQuery(".uos_edit_input")),
			success: function(response)
			{
				alert("User updated");
				window.location.href = '/news';
			},
			error: function(xhr)
			{
				alert(xhr.responseText);
			}
		});
	});
});
