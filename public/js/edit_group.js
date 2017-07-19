// Replace
function load_group_data()
{
    $.ajax({
        url: '/studygroups?id=' + get_group_id(),
        method: 'GET',
        success: function(response)
        {
            console.log(response);
            // Render on the update group page
            jQuery("input[name='groupname']").val(response[0]['group_name']);
            jQuery("textarea[name='description']").val(response[0]['description']);
            jQuery("input[name='room']").val(response[0]['room']);
            jQuery("input[name='location']").val(response[0]['location']);
            jQuery("select[name='day']").val(response[0]['day']);
            jQuery("input[name='time']").val(response[0]['time'].split(" ")[0]);
        },
        error: function(xhr)
        {
            alert(xhr.responseText);
        }
    });
}

function update_user(e)
{
	e.preventDefault();
	$.ajax({
		url: '/studygroups?id=' + get_group_id(),
		method: 'PUT',
		data: update_data(jQuery(".uos_edit_input")),
		success: function(response)
		{
			alert("Group updated");
			window.location.href = '/group?id=' + get_group_id();
		},
		error: function(xhr)
		{
			alert(xhr.responseText);
		}
	});
}

jQuery(document).ready(function()
{
    load_group_data();

    jQuery(".uos_update_form").submit(update_user);
});
