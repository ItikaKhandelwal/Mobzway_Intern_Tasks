function renderUsers(users) {
  $('#userCount').text(users.length);
  if (!users.length) {
    $('#usersTableWrap').html('<div class="empty">No MongoDB records found yet.</div>');
    return;
  }

  $('#usersBody').html(users.map((user) => `
    <tr data-user-id="${escapeHtml(user._id)}" tabindex="0">
      <td>${escapeHtml(`${user.firstName} ${user.lastName}`)}</td>
      <td>${escapeHtml(user.email)}</td>
      <td>${escapeHtml(user.mobile)}</td>
      <td>${escapeHtml(user.loginId)}</td>
      <td>${escapeHtml(formatDate(user.createdAt))}</td>
    </tr>
  `).join(''));
}

function loadUsers() {
  $('#pageStatus').removeClass('error').addClass('info').text('Loading MongoDB records…').show();
  $.ajax({ url: '/api/users', method: 'GET', dataType: 'json' })
    .done((response) => {
      renderUsers(response.data || []);
      $('#pageStatus').hide();
    })
    .fail((xhr) => {
      $('#pageStatus')
        .removeClass('info')
        .addClass('error')
        .text(xhr.responseJSON?.message || 'Unable to load users.')
        .show();
    });
}

$('#usersBody').on('click', 'tr', function () {
  fetchAndOpenUser($(this).data('user-id'));
});

$('#usersBody').on('keydown', 'tr', function (event) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    fetchAndOpenUser($(this).data('user-id'));
  }
});

$('#refreshUsers').on('click', loadUsers);
loadUsers();
