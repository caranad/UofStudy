function update_data(input)
{
	var data = {};

	for (var i = 0; i < input.length; i++)
	{
		if (input.eq(i).val() != "")
		{
			data[input.eq(i).attr("name")] = input.eq(i).val();
		}
	}

	return data;
}

function get_group_id()
{
	var url = window.location.search;
	url = url.substr(url.indexOf("=") + 1);
	return url;
}

function open_menu()
{
    jQuery(".uos_menu").toggle();
}
